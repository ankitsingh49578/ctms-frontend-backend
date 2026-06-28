package com.ctms.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.response.NotificationResponse;
import com.ctms.exception.CTMSException;

import java.util.List;

/** Business logic for per-user in-app notifications. */
public interface NotificationService {
    NotificationResponse notify(Integer userId, String title, String message) throws CTMSException;
    void notifyRole(String roleName, String title, String message);
    Page<NotificationResponse> forUser(Integer userId, Pageable pageable);
    List<NotificationResponse> unreadForUser(Integer userId);
    void markRead(Integer notificationId) throws CTMSException;
}
