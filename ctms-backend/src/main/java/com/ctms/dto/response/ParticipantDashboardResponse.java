package com.ctms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Composite payload for {@code GET /api/portal/me/dashboard}: a handful of live,
 * self-scoped counts that let a participant see their trial activity at a glance.
 * Every figure is derived from the calling participant's own rows only.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDashboardResponse {

    /** Participant primary key (their own). */
    private Integer patientId;

    /** Display name, for the dashboard header. */
    private String fullName;

    /** Verification/lifecycle status of the participant record (e.g. Pending, Verified). */
    private String accountStatus;

    /** Total enrollments across all trials this participant has ever joined. */
    private long totalEnrollments;

    /** Enrollments still in screening — i.e. applications awaiting a decision. */
    private long pendingApplications;

    /** Enrollments currently in the active {@code Enrolled} state. */
    private long activeEnrollments;

    /** Consent forms awaiting this participant's signature ({@code Pending}). */
    private long pendingConsents;

    /** Total scheduled visits on this participant's calendar. */
    private long totalVisits;

    /** Unread notifications for this participant's account. */
    private long unreadNotifications;
}
