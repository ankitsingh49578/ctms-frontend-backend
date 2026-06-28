package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/** Read model aggregating test results per patient. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientTestResultSummaryResponse {
    private Integer patientId;
    private String patientName;
    private String trialName;
    private LocalDate latestResultDate;
    private Long totalResults;
    private String status;
}
