package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Read model for a clinical-manager profile. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerResponse {
    private Integer managerId;
    private Integer userId;
    private String managerName;
    private String department;
    private String phone;
}
