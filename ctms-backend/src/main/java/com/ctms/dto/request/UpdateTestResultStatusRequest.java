package com.ctms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Payload for PUT /api/test-results/{id}/status. */
@Data
public class UpdateTestResultStatusRequest {
    @NotBlank(message = "status is required (Normal/Abnormal/Critical/Inconclusive)")
    private String status;
}
