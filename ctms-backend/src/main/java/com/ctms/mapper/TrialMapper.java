package com.ctms.mapper;

import com.ctms.dto.response.TrialResponse;
import com.ctms.entity.Trial;
import org.springframework.stereotype.Component;

/** Maps {@link Trial} entities to {@link TrialResponse}. */
@Component
public class TrialMapper {

    public TrialResponse toResponse(Trial t) {
        if (t == null) return null;
        return TrialResponse.builder()
                .trialId(t.getTrialId())
                .trialCode(t.getTrialCode())
                .trialName(t.getTrialName())
                .phase(t.getPhase() != null ? t.getPhase().dbValue() : null)
                .description(t.getDescription())
                .startDate(t.getStartDate())
                .endDate(t.getEndDate())
                .status(t.getStatus() != null ? t.getStatus().dbValue() : null)
                .createdById(t.getCreatedBy() != null ? t.getCreatedBy().getUserId() : null)
                .createdAt(t.getCreatedAt())
                .build();
    }
}
