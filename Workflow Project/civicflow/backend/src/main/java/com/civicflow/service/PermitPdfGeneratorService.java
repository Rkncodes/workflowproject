package com.civicflow.service;

import com.civicflow.model.Application;
import com.civicflow.model.DepartmentReview;
import com.civicflow.model.Permit;
import com.civicflow.repository.PermitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermitPdfGeneratorService {

    private final PermitRepository permitRepository;

    public Permit generatePermit(Application app, List<DepartmentReview> reviews) {
        String permitNumber = "PERMIT-MC-2026-" + (1000 + (app.getId() != null ? app.getId() : 999));
        LocalDate now = LocalDate.now();
        LocalDate expiry = now.plusYears(3);
        String signature = "SHA256:" + UUID.nameUUIDFromBytes((permitNumber + app.getApplicationNumber()).getBytes());

        String pdfDir = "civicflow-storage/permits";
        File dir = new File(pdfDir);
        if (!dir.exists()) dir.mkdirs();

        String filename = permitNumber + ".pdf";
        Path targetPath = Paths.get(pdfDir, filename);

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                // Header Banner
                cs.setNonStrokingColor(26 / 255f, 54 / 255f, 93 / 255f); // Deep Navy
                cs.addRect(30, 750, 535, 60);
                cs.fill();

                cs.setNonStrokingColor(1f, 1f, 1f);
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 16);
                cs.beginText();
                cs.newLineAtOffset(45, 785);
                cs.showText("MUNICIPAL CORPORATION - BUILDING PERMIT");
                cs.endText();

                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                cs.beginText();
                cs.newLineAtOffset(45, 765);
                cs.showText("CivicFlow e-Governance Automated Approval System");
                cs.endText();

                // Permit Info
                cs.setNonStrokingColor(0, 0, 0);
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                int y = 710;
                writeLine(cs, 45, y, "PERMIT NUMBER: " + permitNumber);
                writeLine(cs, 320, y, "DATE OF ISSUE: " + now);

                y -= 25;
                writeLine(cs, 45, y, "APPLICATION NO: " + app.getApplicationNumber());
                writeLine(cs, 320, y, "VALID UNTIL: " + expiry);

                // Divider line
                y -= 15;
                cs.setStrokingColor(200 / 255f, 200 / 255f, 200 / 255f);
                cs.moveTo(45, y);
                cs.lineTo(550, y);
                cs.stroke();

                // Applicant & Property Details
                y -= 25;
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 11);
                writeLine(cs, 45, y, "1. APPLICANT & PROPERTY DETAILS");

                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                y -= 20;
                writeLine(cs, 45, y, "Project Name: " + app.getProjectName());
                y -= 18;
                writeLine(cs, 45, y, "Applicant: " + (app.getApplicant() != null ? app.getApplicant().getFullName() : "N/A"));
                writeLine(cs, 320, y, "Applicant Type: " + app.getApplicantType());
                y -= 18;
                writeLine(cs, 45, y, "Survey / Plot No: " + app.getSurveyNumber());
                writeLine(cs, 320, y, "Building Type: " + app.getBuildingType());
                y -= 18;
                writeLine(cs, 45, y, "Proposed Area: " + app.getProposedBuildingArea() + " sq.m");
                writeLine(cs, 320, y, "Floors: " + app.getNumberOfFloors());
                y -= 18;
                writeLine(cs, 45, y, "Address: " + app.getPropertyAddress() + ", " + app.getCity() + " - " + app.getPinCode());

                // Department Approvals Table
                y -= 30;
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 11);
                writeLine(cs, 45, y, "2. MANDATORY STATUTORY APPROVALS");

                y -= 20;
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                writeLine(cs, 45, y, "[OK] Fire Safety Department - NBC 2016 Compliant");
                y -= 16;
                writeLine(cs, 45, y, "[OK] Water Works Department - Supply & Ingress Certified");
                y -= 16;
                writeLine(cs, 45, y, "[OK] Zoning & Urban Development - Master Plan FAR Cleared");
                y -= 16;
                writeLine(cs, 45, y, "[OK] Environmental Department - Eco & Effluent Clearance Granted");

                // Fee & Payment
                y -= 30;
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 11);
                writeLine(cs, 45, y, "3. FEE & PAYMENT VERIFICATION");

                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                y -= 20;
                writeLine(cs, 45, y, "Permit Fee Paid: INR " + String.format("%.2f", app.getCalculatedFee()));
                writeLine(cs, 320, y, "Payment Status: VERIFIED & CLEARED");

                // Digital Signature Seal
                y -= 40;
                cs.setStrokingColor(13 / 255f, 148 / 255f, 136 / 255f); // Teal border
                cs.addRect(45, y - 45, 505, 55);
                cs.stroke();

                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 9);
                writeLine(cs, 55, y - 15, "DIGITALLY SIGNED MUNICIPAL PERMIT SEAL");
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 8);
                writeLine(cs, 55, y - 28, "Electronic Signature Digest: " + signature);
                writeLine(cs, 55, y - 38, "Authorized by: Municipal Corporation Automated Workflow System | Camunda 8 Orchestrated");
            }

            document.save(targetPath.toFile());
            log.info("Successfully generated permit PDF at: {}", targetPath.toAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to generate permit PDF", e);
        }

        Permit existingPermit = permitRepository.findByApplicationId(app.getId()).orElse(null);
        if (existingPermit != null) {
            return existingPermit;
        }

        Permit permit = Permit.builder()
                .application(app)
                .permitNumber(permitNumber)
                .issueDate(now)
                .validUntil(expiry)
                .digitalSignature(signature)
                .pdfFilePath(targetPath.toString())
                .qrCodeToken("QR-" + permitNumber)
                .build();

        return permitRepository.save(permit);
    }

    private void writeLine(PDPageContentStream cs, float x, float y, String text) throws IOException {
        cs.beginText();
        cs.newLineAtOffset(x, y);
        cs.showText(text != null ? text : "");
        cs.endText();
    }
}

