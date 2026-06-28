package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Read model for a trial-to-manager assignment. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialAssignmentResponse {
    private Integer assignmentId;
    private Integer trialId;
    private Integer managerId;
    private String role;             // AssignmentRole dbValue
    private LocalDate assignedDate;
    private String status;           // UserStatus dbValue
}
