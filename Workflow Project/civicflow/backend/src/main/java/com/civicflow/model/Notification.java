package com.civicflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Long applicationId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Builder.Default
    private Boolean isRead = false;

    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isRead == null) isRead = false;
        if (notificationType == null) notificationType = NotificationType.INFO;
    }

    public enum NotificationType {
        INFO, APPROVAL, REJECTION, REVISION, ESCALATION, PAYMENT, PERMIT
    }
}

