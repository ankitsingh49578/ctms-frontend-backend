package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Read model for an informed-consent record. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsentResponse {
    private Integer consentId;
    private Integer patientId;
    private Integer trialId;
    private String patientName;
    private String trialName;
    private String consentVersion;
    private LocalDate consentDate;
    private String consentStatus;    // ConsentStatus dbValue
    private String filePath;
}
