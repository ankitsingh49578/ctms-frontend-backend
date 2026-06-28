package com.ctms.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/** Payload for POST /api/managers. */
@Data
public class CreateManagerRequest {
    @NotNull(message = "userId is required")
    @Min(value = 1, message = "userId must be a positive id")
    private Integer userId;

    @NotBlank(message = "managerName is required")
    private String managerName;

    private String department;

    @Pattern(regexp = "^$|^[+]?[0-9]{7,15}$", message = "phone must be 7-15 digits, optional leading +")
    private String phone;
}
