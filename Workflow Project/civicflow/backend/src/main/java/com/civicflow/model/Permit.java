package com.civicflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "permits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @Column(nullable = false, unique = true, length = 100)
    private String permitNumber;

    @Column(nullable = false)
    private LocalDate issueDate;

    @Column(nullable = false)
    private LocalDate validUntil;

    @Column(nullable = false)
    private String digitalSignature;

    private String pdfFilePath;
    private String qrCodeToken;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (issueDate == null) issueDate = LocalDate.now();
        if (validUntil == null) validUntil = LocalDate.now().plusYears(3);
    }
}

