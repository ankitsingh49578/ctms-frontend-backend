package com.ctms.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.GenerateReportRequest;
import com.ctms.dto.response.AnalyticsResponse;
import com.ctms.dto.response.DashboardResponse;
import com.ctms.dto.response.ReportResponse;
import com.ctms.exception.CTMSException;

import java.util.List;

/** Business logic for report generation and analytics snapshots. */
public interface ReportService {

    ReportResponse generateReport(GenerateReportRequest request) throws CTMSException;
    Page<ReportResponse> listReports(Pageable pageable);

    /** Compute and persist a fresh KPI snapshot from current data. */
    AnalyticsResponse generateAnalyticsSnapshot() throws CTMSException;

    /** @return the most recent persisted snapshot, or {@code null} if none exists. */
    AnalyticsResponse latestAnalytics();

    /** Live counts plus the latest persisted snapshot, for a dashboard view. */
    DashboardResponse dashboard();
}
