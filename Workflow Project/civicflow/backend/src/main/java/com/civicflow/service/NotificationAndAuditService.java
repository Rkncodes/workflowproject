package com.civicflow.service;

import com.civicflow.model.AuditLog;
import com.civicflow.model.Notification;
import com.civicflow.model.User;
import com.civicflow.repository.AuditLogRepository;
import com.civicflow.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationAndAuditService {

    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;

    public void logAudit(Long applicationId, String action, String performedBy, String userRole, String details) {
        AuditLog audit = AuditLog.builder()
                .applicationId(applicationId)
                .action(action)
                .performedBy(performedBy)
                .userRole(userRole)
                .details(details)
                .build();
        auditLogRepository.save(audit);
        log.info("[AUDIT] App #{}: {} by {} ({}) -> {}", applicationId, action, performedBy, userRole, details);
    }

    public void sendNotification(User user, Long applicationId, String title, String message, Notification.NotificationType type) {
        if (user == null) return;
        Notification notification = Notification.builder()
                .user(user)
                .applicationId(applicationId)
                .title(title)
                .message(message)
                .notificationType(type)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
        log.info("[EMAIL NOTIFICATION SIMULATION] Sent to {}: {} - {}", user.getEmail(), title, message);
    }
}

