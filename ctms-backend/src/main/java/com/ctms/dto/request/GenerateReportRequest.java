package com.ctms.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Payload for POST /api/reports/generate. */
@Data
public class GenerateReportRequest {
    @NotBlank(message = "reportName is required")
    private String reportName;

    @NotBlank(message = "reportType is required (Recruitment/Safety/Performance/Compliance/Other)")
    private String reportType;

    @Min(value = 1, message = "trialId must be a positive id")
    private Integer trialId;         // optional
}
