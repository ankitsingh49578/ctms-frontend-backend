package com.ctms.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

/** Payload for PUT /api/patients/{id}. */
@Data
public class UpdatePatientRequest {
    private String firstName;
    private String lastName;

    @Past(message = "dob must be in the past")
    private LocalDate dob;

    private String gender;

    @Pattern(regexp = "^$|^[+]?[0-9]{7,15}$", message = "phone must be 7-15 digits, optional leading +")
    private String phone;

    @Email(message = "email must be a valid address")
    private String email;

    private String address;
    private String bloodGroup;
    private String status;
}
