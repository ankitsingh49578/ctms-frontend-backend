package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialEnrollmentSummaryResponse {
    private long totalTarget; // usually from trial settings or just 100 for MVP
    private long currentEnrollment;
    private long screeningParticipants;
    private long activeParticipants;
    private long completedParticipants;
    private long withdrawnParticipants;
    private double enrollmentPercentage;
}
