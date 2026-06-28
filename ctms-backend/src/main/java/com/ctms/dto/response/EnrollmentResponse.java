package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Read model for a patient's enrollment into a trial. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {
    private Integer enrollmentId;
    private Integer patientId;
    private Integer trialId;
    private String trialName;
    private String trialCode;
    private String trialStatus;
    private LocalDate enrollmentDate;
    private String status;           // EnrollmentStatus dbValue
}
