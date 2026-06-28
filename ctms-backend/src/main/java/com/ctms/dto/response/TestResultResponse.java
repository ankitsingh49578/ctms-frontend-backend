package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Read model for a clinical/lab test result. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestResultResponse {
    private Integer resultId;
    private Integer visitId;
    private Integer patientId;
    private Integer doctorId;
    private String patientName;
    private Integer trialId;
    private String trialName;
    private String trialCode;
    private String doctorName;
    private LocalDate visitDate;
    private String testName;
    private String resultValue;
    private String unit;
    private String resultStatus;     // TestResultStatus dbValue
    private LocalDate collectedDate;
    private LocalDateTime createdAt;
}
