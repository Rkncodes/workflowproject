package com.civicflow.workflow;

import com.civicflow.model.Application;
import com.civicflow.model.DepartmentReview;
import com.civicflow.model.Notification;
import com.civicflow.model.User;
import com.civicflow.repository.ApplicationRepository;
import com.civicflow.repository.DepartmentReviewRepository;
import com.civicflow.repository.UserRepository;
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
public class DepartmentEscalationWorker {

    private final ApplicationRepository applicationRepository;
    private final DepartmentReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final NotificationAndAuditService auditService;

    @JobWorker(type = "department-escalation-worker", autoComplete = true)
    public Map<String, Object> handleEscalation(final ActivatedJob job) {
        Long applicationId = ((Number) job.getVariable("applicationId")).longValue();
        log.warn("[Camunda Timer Boundary Event] Review Timeout Escalation triggered for Application ID: {}", applicationId);

        Application application = applicationRepository.findById(applicationId).orElse(null);
        if (application != null) {
            application.setIsOverdue(true);
            application.setOverdueDepartments("FIRE_SAFETY");
            applicationRepository.save(application);

            reviewRepository.findByApplicationIdAndDepartment(applicationId, DepartmentReview.DepartmentName.FIRE_SAFETY)
                    .ifPresent(r -> {
                        r.setIsOverdue(true);
                        r.setComments("Automated SLA Timeout Escalation: Review exceeded prescribed SLA duration.");
                        reviewRepository.save(r);
                    });

            auditService.logAudit(applicationId, "REVIEW_TIMEOUT_ESCALATION", "Camunda Timer Event", "SYSTEM",
                    "Departmental review exceeded time window. Escalated to Municipal Administrator.");

            // Notify all admins
            List<User> admins = userRepository.findByRole(User.UserRole.ADMIN);
            for (User admin : admins) {
                auditService.sendNotification(admin, applicationId,
                        "SLA Escalation Alert - App #" + application.getApplicationNumber(),
                        "Application #" + application.getApplicationNumber() + " is overdue in Fire Safety review.",
                        Notification.NotificationType.ESCALATION);
            }
        }

        return Map.of("escalationHandled", true);
    }
}

