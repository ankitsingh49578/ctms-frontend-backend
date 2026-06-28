package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Read model for a user account. Never exposes the password hash. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Integer userId;
    private Integer roleId;
    private String roleName;
    private String username;
    private String email;
    private String phone;
    private String status;          // UserStatus dbValue
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
