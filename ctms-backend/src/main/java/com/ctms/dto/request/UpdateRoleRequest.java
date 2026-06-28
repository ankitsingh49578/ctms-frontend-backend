package com.ctms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

/** Payload for PUT /api/roles/{id}. */
@Data
public class UpdateRoleRequest {
    @NotBlank(message = "roleName is required")
    private String roleName;

    private String description;

    @NotBlank(message = "status is required (Active/Inactive)")
    private String status;

    private Set<Integer> permissionIds;
}
