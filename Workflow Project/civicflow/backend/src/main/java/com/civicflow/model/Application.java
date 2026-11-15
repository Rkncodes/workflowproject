package com.civicflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String applicationNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    @Column(nullable = false, length = 150)
    private String projectName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicantType applicantType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String propertyAddress;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 20)
    private String pinCode;

    @Column(nullable = false, length = 50)
    private String surveyNumber;

    @Column(nullable = false)
    private Double plotArea;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BuildingType buildingType;

    @Column(nullable = false)
    private Integer numberOfFloors;

    @Column(nullable = false)
    private Double proposedBuildingArea;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    private String currentStage;

    private Long camundaProcessInstanceKey;

    @Builder.Default
    private Integer revisionCount = 0;

    @Builder.Default
    private Integer maxRevisions = 3;

    @Enumerated(EnumType.STRING)
    private LandStatus landVerificationStatus;

    @Column(columnDefinition = "TEXT")
    private String landVerificationRemarks;

    @Builder.Default
    private Double calculatedFee = 0.0;

    private String permitNumber;

    @Builder.Default
    private Boolean isOverdue = false;

    private String overdueDepartments;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = ApplicationStatus.SUBMITTED;
        if (currentStage == null) currentStage = "Application Submitted";
        if (landVerificationStatus == null) landVerificationStatus = LandStatus.PENDING;
        if (revisionCount == null) revisionCount = 0;
        if (maxRevisions == null) maxRevisions = 3;
        if (calculatedFee == null) calculatedFee = 0.0;
        if (isOverdue == null) isOverdue = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ApplicantType {
        INDIVIDUAL, ARCHITECT, COMPANY
    }

    public enum BuildingType {
        RESIDENTIAL, COMMERCIAL, INDUSTRIAL
    }

    public enum ApplicationStatus {
        SUBMITTED, UNDER_VERIFICATION, DEPARTMENTAL_REVIEW, REVISION_REQUIRED, PENDING_PAYMENT, PAYMENT_COMPLETED, PERMIT_ISSUED, REJECTED
    }

    public enum LandStatus {
        PENDING, VALID, INVALID
    }
}

