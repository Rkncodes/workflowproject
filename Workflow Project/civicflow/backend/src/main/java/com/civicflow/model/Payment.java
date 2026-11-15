package com.civicflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(nullable = false, unique = true, length = 100)
    private String transactionId;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private LocalDateTime paymentDate;
    private String receiptNumber;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (paymentMethod == null) paymentMethod = PaymentMethod.MOCK_GATEWAY;
        if (paymentStatus == null) paymentStatus = PaymentStatus.PENDING;
    }

    public enum PaymentMethod {
        CREDIT_CARD, DEBIT_CARD, NET_BANKING, UPI, MOCK_GATEWAY
    }

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED
    }
}

