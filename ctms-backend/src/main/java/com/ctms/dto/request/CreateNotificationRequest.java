package com.ctms.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Payload for POST /api/notifications. */
@Data
public class CreateNotificationRequest {
    @NotNull(message = "userId is required")
    @Min(value = 1, message = "userId must be a positive id")
    private Integer userId;

    @NotBlank(message = "title is required")
    private String title;

    private String message;
}
