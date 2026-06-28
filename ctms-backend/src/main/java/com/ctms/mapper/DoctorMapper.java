package com.ctms.mapper;

import com.ctms.dto.response.DoctorResponse;
import com.ctms.entity.Doctor;
import org.springframework.stereotype.Component;

/** Maps {@link Doctor} entities to {@link DoctorResponse}. */
@Component
public class DoctorMapper {

    public DoctorResponse toResponse(Doctor d) {
        if (d == null) return null;
        return DoctorResponse.builder()
                .doctorId(d.getDoctorId())
                .userId(d.getUser() != null ? d.getUser().getUserId() : null)
                .doctorName(d.getDoctorName())
                .specialization(d.getSpecialization())
                .licenseNo(d.getLicenseNo())
                .phone(d.getPhone())
                .profileImage(d.getProfileImage())
                .employeeId(d.getEmployeeId())
                .department(d.getDepartment())
                .designation(d.getDesignation())
                .qualification(d.getQualification())
                .address(d.getAddress())
                .emergencyContact(d.getEmergencyContact())
                .email(d.getUser() != null ? d.getUser().getEmail() : null)
                .status(d.getUser() != null && d.getUser().getStatus() != null ? d.getUser().getStatus().dbValue() : null)
                .createdAt(d.getUser() != null ? d.getUser().getCreatedAt() : null)
                .build();
    }
}
