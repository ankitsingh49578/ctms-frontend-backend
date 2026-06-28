package com.ctms.mapper;

import com.ctms.dto.response.UserResponse;
import com.ctms.entity.User;
import org.springframework.stereotype.Component;

/** Maps {@link User} entities to {@link UserResponse} (must run inside a transaction). */
@Component
public class UserMapper {

    public UserResponse toResponse(User u) {
        if (u == null) return null;
        return UserResponse.builder()
                .userId(u.getUserId())
                .roleId(u.getRole() != null ? u.getRole().getRoleId() : null)
                .roleName(u.getRole() != null ? u.getRole().getRoleName() : null)
                .username(u.getUsername())
                .email(u.getEmail())
                .phone(u.getPhone())
                .status(u.getStatus() != null ? u.getStatus().dbValue() : null)
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}
