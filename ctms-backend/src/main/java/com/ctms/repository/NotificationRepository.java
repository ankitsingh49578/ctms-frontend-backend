package com.ctms.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);

    Page<Notification> findByUser_UserId(Integer userId, Pageable pageable);
    List<Notification> findByUser_UserIdAndReadFalseOrderByCreatedAtDesc(Integer userId);

    /** Ownership check (AccessGuard): notification is addressed to the login user. */
    boolean existsByNotificationIdAndUser_UserId(Integer notificationId, Integer userId);
}
