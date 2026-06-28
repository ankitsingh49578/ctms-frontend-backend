package com.ctms.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/** Payload for POST /api/consents. */
@Data
public class CreateConsentRequest {
    @NotNull(message = "patientId is required")
    @Min(value = 1, message = "patientId must be a positive id")
    private Integer patientId;

    @NotNull(message = "trialId is required")
    @Min(value = 1, message = "trialId must be a positive id")
    private Integer trialId;

    /** Optional; defaults to v1.0. */
    private String consentVersion;

    /** Optional; defaults to today. */
    private LocalDate consentDate;

    /** Optional; defaults to Pending. */
    private String consentStatus;

    private String filePath;
}
