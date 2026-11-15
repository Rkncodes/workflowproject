package com.civicflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType documentType;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false, length = 500)
    private String filePath;

    private Long fileSize;
    private String mimeType;

    @Builder.Default
    private Boolean isVerified = false;

    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        if (isVerified == null) isVerified = false;
    }

    public enum DocumentType {
        BUILDING_BLUEPRINT,
        LAND_OWNERSHIP_CERTIFICATE,
        SITE_PLAN,
        STRUCTURAL_STABILITY_CERTIFICATE,
        IDENTITY_PROOF,
        REVISED_BLUEPRINT
    }
}

