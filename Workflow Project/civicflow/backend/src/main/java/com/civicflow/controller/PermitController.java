package com.civicflow.controller;

import com.civicflow.model.Permit;
import com.civicflow.repository.PermitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;

@RestController
@RequestMapping("/permits")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PermitController {

    private final PermitRepository permitRepository;

    @GetMapping("/{applicationId}")
    public ResponseEntity<Permit> getPermitByApplication(@PathVariable Long applicationId) {
        return permitRepository.findByApplicationId(applicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{applicationId}/download")
    public ResponseEntity<Resource> downloadPermitPdf(@PathVariable Long applicationId) {
        Permit permit = permitRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new RuntimeException("Permit not found for application: " + applicationId));

        if (permit.getPdfFilePath() == null) {
            return ResponseEntity.notFound().build();
        }

        File file = new File(permit.getPdfFilePath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + permit.getPermitNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}

