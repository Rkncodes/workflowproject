package com.civicflow.repository;

import com.civicflow.model.Permit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PermitRepository extends JpaRepository<Permit, Long> {
    Optional<Permit> findByApplicationId(Long applicationId);
    Optional<Permit> findByPermitNumber(String permitNumber);
}

