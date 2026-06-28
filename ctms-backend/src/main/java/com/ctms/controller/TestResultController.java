package com.ctms.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import com.ctms.dto.ApiResponse;
import com.ctms.dto.request.RecordTestResultRequest;
import com.ctms.dto.request.UpdateTestResultStatusRequest;
import com.ctms.dto.response.TestResultResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.TestResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

/** Clinical/lab test-result endpoints. */
@RestController
@RequestMapping("/api/test-results")
@RequiredArgsConstructor
@Tag(name = "Test Results", description = "Recording and tracking clinical/lab test results")
public class TestResultController {

    private final TestResultService testResultService;

    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping
    @Operation(summary = "List all test results")
    public ResponseEntity<ApiResponse<Page<TestResultResponse>>> list(@PageableDefault(size = 20, sort = "collectedDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(testResultService.listResults(pageable)));
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/search")
    @Operation(summary = "Search test results by test name/value")
    public ResponseEntity<ApiResponse<Page<TestResultResponse>>> search(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20, sort = "collectedDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(testResultService.searchResults(keyword, pageable)));
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/patient-summaries")
    @Operation(summary = "Search test results aggregated by patient")
    public ResponseEntity<ApiResponse<Page<com.ctms.dto.response.PatientTestResultSummaryResponse>>> getPatientSummaries(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20, sort = "patient.patientId", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(testResultService.getPatientSummaries(keyword, pageable)));
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/count")
    @Operation(summary = "Count test results")
    public ResponseEntity<ApiResponse<Long>> count() {
        return ResponseEntity.ok(ApiResponse.ok(testResultService.countResults()));
    }

    @PreAuthorize("hasRole('DOCTOR') or @accessGuard.isOwnTestResult(#id)")
    @GetMapping("/{id}")
    @Operation(summary = "Get a test result by id")
    public ResponseEntity<ApiResponse<TestResultResponse>> get(@PathVariable Integer id) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(testResultService.getResult(id)));
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PostMapping
    @Operation(summary = "Record a test result")
    public ResponseEntity<ApiResponse<TestResultResponse>> record(
            @Valid @RequestBody RecordTestResultRequest request) throws CTMSException {
        TestResultResponse created = testResultService.recordResult(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Test result recorded", created));
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/{id}/status")
    @Operation(summary = "Update a test result's status")
    public ResponseEntity<ApiResponse<TestResultResponse>> updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateTestResultStatusRequest request) throws CTMSException {
        testResultService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Test result status updated", testResultService.getResult(id)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a test result")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) throws CTMSException {
        testResultService.deleteResult(id);
        return ResponseEntity.ok(ApiResponse.ok("Test result deleted", null));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TRIAL_MANAGER','CLINICAL_MANAGER') or @accessGuard.isAssignedDoctor(#patientId) or @accessGuard.isOwnPatient(#patientId)")
    @GetMapping("/patient/{patientId}")
    @Operation(summary = "List test results for a participant")
    public ResponseEntity<ApiResponse<List<TestResultResponse>>> forPatient(@PathVariable Integer patientId)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(testResultService.resultsForPatient(patientId)));
    }

    @PreAuthorize("hasRole('ADMIN') or @accessGuard.isDoctorForVisit(#visitId) or @accessGuard.isOwnVisit(#visitId)")
    @GetMapping("/visit/{visitId}")
    @Operation(summary = "List test results for a visit")
    public ResponseEntity<ApiResponse<List<TestResultResponse>>> forVisit(@PathVariable Integer visitId)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(testResultService.resultsForVisit(visitId)));
    }
}
