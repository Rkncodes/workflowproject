package com.civicflow.workflow;

import com.civicflow.model.Application;
import com.civicflow.model.DepartmentReview;
import com.civicflow.model.Notification;
import com.civicflow.repository.ApplicationRepository;
import com.civicflow.repository.DepartmentReviewRepository;
import com.civicflow.service.NotificationAndAuditService;
import io.camunda.zeebe.client.api.response.ActivatedJob;
import io.camunda.zeebe.spring.client.annotation.JobWorker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DecisionEvaluationWorker {

    private final ApplicationRepository applicationRepository;
    private final DepartmentReviewRepository reviewRepository;
    private final NotificationAndAuditService auditService;

    @JobWorker(type = "evaluate-decisions-worker", autoComplete = true)
    public Map<String, Object> evaluateReviews(final ActivatedJob job) {
        Long applicationId = ((Number) job.getVariable("applicationId")).longValue();
        log.info("[Camunda Worker] Evaluating all 4 departmental decisions for App ID: {}", applicationId);

        Application application = applicationRepository.findById(applicationId).orElse(null);
        if (application == null) {
            return Map.of("reviewDecision", "REJECTED");
        }

        List<DepartmentReview> reviews = reviewRepository.findByApplicationId(applicationId);

        boolean hasRejection = reviews.stream().anyMatch(r -> r.getStatus() == DepartmentReview.ReviewStatus.REJECTED);
        boolean hasRevision = reviews.stream().anyMatch(r -> r.getStatus() == DepartmentReview.ReviewStatus.REVISION_REQUESTED);
        boolean allApproved = reviews.size() == 4 && reviews.stream().allMatch(r -> r.getStatus() == DepartmentReview.ReviewStatus.APPROVED);

        String decision;
        if (hasRejection) {
            decision = "REJECTED";
            application.setStatus(Application.ApplicationStatus.REJECTED);
            application.setCurrentStage("Application Rejected by Department");
            auditService.logAudit(applicationId, "APPLICATION_REJECTED", "Zeebe Worker", "SYSTEM",
                    "Application rejected following departmental review.");
            auditService.sendNotification(application.getApplicant(), applicationId,
                    "Application Rejected",
                    "Your building permit application was rejected during statutory departmental review. Check dashboard for remarks.",
                    Notification.NotificationType.REJECTION);
        } else if (hasRevision) {
            decision = "REVISION_REQUESTED";
            int count = (application.getRevisionCount() == null ? 0 : application.getRevisionCount()) + 1;
            application.setRevisionCount(count);

            if (count > application.getMaxRevisions()) {
                decision = "REJECTED";
                application.setStatus(Application.ApplicationStatus.REJECTED);
                application.setCurrentStage("Rejected - Exceeded Max Revisions (" + application.getMaxRevisions() + ")");
                auditService.logAudit(applicationId, "MAX_REVISIONS_EXCEEDED", "Zeebe Worker", "SYSTEM",
                        "Applicant exceeded allowable revision limit of " + application.getMaxRevisions());
            } else {
                application.setStatus(Application.ApplicationStatus.REVISION_REQUIRED);
                application.setCurrentStage("Revision Required (Cycle " + count + " of " + application.getMaxRevisions() + ")");
                auditService.logAudit(applicationId, "REVISION_REQUESTED", "Zeebe Worker", "SYSTEM",
                        "Application returned to applicant for architectural modifications.");
                auditService.sendNotification(application.getApplicant(), applicationId,
                        "Blueprint Revision Required",
                        "One or more municipal departments requested corrections on your submission.",
                        Notification.NotificationType.REVISION);
            }
        } else {
            decision = "APPROVED";
            application.setStatus(Application.ApplicationStatus.PENDING_PAYMENT);
            application.setCurrentStage("Statutory Approvals Complete - Calculating Fees");
            auditService.logAudit(applicationId, "ALL_DEPARTMENTS_APPROVED", "Zeebe Worker", "SYSTEM",
                    "All 4 departments (Fire, Water, Zoning, Environmental) cleared the submission.");
        }

        applicationRepository.save(application);
        return Map.of("reviewDecision", decision);
    }
}

