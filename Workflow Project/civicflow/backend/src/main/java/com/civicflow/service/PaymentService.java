package com.civicflow.service;

import com.civicflow.dto.PaymentRequest;
import com.civicflow.model.Application;
import com.civicflow.model.DepartmentReview;
import com.civicflow.model.Payment;
import com.civicflow.model.Permit;
import com.civicflow.repository.ApplicationRepository;
import com.civicflow.repository.DepartmentReviewRepository;
import com.civicflow.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ApplicationRepository applicationRepository;
    private final DepartmentReviewRepository reviewRepository;
    private final PermitPdfGeneratorService pdfGeneratorService;
    private final NotificationAndAuditService auditService;

    @Transactional
    public Payment processPayment(PaymentRequest request) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found: " + request.getApplicationId()));

        String txnId = "TXN-MC-2026-" + (int)(Math.random() * 90000 + 10000);
        String receipt = "REC-CF-" + application.getId() + "-" + System.currentTimeMillis() % 10000;

        if (request.isSimulateFailure()) {
            Payment failedPayment = Payment.builder()
                    .application(application)
                    .transactionId(txnId)
                    .amount(request.getAmount())
                    .paymentMethod(request.getPaymentMethod())
                    .paymentStatus(Payment.PaymentStatus.FAILED)
                    .paymentDate(LocalDateTime.now())
                    .receiptNumber(receipt)
                    .build();

            failedPayment = paymentRepository.save(failedPayment);
            auditService.logAudit(application.getId(), "PAYMENT_FAILED", "Citizen / Mock Gateway",
                    "APPLICANT", "Payment of INR " + request.getAmount() + " failed at gateway. Retry allowed.");

            return failedPayment;
        }

        Payment successfulPayment = Payment.builder()
                .application(application)
                .transactionId(txnId)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : Payment.PaymentMethod.MOCK_GATEWAY)
                .paymentStatus(Payment.PaymentStatus.SUCCESS)
                .paymentDate(LocalDateTime.now())
                .receiptNumber(receipt)
                .build();

        successfulPayment = paymentRepository.save(successfulPayment);

        application.setStatus(Application.ApplicationStatus.PAYMENT_COMPLETED);
        application.setCurrentStage("Payment Completed - Generating Permit");
        applicationRepository.save(application);

        auditService.logAudit(application.getId(), "PAYMENT_SUCCESS", "Citizen / Mock Gateway",
                "APPLICANT", "Payment of INR " + request.getAmount() + " successfully processed (TXN: " + txnId + ")");

        // Generate official Permit & PDF immediately
        List<DepartmentReview> reviews = reviewRepository.findByApplicationId(application.getId());
        Permit permit = pdfGeneratorService.generatePermit(application, reviews);

        application.setStatus(Application.ApplicationStatus.PERMIT_ISSUED);
        application.setPermitNumber(permit.getPermitNumber());
        application.setCurrentStage("Permit Issued");
        applicationRepository.save(application);

        return successfulPayment;
    }
}

