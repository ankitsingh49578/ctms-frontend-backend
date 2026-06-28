package com.ctms.mapper;

import com.ctms.dto.response.ConsentResponse;
import com.ctms.entity.ConsentForm;
import org.springframework.stereotype.Component;

/** Maps {@link ConsentForm} entities to {@link ConsentResponse}. */
@Component
public class ConsentMapper {

    public ConsentResponse toResponse(ConsentForm c) {
        if (c == null) return null;
        return ConsentResponse.builder()
                .consentId(c.getConsentId())
                .patientId(c.getPatient() != null ? c.getPatient().getPatientId() : null)
                .patientName(c.getPatient() != null ? c.getPatient().fullName() : null)
                .trialId(c.getTrial() != null ? c.getTrial().getTrialId() : null)
                .trialName(c.getTrial() != null ? c.getTrial().getTrialName() : null)
                .consentVersion(c.getConsentVersion())
                .consentDate(c.getConsentDate())
                .consentStatus(c.getConsentStatus() != null ? c.getConsentStatus().dbValue() : null)
                .filePath(c.getFilePath())
                .build();
    }
}
