package com.ctms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Credentials for POST /api/auth/login. */
@Data
public class LoginRequest {
    @NotBlank(message = "username is required")
    private String username;

    @NotBlank(message = "password is required")
    private String password;
}
