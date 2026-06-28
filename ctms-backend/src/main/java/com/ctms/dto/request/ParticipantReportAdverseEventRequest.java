package com.ctms.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Payload for POST /api/portal/adverse-events. */
@Data
public class ParticipantReportAdverseEventRequest {
    @NotNull(message = "trialId is required")
    @Min(value = 1, message = "trialId must be a positive id")
    private Integer trialId;

    /** Optional; defaults to today. */
    private LocalDate eventDate;

    @NotBlank(message = "severity is required (Mild/Moderate/Severe/Life Threatening)")
    private String severity;

    private String title;

    @NotBlank(message = "description is required")
    private String description;

    private String symptoms;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String actionsTaken;
    private Boolean requiresMedicalAttention;
    private String attachments;
}
