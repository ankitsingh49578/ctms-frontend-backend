package com.ctms.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Payload for PUT /api/users/{id}. All fields optional; only provided fields change. */
@Data
public class UpdateUserRequest {
    @Size(max = 100)
    private String username;

    @Email(message = "email must be a valid address")
    @Size(max = 150)
    private String email;

    @Pattern(regexp = "^$|^[+]?[0-9]{7,15}$", message = "phone must be 7-15 digits, optional leading +")
    private String phone;

    private String status;
}
