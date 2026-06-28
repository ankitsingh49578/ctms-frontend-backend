package com.ctms.controller;

import com.ctms.dto.ApiResponse;
import com.ctms.dto.request.CreateEnrollmentRequest;
import com.ctms.dto.request.UpdateEnrollmentStatusRequest;
import com.ctms.dto.response.EnrollmentResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.ParticipantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

/** Enrollment endpoints (a participant joining a trial). */
@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@Tag(name = "Enrollments", description = "Enrolling participants into trials and tracking enrollment status")
public class EnrollmentController {

    private final ParticipantService participantService;

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @PostMapping
    @Operation(summary = "Enroll a participant into a trial")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enroll(
            @Valid @RequestBody CreateEnrollmentRequest request) throws CTMSException {
        EnrollmentResponse created = participantService.enroll(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Participant enrolled", created));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER','DOCTOR') or @accessGuard.isOwnEnrollment(#id)")
    @GetMapping("/{id}")
    @Operation(summary = "Get an enrollment by id")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> get(@PathVariable Integer id) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(participantService.getEnrollment(id)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER','DOCTOR')")
    @GetMapping("/trial/{id}")
    @Operation(summary = "Get enrollments by trial id")
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<EnrollmentResponse>>> getByTrial(
            @PathVariable Integer id,
            @org.springframework.data.web.PageableDefault(size = 20) org.springframework.data.domain.Pageable pageable) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(participantService.getEnrollmentsByTrial(id, pageable)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @PutMapping("/{id}/status")
    @Operation(summary = "Update an enrollment's status")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateEnrollmentStatusRequest request) throws CTMSException {
        participantService.updateEnrollmentStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Enrollment status updated", participantService.getEnrollment(id)));
    }
}
