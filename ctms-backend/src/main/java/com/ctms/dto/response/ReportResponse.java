package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Read model for a generated report. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private Integer reportId;
    private Integer trialId;         // nullable
    private String reportName;
    private String reportType;       // ReportType dbValue
    private Integer generatedById;
    private LocalDateTime generatedDate;
    private String filePath;
}
