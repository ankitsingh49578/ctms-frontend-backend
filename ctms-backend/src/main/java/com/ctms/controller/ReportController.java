package com.ctms.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import com.ctms.dto.ApiResponse;
import com.ctms.dto.request.GenerateReportRequest;
import com.ctms.dto.response.ReportResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

/** Report generation endpoints. */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Generating and listing reports")
public class ReportController {

    private final ReportService reportService;

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER','DOCTOR')")
    @GetMapping
    @Operation(summary = "List all generated reports (newest first)")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> list(@PageableDefault(size = 20, sort = "generatedDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.listReports(pageable)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @PostMapping("/generate")
    @Operation(summary = "Generate a report")
    public ResponseEntity<ApiResponse<ReportResponse>> generate(@Valid @RequestBody GenerateReportRequest request)
            throws CTMSException {
        ReportResponse created = reportService.generateReport(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Report generated", created));
    }
}
