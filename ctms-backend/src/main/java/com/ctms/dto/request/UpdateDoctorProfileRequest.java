package com.ctms.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateDoctorProfileRequest {

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    private String address;

    @Size(max = 255, message = "Profile image URL must not exceed 255 characters")
    private String profileImage;

    @Size(max = 100, message = "Emergency contact must not exceed 100 characters")
    private String emergencyContact;
}
