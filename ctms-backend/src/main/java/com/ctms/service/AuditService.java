package com.ctms.service;

import com.ctms.dto.response.AuditLogResponse;

import java.util.List;

/**
 * Records non-repudiable activity into audit_logs. Recording is best-effort: a
 * failure is logged and swallowed so it never breaks the business action it
 * accompanies (mirrors the legacy AuditService contract).
 */
public interface AuditService {
    void record(Integer userId, String action, String module);
    List<AuditLogResponse> recent(int limit);
    List<AuditLogResponse> forUser(Integer userId);
}
