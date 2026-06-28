package com.ctms.mapper;

import com.ctms.dto.response.NotificationResponse;
import com.ctms.entity.Notification;
import org.springframework.stereotype.Component;

/** Maps {@link Notification} entities to {@link NotificationResponse}. */
@Component
public class NotificationMapper {

    public NotificationResponse toResponse(Notification n) {
        if (n == null) return null;
        return NotificationResponse.builder()
                .notificationId(n.getNotificationId())
                .userId(n.getUser() != null ? n.getUser().getUserId() : null)
                .title(n.getTitle())
                .message(n.getMessage())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
