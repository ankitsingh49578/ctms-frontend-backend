package com.ctms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

/** Payload for POST /api/roles. */
@Data
public class CreateRoleRequest {
    @NotBlank(message = "roleName is required")
    private String roleName;

    private String description;

    /** Optional; defaults to Active. */
    private String status;

    /** Optional permission ids to attach via the role_permissions join table. */
    private Set<Integer> permissionIds;
}
