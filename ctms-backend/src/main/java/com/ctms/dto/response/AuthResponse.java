package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Returned by POST /api/auth/login: the opaque session token plus identity. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Integer userId;
    private String username;
    private String email;
    private String role;             // roleName
}
