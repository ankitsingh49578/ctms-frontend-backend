package com.ctms.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Payload for POST /api/users/{id}/change-role. */
@Data
public class ChangeRoleRequest {
    @NotNull(message = "roleId is required")
    @Min(value = 1, message = "roleId must be a positive id")
    private Integer roleId;
}
