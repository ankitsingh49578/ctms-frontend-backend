package com.ctms.mapper;

import com.ctms.dto.response.AnalyticsResponse;
import com.ctms.entity.Analytics;
import org.springframework.stereotype.Component;

/** Maps {@link Analytics} entities to {@link AnalyticsResponse}. */
@Component
public class AnalyticsMapper {

    public AnalyticsResponse toResponse(Analytics a) {
        if (a == null) return null;
        return AnalyticsResponse.builder()
                .analyticsId(a.getAnalyticsId())
                .metricDate(a.getMetricDate())
                .activeTrials(a.getActiveTrials())
                .totalPatients(a.getTotalPatients())
                .enrolledPatients(a.getEnrolledPatients())
                .completionRate(a.getCompletionRate())
                .complianceRate(a.getComplianceRate())
                .pendingVisits(a.getPendingVisits())
                .overdueVisits(a.getOverdueVisits())
                .generatedAt(a.getGeneratedAt())
                .build();
    }
}
