package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestResultSummaryResponse {
    private long totalTests;
    private long pendingResults;
    private long abnormalResults;
}
