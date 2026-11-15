package com.civicflow.dto;

import com.civicflow.model.DepartmentReview;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewActionRequest {
    @NotNull
    private Long officerId;

    @NotNull
    private DepartmentReview.DepartmentName department;

    private String comments;
}

