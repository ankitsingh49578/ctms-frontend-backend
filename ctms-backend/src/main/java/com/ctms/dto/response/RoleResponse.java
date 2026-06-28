package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/** Read model for a role, including the set of permission names it grants. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleResponse {
    private Integer roleId;
    private String roleName;
    private String description;
    private String status;          // UserStatus dbValue
    private Set<String> permissions;
}
