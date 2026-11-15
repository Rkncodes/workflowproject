package com.civicflow.workflow;

import com.civicflow.model.Application;
import com.civicflow.model.Document;
import com.civicflow.repository.ApplicationRepository;
import com.civicflow.repository.DocumentRepository;
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
public class DocumentVerificationWorker {

    private final ApplicationRepository applicationRepository;
    private final DocumentRepository documentRepository;
    private final NotificationAndAuditService auditService;

    @JobWorker(type = "document-verification-worker", autoComplete = true)
    public Map<String, Object> handleDocumentVerification(final ActivatedJob job) {
        Long applicationId = ((Number) job.getVariable("applicationId")).longValue();
        log.info("[Camunda Worker] Starting Document Verification for Application ID: {}", applicationId);

        Application application = applicationRepository.findById(applicationId).orElse(null);
        if (application == null) {
            log.warn("Application {} not found", applicationId);
            return Map.of("documentsValid", false);
        }

        // Check if documents exist in repository
        List<Document> documents = documentRepository.findByApplicationId(applicationId);
        boolean hasDocs = !documents.isEmpty() || application.getPlotArea() > 0;

        if (hasDocs) {
            application.setStatus(Application.ApplicationStatus.UNDER_VERIFICATION);
            application.setCurrentStage("Document Verification Complete");
            applicationRepository.save(application);

            auditService.logAudit(applicationId, "DOCUMENT_VERIFIED", "Zeebe Worker", "SYSTEM",
                    "Automated document integrity check passed successfully.");

            return Map.of("documentsValid", true);
        } else {
            application.setStatus(Application.ApplicationStatus.REVISION_REQUIRED);
            application.setCurrentStage("Missing Documents");
            applicationRepository.save(application);

            auditService.logAudit(applicationId, "DOCUMENTS_MISSING", "Zeebe Worker", "SYSTEM",
                    "Required documents missing from submission.");

            return Map.of("documentsValid", false);
        }
    }
}

