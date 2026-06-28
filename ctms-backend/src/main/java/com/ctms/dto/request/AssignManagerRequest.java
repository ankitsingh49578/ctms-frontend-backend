package com.ctms.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Payload for POST /api/trials/{id}/assign-manager. */
@Data
public class AssignManagerRequest {
    @NotNull(message = "managerId is required")
    @Min(value = 1, message = "managerId must be a positive id")
    private Integer managerId;

    @NotBlank(message = "role is required (Manager/Coordinator/Monitor)")
    private String role;
}
