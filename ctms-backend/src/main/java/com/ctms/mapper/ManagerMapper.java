package com.ctms.mapper;

import com.ctms.dto.response.ManagerResponse;
import com.ctms.entity.ClinicalManager;
import org.springframework.stereotype.Component;

/** Maps {@link ClinicalManager} entities to {@link ManagerResponse}. */
@Component
public class ManagerMapper {

    public ManagerResponse toResponse(ClinicalManager m) {
        if (m == null) return null;
        return ManagerResponse.builder()
                .managerId(m.getManagerId())
                .userId(m.getUser() != null ? m.getUser().getUserId() : null)
                .managerName(m.getManagerName())
                .department(m.getDepartment())
                .phone(m.getPhone())
                .build();
    }
}
