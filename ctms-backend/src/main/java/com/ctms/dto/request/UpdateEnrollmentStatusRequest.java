package com.ctms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Payload for PUT /api/enrollments/{id}/status. */
@Data
public class UpdateEnrollmentStatusRequest {
    @NotBlank(message = "status is required (Screening/Enrolled/Completed/Withdrawn/Terminated)")
    private String status;
}
