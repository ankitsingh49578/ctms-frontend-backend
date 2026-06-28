package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantVisitSummaryResponse {
    private Integer patientId;
    private String patientName;
    private Integer trialId;
    private String trialName;
    private String trialCode;
    private String enrollmentStatus;
    private int totalTrialVisits;
    private int completedVisits;
    private int remainingVisits;
    private Integer nextExpectedVisitNumber;
    private LocalDate nextExpectedVisitDate;
}
