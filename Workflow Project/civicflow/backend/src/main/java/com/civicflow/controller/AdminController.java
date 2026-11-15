package com.civicflow.controller;

import com.civicflow.dto.AdminDashboardStats;
import com.civicflow.model.Application;
import com.civicflow.model.AuditLog;
import com.civicflow.repository.ApplicationRepository;
import com.civicflow.repository.AuditLogRepository;
import com.civicflow.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final ApplicationRepository applicationRepository;
    private final AuditLogRepository auditLogRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardStats> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/applications")
    public ResponseEntity<List<Application>> getAllApplications() {
        return ResponseEntity.ok(applicationRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs(@RequestParam(required = false) Long applicationId) {
        if (applicationId != null) {
            return ResponseEntity.ok(auditLogRepository.findByApplicationIdOrderByCreatedAtDesc(applicationId));
        }
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByCreatedAtDesc());
    }
}

