package com.ctms.controller;

import com.ctms.dto.ApiResponse;
import com.ctms.dto.request.CreateConsentRequest;
import com.ctms.dto.response.ConsentResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.ConsentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

/** Informed-consent endpoints. */
@RestController
@RequestMapping("/api/consents")
@RequiredArgsConstructor
@Tag(name = "Consents", description = "Informed-consent records and their status lifecycle")
public class ConsentController {

    private final ConsentService consentService;
    private final ObjectMapper objectMapper;

    @PreAuthorize("hasRole('CLINICAL_MANAGER')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a consent record with PDF document")
    public ResponseEntity<ApiResponse<ConsentResponse>> create(
            @RequestPart("consent") String consentJson,
            @RequestPart(value = "document", required = false) MultipartFile document)
            throws Exception {
        CreateConsentRequest request = objectMapper.readValue(consentJson, CreateConsentRequest.class);
        ConsentResponse created = consentService.createConsent(request, document);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Consent created", created));
    }

    @PreAuthorize("hasRole('CLINICAL_MANAGER') or @accessGuard.isOwnConsent(#id)")
    @GetMapping("/{id}")
    @Operation(summary = "Get a consent record by id")
    public ResponseEntity<ApiResponse<ConsentResponse>> get(@PathVariable Integer id) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(consentService.getConsent(id)));
    }

    @PreAuthorize("hasRole('CLINICAL_MANAGER') or @accessGuard.isOwnConsent(#id)")
    @GetMapping("/{id}/document")
    @Operation(summary = "Download the PDF document for a consent record")
    public ResponseEntity<Resource> getDocument(@PathVariable Integer id) throws CTMSException {
        Resource resource = consentService.getConsentDocument(id);
        String filename = consentService.getConsentDocumentName(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
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
