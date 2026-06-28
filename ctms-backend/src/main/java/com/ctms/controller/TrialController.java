package com.ctms.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import com.ctms.dto.ApiResponse;
import com.ctms.dto.request.AssignManagerRequest;
import com.ctms.dto.request.CreateTrialRequest;
import com.ctms.dto.request.UpdateTrialRequest;
import com.ctms.dto.response.TrialAssignmentResponse;
import com.ctms.dto.response.TrialResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.TrialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

/** Clinical trial management endpoints. */
@RestController
@RequestMapping("/api/trials")
@RequiredArgsConstructor
@Tag(name = "Trials", description = "Trial CRUD, status transitions and manager assignment")
public class TrialController {

    private final TrialService trialService;

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER','DOCTOR')")
    @GetMapping
    @Operation(summary = "List all trials")
    public ResponseEntity<ApiResponse<Page<TrialResponse>>> list(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(trialService.listTrials(pageable)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER','DOCTOR')")
    @GetMapping("/search")
    @Operation(summary = "Search trials by code/name")
    public ResponseEntity<ApiResponse<Page<TrialResponse>>> search(@RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(trialService.searchTrials(keyword, pageable)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER','DOCTOR')")
    @GetMapping("/count")
    @Operation(summary = "Count trials in a given status")
    public ResponseEntity<ApiResponse<Long>> countByStatus(@RequestParam String status) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(trialService.countByStatus(status)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER','DOCTOR')")
    @GetMapping("/{id}")
    @Operation(summary = "Get a trial by id")
    public ResponseEntity<ApiResponse<TrialResponse>> get(@PathVariable Integer id) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(trialService.getTrial(id)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER','DOCTOR')")
    @GetMapping("/{id}/details")
    @Operation(summary = "Get trial details including summary statistics")
    public ResponseEntity<ApiResponse<com.ctms.dto.response.TrialDetailsResponse>> getDetails(@PathVariable Integer id) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(trialService.getTrialDetails(id)));
    }

    @PreAuthorize("hasRole('CLINICAL_MANAGER')")
    @PostMapping
    @Operation(summary = "Create a trial")
    public ResponseEntity<ApiResponse<TrialResponse>> create(@Valid @RequestBody CreateTrialRequest request)
            throws CTMSException {
        TrialResponse created = trialService.createTrial(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Trial created", created));
    }

    @PreAuthorize("hasRole('CLINICAL_MANAGER')")
    @PutMapping("/{id}")
    @Operation(summary = "Update a trial")
    public ResponseEntity<ApiResponse<TrialResponse>> update(@PathVariable Integer id,
                                                             @Valid @RequestBody UpdateTrialRequest request)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok("Trial updated", trialService.updateTrial(id, request)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a trial")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) throws CTMSException {
        trialService.deleteTrial(id);
        return ResponseEntity.ok(ApiResponse.ok("Trial deleted", null));
    }

    @PreAuthorize("hasRole('CLINICAL_MANAGER')")
    @PutMapping("/{id}/status")
    @Operation(summary = "Update a trial's status")
    public ResponseEntity<ApiResponse<TrialResponse>> updateStatus(@PathVariable Integer id,
                                                                   @RequestParam String status) throws CTMSException {
        trialService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Trial status updated", trialService.getTrial(id)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @PostMapping("/{id}/assign-manager")
    @Operation(summary = "Assign a clinical manager to a trial")
    public ResponseEntity<ApiResponse<TrialAssignmentResponse>> assignManager(
            @PathVariable Integer id,
            @Valid @RequestBody AssignManagerRequest request) throws CTMSException {
        TrialAssignmentResponse created = trialService.assignManager(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Manager assigned", created));
    }

    @PreAuthorize("hasRole('TRIAL_MANAGER') or @accessGuard.managesTrial(#id)")
    @GetMapping("/{id}/assignments")
    @Operation(summary = "List a trial's manager assignments")
    public ResponseEntity<ApiResponse<List<TrialAssignmentResponse>>> assignments(@PathVariable Integer id)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(trialService.assignmentsForTrial(id)));
    }
}
