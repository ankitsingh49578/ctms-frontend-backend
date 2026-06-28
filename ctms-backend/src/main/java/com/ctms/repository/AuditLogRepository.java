package com.ctms.repository;

import com.ctms.entity.AuditLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {
    List<AuditLog> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);
    // recent(limit) -> call with PageRequest.of(0, limit)
    List<AuditLog> findByOrderByCreatedAtDesc(Pageable pageable);
}
