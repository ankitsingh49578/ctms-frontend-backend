package com.ctms.controller;

import com.ctms.dto.ApiResponse;
import com.ctms.dto.response.AuditLogResponse;
import com.ctms.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Read-only access to the audit trail.
 *
 * <p>Previously the {@code AuditService} read methods ({@code recent}, {@code forUser})
 * existed with full service/repository/mapper support but were never exposed over
 * HTTP — a missing-endpoint finding from the security audit. The trail is
 * Admin-only because it reveals cross-user activity.</p>
 */
@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Admin-only audit trail inspection")
public class AuditLogController {

    private final AuditService auditService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    @Operation(summary = "List the most recent audit entries (default 50, max 500)")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> recent(
            @RequestParam(required = false, defaultValue = "50") int limit) {
        int capped = Math.max(1, Math.min(limit, 500));
        return ResponseEntity.ok(ApiResponse.ok(auditService.recent(capped)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user/{userId}")
    @Operation(summary = "List all audit entries recorded for a specific user")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> forUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(ApiResponse.ok(auditService.forUser(userId)));
    }
}
