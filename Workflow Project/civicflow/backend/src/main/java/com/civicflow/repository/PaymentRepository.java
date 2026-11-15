package com.civicflow.repository;

import com.civicflow.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByApplicationId(Long applicationId);
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findAllByOrderByCreatedAtDesc();
}

