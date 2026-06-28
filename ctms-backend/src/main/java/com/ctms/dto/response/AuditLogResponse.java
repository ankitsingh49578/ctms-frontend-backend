package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Read model for an audit-trail entry. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Integer logId;
    private Integer userId;
    private String action;
    private String module;
    private String ipAddress;
    private LocalDateTime createdAt;
}
