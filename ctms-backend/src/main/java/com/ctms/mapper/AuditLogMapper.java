package com.ctms.mapper;

import com.ctms.dto.response.AuditLogResponse;
import com.ctms.entity.AuditLog;
import org.springframework.stereotype.Component;

/** Maps {@link AuditLog} entities to {@link AuditLogResponse}. */
@Component
public class AuditLogMapper {

    public AuditLogResponse toResponse(AuditLog a) {
        if (a == null) return null;
        return AuditLogResponse.builder()
                .logId(a.getLogId())
                .userId(a.getUser() != null ? a.getUser().getUserId() : null)
                .action(a.getAction())
                .module(a.getModule())
                .ipAddress(a.getIpAddress())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
