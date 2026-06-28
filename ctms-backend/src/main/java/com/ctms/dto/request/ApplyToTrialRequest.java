package com.ctms.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Payload for {@code POST /api/portal/me/enrollments}: a participant applying to
 * a trial. Only the {@code trialId} is accepted — the participant id is resolved
 * server-side from the authenticated principal, so a participant can never apply
 * on behalf of someone else (which {@link CreateEnrollmentRequest}, taking an
 * explicit {@code patientId}, would otherwise allow).
 */
@Data
public class ApplyToTrialRequest {

    @NotNull(message = "trialId is required")
    @Min(value = 1, message = "trialId must be a positive id")
    private Integer trialId;
}
