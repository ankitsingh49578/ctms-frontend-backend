package com.ctms.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Payload for POST /api/users. */
@Data
public class CreateUserRequest {
    @NotBlank(message = "username is required")
    @Size(max = 100, message = "username must be at most 100 characters")
    private String username;

    @NotBlank(message = "email is required")
    @Email(message = "email must be a valid address")
    @Size(max = 150)
    private String email;

    @NotBlank(message = "password is required")
    @Size(min = 8, message = "password must be at least 8 characters")
    private String password;

    @NotNull(message = "roleId is required")
    @Min(value = 1, message = "roleId must be a positive id")
    private Integer roleId;

    @Pattern(regexp = "^$|^[+]?[0-9]{7,15}$", message = "phone must be 7-15 digits, optional leading +")
    private String phone;

    /** Optional override; defaults to Active when omitted. */
    private String status;
}
