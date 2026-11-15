package com.civicflow.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MockLandRegistryService {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class LandVerificationResult {
        private String surveyNumber;
        private boolean isValid;
        private String ownershipStatus;
        private String registeredOwner;
        private String zoningCategory;
        private String message;
    }

    public LandVerificationResult verifySurveyNumber(String surveyNumber) {
        log.info("Mock Land Registry verifying survey number: {}", surveyNumber);

        // Pre-configured test scenario: Surveys containing "DISPUTED" or "999" fail verification
        if (surveyNumber != null && (surveyNumber.toUpperCase().contains("DISPUTED") || surveyNumber.contains("999"))) {
            return LandVerificationResult.builder()
                    .surveyNumber(surveyNumber)
                    .isValid(false)
                    .ownershipStatus("DISPUTED_TITLE")
                    .registeredOwner("Litigation Pending - Court Order #482")
                    .zoningCategory("UNAUTHORIZED_ENCROACHMENT")
                    .message("Disputed title litigation pending with Metro Revenue Department.")
                    .build();
        }

        // Standard valid survey
        return LandVerificationResult.builder()
                .surveyNumber(surveyNumber)
                .isValid(true)
                .ownershipStatus("FREEHOLD_CLEARED")
                .registeredOwner("Verified Title Holder")
                .zoningCategory("APPROVED_DEVELOPMENT_ZONE")
                .message("Survey number verified in State GIS & Land Revenue Cadastral Map.")
                .build();
    }
}

