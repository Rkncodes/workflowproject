package com.civicflow.service;

import com.civicflow.dto.AdminDashboardStats;
import com.civicflow.model.Application;
import com.civicflow.model.DepartmentReview;
import com.civicflow.repository.ApplicationRepository;
import com.civicflow.repository.DepartmentReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ApplicationRepository applicationRepository;
    private final DepartmentReviewRepository reviewRepository;

    public AdminDashboardStats getDashboardStats() {
        long total = applicationRepository.count();
        long approved = applicationRepository.countByStatus(Application.ApplicationStatus.PERMIT_ISSUED);
        long rejected = applicationRepository.countByStatus(Application.ApplicationStatus.REJECTED);
        long pending = applicationRepository.countByStatus(Application.ApplicationStatus.DEPARTMENTAL_REVIEW) +
                applicationRepository.countByStatus(Application.ApplicationStatus.UNDER_VERIFICATION) +
                applicationRepository.countByStatus(Application.ApplicationStatus.SUBMITTED);
        long revision = applicationRepository.countByStatus(Application.ApplicationStatus.REVISION_REQUIRED);
        long overdue = applicationRepository.findByIsOverdueTrue().size();

        Map<String, Long> statusDistribution = new HashMap<>();
        for (Application.ApplicationStatus status : Application.ApplicationStatus.values()) {
            statusDistribution.put(status.name(), applicationRepository.countByStatus(status));
        }

        Map<String, Long> deptPending = new HashMap<>();
        Map<String, Long> deptApproved = new HashMap<>();
        for (DepartmentReview.DepartmentName dept : DepartmentReview.DepartmentName.values()) {
            deptPending.put(dept.name(), reviewRepository.countByDepartmentAndStatus(dept, DepartmentReview.ReviewStatus.PENDING));
            deptApproved.put(dept.name(), reviewRepository.countByDepartmentAndStatus(dept, DepartmentReview.ReviewStatus.APPROVED));
        }

        return AdminDashboardStats.builder()
                .totalApplications(total)
                .approvedApplications(approved)
                .rejectedApplications(rejected)
                .pendingApplications(pending)
                .revisionApplications(revision)
                .overdueReviewsCount(overdue)
                .averageProcessingDays(4.2)
                .statusDistribution(statusDistribution)
                .departmentPendingCounts(deptPending)
                .departmentApprovedCounts(deptApproved)
                .build();
    }
}

