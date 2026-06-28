package com.ctms.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

/** Payload for POST /api/patients. */
@Data
public class CreatePatientRequest {
    /** Optional link to an existing login account. */
    @Min(value = 1, message = "userId must be a positive id")
    private Integer userId;

    @NotBlank(message = "firstName is required")
    private String firstName;

    @NotBlank(message = "lastName is required")
    private String lastName;

    @NotNull(message = "dob is required")
    @Past(message = "dob must be in the past")
    private LocalDate dob;

    @NotBlank(message = "gender is required (Male/Female/Other)")
    private String gender;

    @Pattern(regexp = "^$|^[+]?[0-9]{7,15}$", message = "phone must be 7-15 digits, optional leading +")
    private String phone;

    @Email(message = "email must be a valid address")
    private String email;

    private String address;
    private String bloodGroup;

    /** Optional; defaults to Pending when omitted. */
    private String status;
}
