package com.ctms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/** Payload for PUT /api/doctors/{id}. */
@Data
public class UpdateDoctorRequest {
    @NotBlank(message = "doctorName is required")
    private String doctorName;

    private String specialization;
    private String licenseNo;

    @Pattern(regexp = "^$|^[+]?[0-9]{7,15}$", message = "phone must be 7-15 digits, optional leading +")
    private String phone;

    private String profileImage;
}
