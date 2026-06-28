package com.ctms.dto.request;

import lombok.Data;

import java.time.LocalDate;

/** Payload for PUT /api/visits/{id}/complete. actualDate optional (defaults to today). */
@Data
public class CompleteVisitRequest {
    private LocalDate actualDate;
}
