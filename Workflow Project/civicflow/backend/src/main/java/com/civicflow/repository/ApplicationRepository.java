package com.civicflow.repository;

import com.civicflow.model.Application;
import com.civicflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Optional<Application> findByApplicationNumber(String applicationNumber);
    List<Application> findByApplicant(User applicant);
    List<Application> findByApplicantIdOrderByCreatedAtDesc(Long applicantId);
    List<Application> findAllByOrderByCreatedAtDesc();
    List<Application> findByStatus(Application.ApplicationStatus status);
    List<Application> findByIsOverdueTrue();

    @Query("SELECT COUNT(a) FROM Application a WHERE a.status = :status")
    long countByStatus(Application.ApplicationStatus status);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.applicant.id = :applicantId AND a.status = :status")
    long countByApplicantIdAndStatus(Long applicantId, Application.ApplicationStatus status);
}

