package com.ctms.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import com.ctms.validation.ValidAge;

/** Participant self-registration payload. */
@Data
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Username is required")
    @jakarta.validation.constraints.Size(min = 4, max = 30, message = "Username must be between 4 and 30 characters")
    @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Password is required")
    private String password;

    @NotNull(message = "Date of birth is required")
    @ValidAge(min = 20, max = 40)
    private LocalDate dob;

    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "Medical history document is required")
    private String medicalHistoryDocumentName;

    private String address;
}
