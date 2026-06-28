package com.ctms.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/** Payload for POST /api/test-results. */
@Data
public class RecordTestResultRequest {
    @NotNull(message = "visitId is required")
    @Min(value = 1, message = "visitId must be a positive id")
    private Integer visitId;

    @NotNull(message = "patientId is required")
    @Min(value = 1, message = "patientId must be a positive id")
    private Integer patientId;

    @NotNull(message = "doctorId is required")
    @Min(value = 1, message = "doctorId must be a positive id")
    private Integer doctorId;

    @NotBlank(message = "testName is required")
    private String testName;

    private String resultValue;
    private String unit;

    /** Optional; defaults to Normal. */
    private String resultStatus;

    /** Optional; defaults to today. */
    private LocalDate collectedDate;
}
