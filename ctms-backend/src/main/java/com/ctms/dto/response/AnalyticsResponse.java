package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Read model for an analytics KPI snapshot. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private Integer analyticsId;
    private LocalDate metricDate;
    private Integer activeTrials;
    private Integer totalPatients;
    private Integer enrolledPatients;
    private BigDecimal completionRate;
    private BigDecimal complianceRate;
    private Integer pendingVisits;
    private Integer overdueVisits;
    private LocalDateTime generatedAt;
}
