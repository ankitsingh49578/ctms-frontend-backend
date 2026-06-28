package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Read model for a scheduled trial visit. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitResponse {
    private Integer visitId;
    private Integer trialId;
    private String trialName;
    private Integer patientId;
    private String patientName;
    private Integer doctorId;        // nullable
    private Integer managerId;       // nullable
    private Integer visitNumber;
    private String visitType;
    private LocalDate scheduledDate;
    private LocalDate windowStart;
    private LocalDate windowEnd;
    private LocalDate actualDate;
    private String visitStatus;      // VisitStatus dbValue
    private String notes;
}
