package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Read model for a clinical trial. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialResponse {
    private Integer trialId;
    private String trialCode;
    private String trialName;
    private String phase;            // TrialPhase dbValue
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;           // TrialStatus dbValue
    private Integer createdById;
    private LocalDateTime createdAt;
}
