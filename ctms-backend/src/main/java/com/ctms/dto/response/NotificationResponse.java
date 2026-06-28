package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Read model for an in-app notification. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Integer notificationId;
    private Integer userId;
    private String title;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
}
