package com.ctms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

/** Payload for POST /api/trials. */
@Data
public class CreateTrialRequest {
    @NotBlank(message = "trialCode is required")
    @Pattern(regexp = "^[A-Z]{2,5}-[A-Z0-9]{2,6}-?[0-9]{0,3}$",
             message = "trialCode must match e.g. ABC-123 or ONC-2024-01")
    private String trialCode;

    @NotBlank(message = "trialName is required")
    private String trialName;

    @NotBlank(message = "phase is required (I/II/III/IV)")
    private String phase;

    private String description;

    @NotNull(message = "startDate is required")
    private LocalDate startDate;

    private LocalDate endDate;

    /** Optional; defaults to Planned when omitted. */
    private String status;
}
