package com.ctms.service.impl;

import com.ctms.constants.AppConstants;
import com.ctms.dto.response.AuditLogResponse;
import com.ctms.entity.AuditLog;
import com.ctms.mapper.AuditLogMapper;
import com.ctms.repository.AuditLogRepository;
import com.ctms.repository.UserRepository;
import com.ctms.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * {@link AuditService} implementation. {@link #record} runs in its own
 * {@code REQUIRES_NEW} transaction and swallows all errors, so the audit trail is
 * written independently of (and never rolls back) the calling business operation.
 */
@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditServiceImpl.class);

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AuditLogMapper auditLogMapper;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(Integer userId, String action, String module) {
        try {
            AuditLog entry = new AuditLog();
            entry.setUser(userRepository.getReferenceById(userId));
            entry.setAction(action);
            entry.setModule(module);
            entry.setIpAddress(AppConstants.DEFAULT_IP);
            auditLogRepository.save(entry);
            log.debug("Audit recorded: user={} action='{}' module='{}'", userId, action, module);
        } catch (Exception e) {
            log.warn("Failed to record audit entry (user={}, action={}): {}", userId, action, e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> recent(int limit) {
        return auditLogRepository.findByOrderByCreatedAtDesc(PageRequest.of(0, Math.max(1, limit)))
                .stream().map(auditLogMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> forUser(Integer userId) {
        return auditLogRepository.findByUser_UserIdOrderByCreatedAtDesc(userId)
                .stream().map(auditLogMapper::toResponse).toList();
    }
}
