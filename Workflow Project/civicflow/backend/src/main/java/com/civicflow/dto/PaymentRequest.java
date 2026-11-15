package com.civicflow.dto;

import com.civicflow.model.Payment;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {
    @NotNull
    private Long applicationId;

    @NotNull
    private Double amount;

    private Payment.PaymentMethod paymentMethod;

    private boolean simulateFailure;
}

