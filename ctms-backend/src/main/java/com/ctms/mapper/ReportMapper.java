package com.ctms.mapper;

import com.ctms.dto.response.ReportResponse;
import com.ctms.entity.Report;
import org.springframework.stereotype.Component;

/** Maps {@link Report} entities to {@link ReportResponse}. */
@Component
public class ReportMapper {

    public ReportResponse toResponse(Report r) {
        if (r == null) return null;
        return ReportResponse.builder()
                .reportId(r.getReportId())
                .trialId(r.getTrial() != null ? r.getTrial().getTrialId() : null)
                .reportName(r.getReportName())
                .reportType(r.getReportType() != null ? r.getReportType().dbValue() : null)
                .generatedById(r.getGeneratedBy() != null ? r.getGeneratedBy().getUserId() : null)
                .generatedDate(r.getGeneratedDate())
                .filePath(r.getFilePath())
                .build();
    }
}
