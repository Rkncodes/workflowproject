package com.civicflow.controller;

import com.civicflow.dto.PaymentRequest;
import com.civicflow.model.Payment;
import com.civicflow.repository.PaymentRepository;
import com.civicflow.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;

    @PostMapping
    public ResponseEntity<Payment> makePayment(@Valid @RequestBody PaymentRequest request) {
        Payment payment = paymentService.processPayment(request);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<?> getPaymentByApplication(@PathVariable Long applicationId) {
        return paymentRepository.findByApplicationId(applicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

