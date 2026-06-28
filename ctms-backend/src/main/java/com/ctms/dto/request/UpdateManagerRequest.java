package com.ctms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/** Payload for PUT /api/managers/{id}. */
@Data
public class UpdateManagerRequest {
    @NotBlank(message = "managerName is required")
    private String managerName;

    private String department;

    @Pattern(regexp = "^$|^[+]?[0-9]{7,15}$", message = "phone must be 7-15 digits, optional leading +")
    private String phone;
}
