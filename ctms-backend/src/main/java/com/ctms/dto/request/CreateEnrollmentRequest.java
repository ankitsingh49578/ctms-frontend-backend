package com.ctms.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Payload for POST /api/enrollments. */
@Data
public class CreateEnrollmentRequest {
    @NotNull(message = "patientId is required")
    @Min(value = 1, message = "patientId must be a positive id")
    private Integer patientId;

    @NotNull(message = "trialId is required")
    @Min(value = 1, message = "trialId must be a positive id")
    private Integer trialId;
}
