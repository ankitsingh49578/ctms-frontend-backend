package com.ctms.mapper;

import com.ctms.dto.response.RoleResponse;
import com.ctms.entity.Permission;
import com.ctms.entity.Role;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/** Maps {@link Role} entities to {@link RoleResponse}, flattening permissions to names. */
@Component
public class RoleMapper {

    public RoleResponse toResponse(Role r) {
        if (r == null) return null;
        return RoleResponse.builder()
                .roleId(r.getRoleId())
                .roleName(r.getRoleName())
                .description(r.getDescription())
                .status(r.getStatus() != null ? r.getStatus().dbValue() : null)
                .permissions(r.getPermissions() == null ? null :
                        r.getPermissions().stream()
                                .map(Permission::getPermissionName)
                                .collect(Collectors.toCollection(java.util.TreeSet::new)))
                .build();
    }
}
