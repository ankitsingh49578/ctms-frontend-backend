package com.ctms.mapper;

import com.ctms.dto.response.VisitResponse;
import com.ctms.entity.VisitSchedule;
import org.springframework.stereotype.Component;

/** Maps {@link VisitSchedule} entities to {@link VisitResponse}. */
@Component
public class VisitMapper {

    public VisitResponse toResponse(VisitSchedule v) {
        if (v == null) return null;
        return VisitResponse.builder()
                .visitId(v.getVisitId())
                .trialId(v.getTrial() != null ? v.getTrial().getTrialId() : null)
                .trialName(v.getTrial() != null ? v.getTrial().getTrialName() : null)
                .patientId(v.getPatient() != null ? v.getPatient().getPatientId() : null)
                .patientName(v.getPatient() != null ? v.getPatient().getFirstName() + " " + v.getPatient().getLastName() : null)
                .doctorId(v.getDoctor() != null ? v.getDoctor().getDoctorId() : null)
                .managerId(v.getManager() != null ? v.getManager().getManagerId() : null)
                .visitNumber(v.getVisitNumber())
                .visitType(v.getVisitType())
                .scheduledDate(v.getScheduledDate())
                .windowStart(v.getWindowStart())
                .windowEnd(v.getWindowEnd())
                .actualDate(v.getActualDate())
                .visitStatus(v.getVisitStatus() != null ? v.getVisitStatus().dbValue() : null)
                .notes(v.getNotes())
                .build();
    }
}
