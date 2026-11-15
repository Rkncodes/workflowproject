package com.civicflow.controller;

import com.civicflow.service.MockLandRegistryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/land-registry")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LandRegistryController {

    private final MockLandRegistryService landRegistryService;

    @GetMapping("/verify/{surveyNumber}")
    public ResponseEntity<MockLandRegistryService.LandVerificationResult> verifySurveyNumber(
            @PathVariable String surveyNumber) {
        return ResponseEntity.ok(landRegistryService.verifySurveyNumber(surveyNumber));
    }
}

