package com.ctms.controller;

import com.ctms.dto.ApiResponse;
import com.ctms.dto.request.ReportAdverseEventRequest;
import com.ctms.dto.request.UpdateAdverseEventStatusRequest;
import com.ctms.dto.response.AdverseEventResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.AdverseEventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

/** Adverse-event (safety) reporting endpoints. */
@RestController
@RequestMapping("/api/adverse-events")
@RequiredArgsConstructor
@Tag(name = "Adverse Events", description = "Reporting and tracking adverse safety events")
public class AdverseEventController {

    private final AdverseEventService adverseEventService;

    @PreAuthorize("hasAnyRole('CLINICAL_MANAGER','DOCTOR')")
    @PostMapping
    @Operation(summary = "Report an adverse event")
    public ResponseEntity<ApiResponse<AdverseEventResponse>> report(
            @Valid @RequestBody ReportAdverseEventRequest request) throws CTMSException {
        AdverseEventResponse created = adverseEventService.reportEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Adverse event reported", created));
    }

    @PreAuthorize("hasAnyRole('CLINICAL_MANAGER','DOCTOR') or @accessGuard.isOwnAdverseEvent(#id)")
    @GetMapping("/{id}")
    @Operation(summary = "Get an adverse event by id")
    public ResponseEntity<ApiResponse<AdverseEventResponse>> get(@PathVariable Integer id) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(adverseEventService.getEvent(id)));
    }

    @PreAuthorize("hasAnyRole('CLINICAL_MANAGER','DOCTOR')")
    @PutMapping("/{id}/status")
    @Operation(summary = "Update an adverse event's status")
    public ResponseEntity<ApiResponse<AdverseEventResponse>> updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateAdverseEventStatusRequest request) throws CTMSException {
        adverseEventService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Adverse event status updated", adverseEventService.getEvent(id)));
    }

    @PreAuthorize("hasAnyRole('CLINICAL_MANAGER','DOCTOR')")
    @GetMapping("/trial/{trialId}")
    @Operation(summary = "List adverse events for a trial")
    public ResponseEntity<ApiResponse<List<AdverseEventResponse>>> forTrial(@PathVariable Integer trialId)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(adverseEventService.eventsForTrial(trialId)));
    }

    @PreAuthorize("hasAnyRole('CLINICAL_MANAGER','DOCTOR') or @accessGuard.isOwnPatient(#patientId)")
    @GetMapping("/patient/{patientId}")
    @Operation(summary = "List adverse events for a participant")
    public ResponseEntity<ApiResponse<List<AdverseEventResponse>>> forPatient(@PathVariable Integer patientId)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(adverseEventService.eventsForPatient(patientId)));
    }

    @PreAuthorize("hasRole('CLINICAL_MANAGER')")
    @GetMapping("/count")
    @Operation(summary = "Count adverse events of a given severity")
    public ResponseEntity<ApiResponse<Long>> countBySeverity(@RequestParam String severity) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(adverseEventService.countBySeverity(severity)));
    }
}
