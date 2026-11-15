package com.civicflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardStats {
    private long totalApplications;
    private long approvedApplications;
    private long rejectedApplications;
    private long pendingApplications;
    private long revisionApplications;
    private long overdueReviewsCount;
    private double averageProcessingDays;
    private Map<String, Long> statusDistribution;
    private Map<String, Long> departmentPendingCounts;
    private Map<String, Long> departmentApprovedCounts;
}

