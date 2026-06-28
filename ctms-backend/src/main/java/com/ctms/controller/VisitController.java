package com.ctms.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import com.ctms.dto.ApiResponse;
import com.ctms.dto.request.CompleteVisitRequest;
import com.ctms.dto.request.CreateVisitRequest;
import com.ctms.dto.request.RescheduleVisitRequest;
import com.ctms.dto.response.VisitResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.VisitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

/** Visit scheduling endpoints. */
@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
@Tag(name = "Visits", description = "Scheduling trial visits and their status lifecycle")
public class VisitController {

    private final VisitService visitService;

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER','DOCTOR')")
    @PostMapping
    @Operation(summary = "Schedule a visit")
    public ResponseEntity<ApiResponse<VisitResponse>> schedule(@Valid @RequestBody CreateVisitRequest request)
            throws CTMSException {
        VisitResponse created = visitService.scheduleVisit(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Visit scheduled", created));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER') or @accessGuard.isDoctorForVisit(#id) or @accessGuard.isOwnVisit(#id)")
    @GetMapping("/{id}")
    @Operation(summary = "Get a visit by id")
    public ResponseEntity<ApiResponse<VisitResponse>> get(@PathVariable Integer id) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(visitService.getVisit(id)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @PutMapping("/{id}/reschedule")
    @Operation(summary = "Reschedule a visit to a new date")
    public ResponseEntity<ApiResponse<VisitResponse>> reschedule(
            @PathVariable Integer id,
            @Valid @RequestBody RescheduleVisitRequest request) throws CTMSException {
        visitService.rescheduleVisit(id, request.getNewDate());
        return ResponseEntity.ok(ApiResponse.ok("Visit rescheduled", visitService.getVisit(id)));
    }

    @PreAuthorize("hasRole('CLINICAL_MANAGER') or @accessGuard.isDoctorForVisit(#id)")
    @PutMapping("/{id}/complete")
    @Operation(summary = "Mark a visit completed")
    public ResponseEntity<ApiResponse<VisitResponse>> complete(
            @PathVariable Integer id,
            @RequestBody(required = false) CompleteVisitRequest request) throws CTMSException {
        LocalDate actualDate = request == null ? null : request.getActualDate();
        visitService.markCompleted(id, actualDate);
        return ResponseEntity.ok(ApiResponse.ok("Visit completed", visitService.getVisit(id)));
    }

    @PreAuthorize("hasRole('CLINICAL_MANAGER') or @accessGuard.isDoctorForVisit(#id)")
    @PutMapping("/{id}/missed")
    @Operation(summary = "Mark a visit missed")
    public ResponseEntity<ApiResponse<VisitResponse>> missed(@PathVariable Integer id) throws CTMSException {
        visitService.markMissed(id);
        return ResponseEntity.ok(ApiResponse.ok("Visit marked missed", visitService.getVisit(id)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a visit")
    public ResponseEntity<ApiResponse<VisitResponse>> cancel(@PathVariable Integer id) throws CTMSException {
        visitService.cancelVisit(id);
        return ResponseEntity.ok(ApiResponse.ok("Visit cancelled", visitService.getVisit(id)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER') or @accessGuard.canViewPatient(#patientId)")
    @GetMapping("/patient/{patientId}")
    @Operation(summary = "List visits for a participant")
    public ResponseEntity<ApiResponse<Page<VisitResponse>>> forPatient(@PathVariable Integer patientId,
            @PageableDefault(size = 20, sort = "scheduledDate") Pageable pageable)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(visitService.visitsForPatient(patientId, pageable)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER','DOCTOR')")
    @GetMapping("/trial/{trialId}")
    @Operation(summary = "List visits for a trial")
    public ResponseEntity<ApiResponse<Page<VisitResponse>>> forTrial(@PathVariable Integer trialId,
            @PageableDefault(size = 20, sort = "scheduledDate") Pageable pageable)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(visitService.visitsForTrial(trialId, pageable)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER') or @accessGuard.isDoctorProfile(#doctorId)")
    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "List all visits assigned to a doctor, ordered by scheduled date")
    public ResponseEntity<ApiResponse<List<VisitResponse>>> byDoctor(@PathVariable Integer doctorId)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(visitService.visitsForDoctor(doctorId)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER','DOCTOR')")
    @GetMapping("/upcoming")
    @Operation(summary = "List upcoming scheduled visits in a date window (defaults to next 30 days)")
    public ResponseEntity<ApiResponse<List<VisitResponse>>> upcoming(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(visitService.upcomingVisits(from, to)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @GetMapping("/count")
    @Operation(summary = "Count visits in a given status")
    public ResponseEntity<ApiResponse<Long>> countByStatus(@RequestParam String status) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(visitService.countByStatus(status)));
    }
}
