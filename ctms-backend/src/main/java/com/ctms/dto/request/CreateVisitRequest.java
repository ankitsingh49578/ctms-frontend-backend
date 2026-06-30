package com.ctms.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/** Payload for POST /api/visits. */
@Data
public class CreateVisitRequest {
    @NotNull(message = "trialId is required")
    @Min(value = 1, message = "trialId must be a positive id")
    private Integer trialId;

    @NotNull(message = "patientId is required")
    @Min(value = 1, message = "patientId must be a positive id")
    private Integer patientId;

    @NotNull(message = "doctorId is required")
    @Min(value = 1, message = "doctorId must be a positive id")
    private Integer doctorId;

    @Min(value = 1, message = "managerId must be a positive id")
    private Integer managerId;       // optional

    @NotNull(message = "visitNumber is required")
    @Min(value = 1, message = "visitNumber must be positive")
    private Integer visitNumber;

    @NotBlank(message = "visitType is required")
    private String visitType;

    @NotNull(message = "scheduledDate is required")
    private LocalDate scheduledDate;

    private LocalDate windowStart;
    private LocalDate windowEnd;

    /** Optional; defaults to Scheduled. */
    private String visitStatus;

    private String notes;
}
