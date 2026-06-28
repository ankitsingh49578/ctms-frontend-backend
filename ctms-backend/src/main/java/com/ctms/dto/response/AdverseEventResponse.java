package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Read model for a reported adverse event. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdverseEventResponse {
    private Integer eventId;
    private Integer trialId;
    private Integer patientId;
    private Integer reportedById;
    private Integer createdByDoctorId;
    private String createdByDoctorName;
    private LocalDate eventDate;
    private String severity;         // Severity dbValue
    private String title;
    private String description;
    private String symptoms;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String actionsTaken;
    private Boolean requiresMedicalAttention;
    private String attachments;
    private String status;           // AdverseEventStatus dbValue
    private LocalDateTime createdAt;
    
    // Ownership details for Data Isolation / Audit
    private Integer createdByUserId;
    private String createdByName;
    private String createdByRole;
    private LocalDateTime createdDate;
}
