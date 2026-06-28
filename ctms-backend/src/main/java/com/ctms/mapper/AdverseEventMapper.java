package com.ctms.mapper;

import com.ctms.dto.response.AdverseEventResponse;
import com.ctms.entity.AdverseEvent;
import com.ctms.entity.ClinicalManager;
import com.ctms.entity.Doctor;
import com.ctms.repository.ClinicalManagerRepository;
import com.ctms.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Maps {@link AdverseEvent} entities to {@link AdverseEventResponse}. */
@Component
@RequiredArgsConstructor
public class AdverseEventMapper {

    private final DoctorRepository doctorRepository;
    private final ClinicalManagerRepository managerRepository;

    public AdverseEventResponse toResponse(AdverseEvent e) {
        if (e == null) return null;
        
        String role = e.getReportedBy() != null ? e.getReportedBy().getRole().getRoleName() : null;
        String name = e.getReportedBy() != null ? e.getReportedBy().getUsername() : null;
        
        if (e.getReportedBy() != null && role != null) {
            if ("DOCTOR".equalsIgnoreCase(role)) {
                name = doctorRepository.findByUser_UserId(e.getReportedBy().getUserId())
                        .map(Doctor::getDoctorName).orElse(name);
            } else if ("CLINICAL_MANAGER".equalsIgnoreCase(role)) {
                name = managerRepository.findByUser_UserId(e.getReportedBy().getUserId())
                        .map(ClinicalManager::getManagerName).orElse(name);
            }
        }

        return AdverseEventResponse.builder()
                .eventId(e.getEventId())
                .trialId(e.getTrial() != null ? e.getTrial().getTrialId() : null)
                .patientId(e.getPatient() != null ? e.getPatient().getPatientId() : null)
                .reportedById(e.getReportedBy() != null ? e.getReportedBy().getUserId() : null)
                .createdByDoctorId(e.getCreatedByDoctorId())
                .createdByDoctorName(e.getCreatedByDoctorName())
                .eventDate(e.getEventDate())
                .severity(e.getSeverity() != null ? e.getSeverity().dbValue() : null)
                .title(e.getTitle())
                .description(e.getDescription())
                .symptoms(e.getSymptoms())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .actionsTaken(e.getActionsTaken())
                .requiresMedicalAttention(e.getRequiresMedicalAttention())
                .attachments(e.getAttachments())
                .status(e.getStatus() != null ? e.getStatus().dbValue() : null)
                .createdAt(e.getCreatedAt())
                .createdByUserId(e.getReportedBy() != null ? e.getReportedBy().getUserId() : null)
                .createdByName(name)
                .createdByRole(role)
                .createdDate(e.getCreatedAt())
                .build();
    }
}
