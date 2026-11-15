package com.civicflow.service;

import com.civicflow.dto.ApplicationSubmitRequest;
import com.civicflow.model.Application;
import com.civicflow.model.DepartmentReview;
import com.civicflow.model.Notification;
import com.civicflow.model.User;
import com.civicflow.repository.ApplicationRepository;
import com.civicflow.repository.DepartmentReviewRepository;
import com.civicflow.repository.UserRepository;
import io.camunda.zeebe.client.ZeebeClient;
import io.camunda.zeebe.client.api.response.ProcessInstanceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final DepartmentReviewRepository reviewRepository;
    private final NotificationAndAuditService auditService;

    @Autowired(required = false)
    private ZeebeClient zeebeClient;

    @Transactional
    public Application submitApplication(ApplicationSubmitRequest request) {
        User applicant = userRepository.findById(request.getApplicantId())
                .orElseThrow(() -> new RuntimeException("Applicant not found: " + request.getApplicantId()));

        String appNumber = "CF-2026-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));

        Application application = Application.builder()
                .applicationNumber(appNumber)
                .applicant(applicant)
                .projectName(request.getProjectName())
                .applicantType(request.getApplicantType())
                .propertyAddress(request.getPropertyAddress())
                .city(request.getCity())
                .pinCode(request.getPinCode())
                .surveyNumber(request.getSurveyNumber())
                .plotArea(request.getPlotArea())
                .buildingType(request.getBuildingType())
                .numberOfFloors(request.getNumberOfFloors())
                .proposedBuildingArea(request.getProposedBuildingArea())
                .status(Application.ApplicationStatus.SUBMITTED)
                .currentStage("Application Submitted")
                .revisionCount(0)
                .maxRevisions(3)
                .landVerificationStatus(Application.LandStatus.PENDING)
                .calculatedFee(0.0)
                .isOverdue(false)
                .build();

        application = applicationRepository.save(application);

        // Pre-create pending reviews for the 4 statutory departments
        for (DepartmentReview.DepartmentName dept : DepartmentReview.DepartmentName.values()) {
            DepartmentReview review = DepartmentReview.builder()
                    .application(application)
                    .department(dept)
                    .status(DepartmentReview.ReviewStatus.PENDING)
                    .build();
            reviewRepository.save(review);
        }

        auditService.logAudit(application.getId(), "APPLICATION_SUBMITTED", applicant.getFullName(),
                applicant.getRole().name(), "Application created with project: " + application.getProjectName());

        auditService.sendNotification(applicant, application.getId(),
                "Application Submitted - " + application.getApplicationNumber(),
                "Your application has been received and scheduled for automated verification.",
                Notification.NotificationType.INFO);

        // Start Camunda 8 Zeebe Process Instance
        startCamundaProcessInstance(application);

        return application;
    }

    public void startCamundaProcessInstance(Application application) {
        if (zeebeClient != null) {
            try {
                Map<String, Object> variables = new HashMap<>();
                variables.put("applicationId", application.getId());
                variables.put("applicationNumber", application.getApplicationNumber());
                variables.put("surveyNumber", application.getSurveyNumber());
                variables.put("buildingType", application.getBuildingType().name());
                variables.put("proposedArea", application.getProposedBuildingArea());
                variables.put("numberOfFloors", application.getNumberOfFloors());
                variables.put("plotArea", application.getPlotArea());

                ProcessInstanceEvent event = zeebeClient.newCreateInstanceCommand()
                        .bpmnProcessId("Process_MunicipalBuildingPermit")
                        .latestVersion()
                        .variables(variables)
                        .send()
                        .join();

                application.setCamundaProcessInstanceKey(event.getProcessInstanceKey());
                applicationRepository.save(application);
                log.info("Started Camunda 8 Process Instance Key: {} for Application #{}",
                        event.getProcessInstanceKey(), application.getApplicationNumber());
            } catch (Exception e) {
                log.warn("Camunda Zeebe broker not connected or process not yet deployed: {}. Local state preserved.", e.getMessage());
            }
        } else {
            log.warn("Zeebe client bean is not active. Process instance start skipped for App #{}", application.getApplicationNumber());
        }
    }
}

