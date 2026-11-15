package com.civicflow.dto;

import com.civicflow.model.Application;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationSubmitRequest {
    @NotNull
    private Long applicantId;

    @NotBlank
    private String projectName;

    @NotNull
    private Application.ApplicantType applicantType;

    @NotBlank
    private String propertyAddress;

    @NotBlank
    private String city;

    @NotBlank
    private String pinCode;

    @NotBlank
    private String surveyNumber;

    @NotNull
    @Positive
    private Double plotArea;

    @NotNull
    private Application.BuildingType buildingType;

    @NotNull
    @Positive
    private Integer numberOfFloors;

    @NotNull
    @Positive
    private Double proposedBuildingArea;
}

