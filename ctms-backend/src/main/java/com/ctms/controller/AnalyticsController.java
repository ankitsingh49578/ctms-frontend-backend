package com.ctms.controller;

import com.ctms.dto.ApiResponse;
import com.ctms.dto.response.AnalyticsResponse;
import com.ctms.dto.response.DashboardResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

/** Analytics and dashboard endpoints (backed by the report service). */
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "KPI snapshots and the dashboard summary")
public class AnalyticsController {

    private final ReportService reportService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/snapshot")
    @Operation(summary = "Compute and persist a fresh analytics snapshot")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> snapshot() throws CTMSException {
        AnalyticsResponse created = reportService.generateAnalyticsSnapshot();
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Analytics snapshot created", created));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @GetMapping("/latest")
    @Operation(summary = "Get the most recent analytics snapshot")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> latest() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.latestAnalytics()));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @GetMapping("/dashboard")
    @Operation(summary = "Get live counts plus the latest snapshot for a dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.dashboard()));
    }
}
