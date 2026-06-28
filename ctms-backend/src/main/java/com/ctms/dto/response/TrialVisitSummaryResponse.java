package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialVisitSummaryResponse {
    private long totalVisits;
    private long completedVisits;
    private long pendingVisits;
    private long missedVisits;
    private double completionRate;
}
