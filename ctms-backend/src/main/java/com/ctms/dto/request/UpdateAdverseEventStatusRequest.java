package com.ctms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Payload for PUT /api/adverse-events/{id}/status. */
@Data
public class UpdateAdverseEventStatusRequest {
    @NotBlank(message = "status is required (Reported/In Review/Resolved/Closed)")
    private String status;
}
