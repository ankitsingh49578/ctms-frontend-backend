package com.ctms.mapper;

import com.ctms.dto.response.PatientResponse;
import com.ctms.entity.Patient;
import org.springframework.stereotype.Component;

/** Maps {@link Patient} entities to {@link PatientResponse}. */
@Component
public class PatientMapper {

    public PatientResponse toResponse(Patient p) {
        if (p == null) return null;
        return PatientResponse.builder()
                .patientId(p.getPatientId())
                .userId(p.getUser() != null ? p.getUser().getUserId() : null)
                .patientCode(p.getPatientCode())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .fullName(p.fullName())
                .dob(p.getDob())
                .gender(p.getGender() != null ? p.getGender().dbValue() : null)
                .phone(p.getPhone())
                .email(p.getEmail())
                .address(p.getAddress())
                .bloodGroup(p.getBloodGroup())
                .status(p.getStatus())
                .medicalHistoryDocumentName(p.getMedicalHistoryDocumentName())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
