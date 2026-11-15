package com.civicflow.repository;

import com.civicflow.model.DepartmentReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DepartmentReviewRepository extends JpaRepository<DepartmentReview, Long> {
    List<DepartmentReview> findByApplicationId(Long applicationId);
    List<DepartmentReview> findByDepartment(DepartmentReview.DepartmentName department);
    List<DepartmentReview> findByDepartmentAndStatus(DepartmentReview.DepartmentName department, DepartmentReview.ReviewStatus status);
    Optional<DepartmentReview> findByApplicationIdAndDepartment(Long applicationId, DepartmentReview.DepartmentName department);
    List<DepartmentReview> findByIsOverdueTrue();
    long countByDepartmentAndStatus(DepartmentReview.DepartmentName department, DepartmentReview.ReviewStatus status);
}

