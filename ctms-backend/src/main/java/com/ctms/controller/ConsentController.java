package com.ctms.controller;

import com.ctms.dto.ApiResponse;
import com.ctms.dto.request.CreateConsentRequest;
import com.ctms.dto.response.ConsentResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.ConsentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

/** Informed-consent endpoints. */
@RestController
@RequestMapping("/api/consents")
@RequiredArgsConstructor
@Tag(name = "Consents", description = "Informed-consent records and their status lifecycle")
public class ConsentController {

    private final ConsentService consentService;

    @PreAuthorize("hasRole('CLINICAL_MANAGER')")
    @PostMapping
    @Operation(summary = "Create a consent record")
    public ResponseEntity<ApiResponse<ConsentResponse>> create(@Valid @RequestBody CreateConsentRequest request)
            throws CTMSException {
        ConsentResponse created = consentService.createConsent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Consent created", created));
    }

    @PreAuthorize("hasRole('CLINICAL_MANAGER') or @accessGuard.isOwnConsent(#id)")
    @GetMapping("/{id}")
    @Operation(summary = "Get a consent record by id")
    public ResponseEntity<ApiResponse<ConsentResponse>> get(@PathVariable Integer id) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(consentService.getConsent(id)));
    }

    @PreAuthorize("hasRole('CLINICAL_MANAGER') or @accessGuard.isOwnConsent(#id)")
    @PostMapping("/{id}/sign")
    @Operation(summary = "Sign a consent")
    public ResponseEntity<ApiResponse<ConsentResponse>> sign(@PathVariable Integer id) throws CTMSException {
        consentService.signConsent(id);
        return ResponseEntity.ok(ApiResponse.ok("Consent signed", consentService.getConsent(id)));
    }

    @PreAuthorize("hasRole('CLINICAL_MANAGER') or @accessGuard.isOwnConsent(#id)")
    @PostMapping("/{id}/decline")
    @Operation(summary = "Decline a consent")
    public ResponseEntity<ApiResponse<ConsentResponse>> decline(@PathVariable Integer id) throws CTMSException {
        consentService.declineConsent(id);
        return ResponseEntity.ok(ApiResponse.ok("Consent declined", consentService.getConsent(id)));
    }

    @PreAuthorize("hasRole('CLINICAL_MANAGER') or @accessGuard.isOwnConsent(#id)")
    @PostMapping("/{id}/withdraw")
    @Operation(summary = "Withdraw a consent")
    public ResponseEntity<ApiResponse<ConsentResponse>> withdraw(@PathVariable Integer id) throws CTMSException {
        consentService.withdrawConsent(id);
        return ResponseEntity.ok(ApiResponse.ok("Consent withdrawn", consentService.getConsent(id)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER') or @accessGuard.isOwnPatient(#patientId)")
    @GetMapping("/patient/{patientId}")
    @Operation(summary = "List consents for a participant")
    public ResponseEntity<ApiResponse<List<ConsentResponse>>> forPatient(@PathVariable Integer patientId)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(consentService.consentsForPatient(patientId)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @GetMapping("/trial/{trialId}")
    @Operation(summary = "List consents for a trial")
    public ResponseEntity<ApiResponse<List<ConsentResponse>>> forTrial(@PathVariable Integer trialId)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(consentService.consentsForTrial(trialId)));
    }
}
