package com.civicflow.service;

import com.civicflow.dto.ReviewActionRequest;
import com.civicflow.model.Application;
import com.civicflow.model.DepartmentReview;
import com.civicflow.model.User;
import com.civicflow.repository.ApplicationRepository;
import com.civicflow.repository.DepartmentReviewRepository;
import com.civicflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final DepartmentReviewRepository reviewRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final NotificationAndAuditService auditService;
    private final FeeCalculationService feeCalculationService;

    public List<DepartmentReview> getPendingReviewsForDepartment(DepartmentReview.DepartmentName department) {
        return reviewRepository.findByDepartmentAndStatus(department, DepartmentReview.ReviewStatus.PENDING);
    }

    @Transactional
    public DepartmentReview processReviewDecision(Long applicationId, ReviewActionRequest request, DepartmentReview.ReviewStatus decision) {
        User officer = userRepository.findById(request.getOfficerId())
                .orElseThrow(() -> new RuntimeException("Officer not found: " + request.getOfficerId()));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));

        DepartmentReview review = reviewRepository.findByApplicationIdAndDepartment(applicationId, request.getDepartment())
                .orElseGet(() -> DepartmentReview.builder()
                        .application(application)
                        .department(request.getDepartment())
                        .build());

        review.setOfficer(officer);
        review.setOfficerName(officer.getFullName());
        review.setStatus(decision);
        review.setComments(request.getComments());
        review.setReviewedAt(LocalDateTime.now());
        review.setIsOverdue(false);

        review = reviewRepository.save(review);

        auditService.logAudit(applicationId, "OFFICER_" + decision.name(), officer.getFullName(),
                "OFFICER", request.getDepartment() + " marked " + decision.name() + ": " + request.getComments());

        // Check overall state of the 4 departments for this application
        evaluateApplicationProgress(application);

        return review;
    }

    private void evaluateApplicationProgress(Application application) {
        List<DepartmentReview> allReviews = reviewRepository.findByApplicationId(application.getId());

        boolean hasRejection = allReviews.stream().anyMatch(r -> r.getStatus() == DepartmentReview.ReviewStatus.REJECTED);
        boolean hasRevision = allReviews.stream().anyMatch(r -> r.getStatus() == DepartmentReview.ReviewStatus.REVISION_REQUESTED);
        boolean allApproved = allReviews.size() == 4 && allReviews.stream().allMatch(r -> r.getStatus() == DepartmentReview.ReviewStatus.APPROVED);

        if (hasRejection) {
            application.setStatus(Application.ApplicationStatus.REJECTED);
            application.setCurrentStage("Application Rejected by Department");
        } else if (hasRevision) {
            application.setStatus(Application.ApplicationStatus.REVISION_REQUIRED);
            application.setCurrentStage("Revision Required by Department");
        } else if (allApproved) {
            double fee = feeCalculationService.calculateFee(
                    application.getBuildingType(),
                    application.getProposedBuildingArea(),
                    application.getNumberOfFloors(),
                    application.getPlotArea()
            );
            application.setCalculatedFee(fee);
            application.setStatus(Application.ApplicationStatus.PENDING_PAYMENT);
            application.setCurrentStage("All Departments Approved - Fee Calculated");
        }

        applicationRepository.save(application);
    }
}

