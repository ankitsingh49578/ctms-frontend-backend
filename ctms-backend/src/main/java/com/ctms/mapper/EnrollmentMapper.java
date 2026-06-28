package com.ctms.mapper;

import com.ctms.dto.response.EnrollmentResponse;
import com.ctms.entity.Enrollment;
import org.springframework.stereotype.Component;

/** Maps {@link Enrollment} entities to {@link EnrollmentResponse}. */
@Component
public class EnrollmentMapper {

    public EnrollmentResponse toResponse(Enrollment e) {
        if (e == null) return null;
        return EnrollmentResponse.builder()
                .enrollmentId(e.getEnrollmentId())
                .patientId(e.getPatient() != null ? e.getPatient().getPatientId() : null)
                .trialId(e.getTrial() != null ? e.getTrial().getTrialId() : null)
                .trialName(e.getTrial() != null ? e.getTrial().getTrialName() : null)
                .trialCode(e.getTrial() != null ? e.getTrial().getTrialCode() : null)
                .trialStatus(e.getTrial() != null && e.getTrial().getStatus() != null ? e.getTrial().getStatus().dbValue() : null)
                .enrollmentDate(e.getEnrollmentDate())
                .status(e.getStatus() != null ? e.getStatus().dbValue() : null)
                .build();
    }
}
