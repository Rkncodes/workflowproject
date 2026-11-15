package com.civicflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "department_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DepartmentName department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "officer_id")
    private User officer;

    private String officerName;

    @Enumerated(EnumType.STRING)
    private ReviewStatus status;

    @Column(columnDefinition = "TEXT")
    private String comments;

    private String camundaTaskId;

    private LocalDateTime reviewedAt;

    @Builder.Default
    private Boolean isOverdue = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = ReviewStatus.PENDING;
        if (isOverdue == null) isOverdue = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum DepartmentName {
        FIRE_SAFETY, WATER, ZONING, ENVIRONMENTAL
    }

    public enum ReviewStatus {
        PENDING, APPROVED, REJECTED, REVISION_REQUESTED
    }
}

