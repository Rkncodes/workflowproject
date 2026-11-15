package com.civicflow.controller;

import com.civicflow.dto.ReviewActionRequest;
import com.civicflow.model.DepartmentReview;
import com.civicflow.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/pending")
    public ResponseEntity<List<DepartmentReview>> getPendingReviews(
            @RequestParam DepartmentReview.DepartmentName department) {
        return ResponseEntity.ok(reviewService.getPendingReviewsForDepartment(department));
    }

    @PostMapping("/{applicationId}/approve")
    public ResponseEntity<DepartmentReview> approveReview(
            @PathVariable Long applicationId,
            @Valid @RequestBody ReviewActionRequest request) {
        DepartmentReview review = reviewService.processReviewDecision(
                applicationId, request, DepartmentReview.ReviewStatus.APPROVED);
        return ResponseEntity.ok(review);
    }

    @PostMapping("/{applicationId}/reject")
    public ResponseEntity<DepartmentReview> rejectReview(
            @PathVariable Long applicationId,
            @Valid @RequestBody ReviewActionRequest request) {
        DepartmentReview review = reviewService.processReviewDecision(
                applicationId, request, DepartmentReview.ReviewStatus.REJECTED);
        return ResponseEntity.ok(review);
    }

    @PostMapping("/{applicationId}/revision")
    public ResponseEntity<DepartmentReview> requestRevision(
            @PathVariable Long applicationId,
            @Valid @RequestBody ReviewActionRequest request) {
        DepartmentReview review = reviewService.processReviewDecision(
                applicationId, request, DepartmentReview.ReviewStatus.REVISION_REQUESTED);
        return ResponseEntity.ok(review);
    }
}

