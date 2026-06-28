package com.ctms.mapper;

import com.ctms.dto.response.TrialAssignmentResponse;
import com.ctms.entity.TrialAssignment;
import org.springframework.stereotype.Component;

/** Maps {@link TrialAssignment} entities to {@link TrialAssignmentResponse}. */
@Component
public class TrialAssignmentMapper {

    public TrialAssignmentResponse toResponse(TrialAssignment a) {
        if (a == null) return null;
        return TrialAssignmentResponse.builder()
                .assignmentId(a.getAssignmentId())
                .trialId(a.getTrial() != null ? a.getTrial().getTrialId() : null)
                .managerId(a.getManager() != null ? a.getManager().getManagerId() : null)
                .role(a.getRole() != null ? a.getRole().dbValue() : null)
                .assignedDate(a.getAssignedDate())
                .status(a.getStatus() != null ? a.getStatus().dbValue() : null)
                .build();
    }
}
