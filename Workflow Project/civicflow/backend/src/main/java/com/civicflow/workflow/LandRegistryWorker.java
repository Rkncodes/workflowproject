package com.civicflow.workflow;

import com.civicflow.model.Application;
import com.civicflow.model.DepartmentReview;
import com.civicflow.model.Notification;
import com.civicflow.repository.ApplicationRepository;
import com.civicflow.repository.DepartmentReviewRepository;
import com.civicflow.service.MockLandRegistryService;
import com.civicflow.service.NotificationAndAuditService;
import io.camunda.zeebe.client.api.response.ActivatedJob;
import io.camunda.zeebe.spring.client.annotation.JobWorker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class LandRegistryWorker {

    private final ApplicationRepository applicationRepository;
    private final DepartmentReviewRepository reviewRepository;
    private final MockLandRegistryService landRegistryService;
    private final NotificationAndAuditService auditService;

    @JobWorker(type = "land-registry-worker", autoComplete = true)
    public Map<String, Object> handleLandRegistryVerification(final ActivatedJob job) {
        Long applicationId = ((Number) job.getVariable("applicationId")).longValue();
        log.info("[Camunda Worker] Starting Land Registry Verification for Application ID: {}", applicationId);

        Application application = applicationRepository.findById(applicationId).orElse(null);
        if (application == null) {
            return Map.of("landRegistryValid", false);
        }

        MockLandRegistryService.LandVerificationResult result =
                landRegistryService.verifySurveyNumber(application.getSurveyNumber());

        if (result.isValid()) {
            application.setLandVerificationStatus(Application.LandStatus.VALID);
            application.setLandVerificationRemarks(result.getMessage());
            application.setStatus(Application.ApplicationStatus.DEPARTMENTAL_REVIEW);
            application.setCurrentStage("Parallel Departmental Review");
            applicationRepository.save(application);

            // Seed the 4 departmental reviews in MySQL if not present
            for (DepartmentReview.DepartmentName dept : DepartmentReview.DepartmentName.values()) {
                if (reviewRepository.findByApplicationIdAndDepartment(applicationId, dept).isEmpty()) {
                    DepartmentReview review = DepartmentReview.builder()
                            .application(application)
                            .department(dept)
                            .status(DepartmentReview.ReviewStatus.PENDING)
                            .build();
                    reviewRepository.save(review);
                }
            }

            auditService.logAudit(applicationId, "LAND_REGISTRY_VERIFIED", "Zeebe Worker", "SYSTEM",
                    "Survey #" + application.getSurveyNumber() + " verified with GIS Land Registry.");

            return Map.of("landRegistryValid", true);
        } else {
            application.setLandVerificationStatus(Application.LandStatus.INVALID);
            application.setLandVerificationRemarks(result.getMessage());
            application.setStatus(Application.ApplicationStatus.REJECTED);
            application.setCurrentStage("Land Registry Rejection");
            applicationRepository.save(application);

            auditService.logAudit(applicationId, "LAND_REGISTRY_REJECTED", "Zeebe Worker", "SYSTEM",
                    "Survey #" + application.getSurveyNumber() + " failed title check: " + result.getMessage());

            auditService.sendNotification(application.getApplicant(), applicationId,
                    "Application Rejected - Land Title Issue",
                    "Your permit application " + application.getApplicationNumber() + " was rejected during GIS Land Registry verification.",
                    Notification.NotificationType.REJECTION);

            return Map.of("landRegistryValid", false);
        }
    }
}

