package com.ctms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/** Payload for PUT /api/trials/{id}. */
@Data
public class UpdateTrialRequest {
    private String trialCode;

    @NotBlank(message = "trialName is required")
    private String trialName;

    @NotBlank(message = "phase is required (I/II/III/IV)")
    private String phase;

    private String description;
    private LocalDate startDate;
    private LocalDate endDate;

    @NotBlank(message = "status is required")
    private String status;
}
