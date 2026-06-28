package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialDetailsResponse {
    private TrialResponse trialInformation;
    private TrialEnrollmentSummaryResponse enrollmentSummary;
    private TrialVisitSummaryResponse visitSummary;
    private TrialConsentSummaryResponse consentSummary;
    private TrialAdverseEventSummaryResponse adverseEventSummary;
    private TestResultSummaryResponse testResultSummary;
    private long totalEnrolled;
    private long totalAdverseEvents;
    private double successRate;
}
