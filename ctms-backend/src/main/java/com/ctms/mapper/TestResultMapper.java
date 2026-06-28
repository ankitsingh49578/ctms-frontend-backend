package com.ctms.mapper;

import com.ctms.dto.response.TestResultResponse;
import com.ctms.entity.TestResult;
import org.springframework.stereotype.Component;

/** Maps {@link TestResult} entities to {@link TestResultResponse}. */
@Component
public class TestResultMapper {

    public TestResultResponse toResponse(TestResult r) {
        if (r == null) return null;
        return TestResultResponse.builder()
                .resultId(r.getResultId())
                .visitId(r.getVisit() != null ? r.getVisit().getVisitId() : null)
                .patientId(r.getPatient() != null ? r.getPatient().getPatientId() : null)
                .patientName(r.getPatient() != null ? r.getPatient().getFirstName() + " " + r.getPatient().getLastName() : null)
                .visitDate(r.getVisit() != null ? (r.getVisit().getActualDate() != null ? r.getVisit().getActualDate() : r.getVisit().getScheduledDate()) : null)
                .doctorId(r.getDoctor() != null ? r.getDoctor().getDoctorId() : null)
                .doctorName(r.getDoctor() != null ? r.getDoctor().getDoctorName() : null)
                .trialId(r.getVisit() != null && r.getVisit().getTrial() != null ? r.getVisit().getTrial().getTrialId() : null)
                .trialName(r.getVisit() != null && r.getVisit().getTrial() != null ? r.getVisit().getTrial().getTrialName() : null)
                .trialCode(r.getVisit() != null && r.getVisit().getTrial() != null ? r.getVisit().getTrial().getTrialCode() : null)
                .testName(r.getTestName())
                .resultValue(r.getResultValue())
                .unit(r.getUnit())
                .resultStatus(r.getResultStatus() != null ? r.getResultStatus().dbValue() : null)
                .collectedDate(r.getCollectedDate())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
