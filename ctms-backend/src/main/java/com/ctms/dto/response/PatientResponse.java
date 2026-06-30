package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Read model for a trial participant. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {
    private Integer patientId;
    private Integer userId;          // nullable
    private String patientCode;
    private String firstName;
    private String lastName;
    private String fullName;
    private LocalDate dob;
    private String gender;           // Gender dbValue
    private String phone;
    private String email;
    private String address;
    private String bloodGroup;
    private String status;
    private String medicalDocumentName;
    private String medicalDocumentPath;
    private Long medicalDocumentSize;
    private LocalDateTime medicalDocumentUploadedDate;
    private LocalDateTime createdAt;
}
