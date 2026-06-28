package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialConsentSummaryResponse {
    private long totalConsents;
    private long signedConsents;
    private long pendingConsents;
    private long expiredConsents;
    private double complianceRate;
}
