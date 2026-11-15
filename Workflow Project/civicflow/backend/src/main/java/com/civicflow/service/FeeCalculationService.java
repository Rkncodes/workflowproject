package com.civicflow.service;

import com.civicflow.model.Application;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class FeeCalculationService {

    @Value("${civicflow.rates.residential:20.0}")
    private double residentialRatePerSqM;

    @Value("${civicflow.rates.commercial:40.0}")
    private double commercialRatePerSqM;

    @Value("${civicflow.rates.industrial:30.0}")
    private double industrialRatePerSqM;

    public double calculateFee(Application.BuildingType buildingType, double proposedArea, int floors, double plotArea) {
        double rate = switch (buildingType) {
            case COMMERCIAL -> commercialRatePerSqM;
            case INDUSTRIAL -> industrialRatePerSqM;
            case RESIDENTIAL -> residentialRatePerSqM;
        };

        // Base fee = area * rate
        double baseFee = proposedArea * rate;

        // Multi-floor height factor surcharge
        double floorSurcharge = (floors > 3) ? (floors - 3) * 0.05 * baseFee : 0.0;

        // Municipal infrastructure development levy
        double infrastructureLevy = plotArea * 5.0;

        double total = baseFee + floorSurcharge + infrastructureLevy;
        return Math.round(total * 100.0) / 100.0;
    }
}
