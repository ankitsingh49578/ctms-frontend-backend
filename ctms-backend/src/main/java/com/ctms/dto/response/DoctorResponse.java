package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Read model for a doctor profile. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponse {
    private Integer doctorId;
    private Integer userId;
    private String doctorName;
    private String specialization;
    private String licenseNo;
    private String phone;
    private String profileImage;
    private String employeeId;
    private String department;
    private String designation;
    private String qualification;
    private String address;
    private String emergencyContact;
    
    // User fields (so profile doesn't have to fetch them separately)
    private String email;
    private String status;
    private java.time.LocalDateTime createdAt;
}
