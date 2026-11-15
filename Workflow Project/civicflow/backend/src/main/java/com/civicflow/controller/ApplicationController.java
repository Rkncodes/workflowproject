package com.civicflow.controller;

import com.civicflow.dto.ApplicationSubmitRequest;
import com.civicflow.model.Application;
import com.civicflow.model.Document;
import com.civicflow.repository.ApplicationRepository;
import com.civicflow.repository.DepartmentReviewRepository;
import com.civicflow.repository.DocumentRepository;
import com.civicflow.service.ApplicationService;
import com.civicflow.service.NotificationAndAuditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ApplicationRepository applicationRepository;
    private final DocumentRepository documentRepository;
    private final DepartmentReviewRepository reviewRepository;
    private final NotificationAndAuditService auditService;

    @PostMapping
    public ResponseEntity<Application> createApplication(@Valid @RequestBody ApplicationSubmitRequest request) {
        Application created = applicationService.submitApplication(request);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications(@RequestParam(required = false) Long applicantId) {
        if (applicantId != null) {
            return ResponseEntity.ok(applicationRepository.findByApplicantIdOrderByCreatedAtDesc(applicantId));
        }
        return ResponseEntity.ok(applicationRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getApplicationById(@PathVariable Long id) {
        return applicationRepository.findById(id)
                .map(app -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("application", app);
                    response.put("documents", documentRepository.findByApplicationId(id));
                    response.put("reviews", reviewRepository.findByApplicationId(id));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<?> getApplicationStatus(@PathVariable Long id) {
        return applicationRepository.findById(id)
                .map(app -> Map.of(
                        "applicationNumber", app.getApplicationNumber(),
                        "status", app.getStatus(),
                        "currentStage", app.getCurrentStage(),
                        "revisionCount", app.getRevisionCount(),
                        "calculatedFee", app.getCalculatedFee(),
                        "permitNumber", app.getPermitNumber() != null ? app.getPermitNumber() : ""
                ))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/upload")
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") Document.DocumentType documentType) {

        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Path uploadDir = Paths.get("civicflow-storage", "documents", String.valueOf(id)).toAbsolutePath();
        File dir = uploadDir.toFile();
        if (!dir.exists()) dir.mkdirs();

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
        Path targetPath = uploadDir.resolve(System.currentTimeMillis() + "_" + originalFilename);

        try {
            file.transferTo(targetPath.toFile());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("File upload failed: " + e.getMessage());
        }

        Document document = Document.builder()
                .application(app)
                .documentType(documentType)
                .fileName(originalFilename)
                .filePath(targetPath.toString())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .isVerified(true)
                .build();

        documentRepository.save(document);

        auditService.logAudit(id, "DOCUMENT_UPLOADED", app.getApplicant().getFullName(),
                "APPLICANT", "Uploaded " + documentType + ": " + originalFilename);

        // If uploading revised blueprint, reset department review statuses to PENDING
        if (documentType == Document.DocumentType.REVISED_BLUEPRINT || app.getStatus() == Application.ApplicationStatus.REVISION_REQUIRED) {
            app.setStatus(Application.ApplicationStatus.DEPARTMENTAL_REVIEW);
            app.setCurrentStage("Revised Blueprint Submitted - Re-evaluating Reviews");
            applicationRepository.save(app);

            reviewRepository.findByApplicationId(id).forEach(r -> {
                if (r.getStatus() == com.civicflow.model.DepartmentReview.ReviewStatus.REVISION_REQUESTED) {
                    r.setStatus(com.civicflow.model.DepartmentReview.ReviewStatus.PENDING);
                    r.setComments("Applicant uploaded revised plans. Pending fresh review.");
                    reviewRepository.save(r);
                }
            });

            auditService.logAudit(id, "REVISION_SUBMITTED", app.getApplicant().getFullName(),
                    "APPLICANT", "Uploaded revised documents. Returned to departmental review.");
        }

        return ResponseEntity.ok(document);
    }
}

