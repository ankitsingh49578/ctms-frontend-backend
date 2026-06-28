package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialAdverseEventSummaryResponse {
    private long eventCount;
    private long seriousEvents;
    private long openEvents;
    private long closedEvents;
    private double adverseEventRate;
}
