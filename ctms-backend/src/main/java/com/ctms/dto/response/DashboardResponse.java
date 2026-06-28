package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Composite payload for GET /api/analytics/dashboard: a few live counts plus the
 * most recent persisted analytics snapshot (may be null if none generated yet).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalUsers;
    private long totalPatients;
    private long totalTrials;
    private long activeTrials;
    private long totalReports;
    private AnalyticsResponse latestSnapshot;
}
