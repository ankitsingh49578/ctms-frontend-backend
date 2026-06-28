package com.ctms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/** Payload for PUT /api/visits/{id}/reschedule. */
@Data
public class RescheduleVisitRequest {
    @NotNull(message = "newDate is required")
    private LocalDate newDate;
}
