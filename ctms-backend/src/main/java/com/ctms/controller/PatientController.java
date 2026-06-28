package com.ctms.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import com.ctms.dto.ApiResponse;
import com.ctms.dto.request.CreatePatientRequest;
import com.ctms.dto.request.UpdatePatientRequest;
import com.ctms.dto.response.EnrollmentResponse;
import com.ctms.dto.response.ParticipantVisitSummaryResponse;
import com.ctms.dto.response.PatientResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.ParticipantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

/** Participant (patient) management endpoints. */
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Tag(name = "Patients", description = "Trial participant registration, verification and lookup")
public class PatientController {

    private final ParticipantService participantService;

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @GetMapping
    @Operation(summary = "List all participants")
    public ResponseEntity<ApiResponse<Page<PatientResponse>>> list(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(participantService.listParticipants(pageable)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @GetMapping("/search")
    @Operation(summary = "Search participants by name/code/email")
    public ResponseEntity<ApiResponse<Page<PatientResponse>>> search(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(participantService.searchParticipants(keyword, pageable)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @GetMapping("/count")
    @Operation(summary = "Count participants")
    public ResponseEntity<ApiResponse<Long>> count() {
        return ResponseEntity.ok(ApiResponse.ok(participantService.countParticipants()));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER') or @accessGuard.canViewPatient(#id)")
    @GetMapping("/{id}")
    @Operation(summary = "Get a participant by id")
    public ResponseEntity<ApiResponse<PatientResponse>> get(@PathVariable Integer id) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(participantService.getParticipant(id)));
    }

    @PreAuthorize("hasRole('CLINICAL_MANAGER')")
    @PostMapping
    @Operation(summary = "Register a participant")
    public ResponseEntity<ApiResponse<PatientResponse>> create(@Valid @RequestBody CreatePatientRequest request)
            throws CTMSException {
        PatientResponse created = participantService.createPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Participant created", created));
    }

    @PreAuthorize("hasRole('CLINICAL_MANAGER')")
    @PutMapping("/{id}")
    @Operation(summary = "Update a participant")
    public ResponseEntity<ApiResponse<PatientResponse>> update(@PathVariable Integer id,
                                                               @Valid @RequestBody UpdatePatientRequest request)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok("Participant updated",
                participantService.updatePatient(id, request)));
    }

    @PreAuthorize("hasRole('CLINICAL_MANAGER')")
    @PostMapping("/{id}/verify")
    @Operation(summary = "Mark a participant as verified")
    public ResponseEntity<ApiResponse<PatientResponse>> verify(@PathVariable Integer id) throws CTMSException {
        participantService.verifyParticipant(id);
        return ResponseEntity.ok(ApiResponse.ok("Participant verified", participantService.getParticipant(id)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER') or @accessGuard.canViewPatient(#id)")
    @GetMapping("/{id}/enrollments")
    @Operation(summary = "List a participant's trial enrollments")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> enrollments(@PathVariable Integer id)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(participantService.enrollmentsForPatient(id)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER','DOCTOR')")
    @GetMapping("/{id}/visit-summary")
    @Operation(summary = "Get visit statistics and trial summary for a participant")
    public ResponseEntity<ApiResponse<ParticipantVisitSummaryResponse>> visitSummary(@PathVariable Integer id)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(participantService.getVisitSummary(id)));
    }
}
