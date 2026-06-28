package com.ctms.entity;

import com.ctms.enums.AdverseEventStatus;
import com.ctms.enums.Severity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** adverse_events table. Safety event reported by a {@link User} for a participant. */
@Entity
@Table(name = "adverse_events")
@Getter
@Setter
@NoArgsConstructor
public class AdverseEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Integer eventId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trial_id", nullable = false)
    private Trial trial;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reported_by", nullable = false)
    private User reportedBy;

    @Column(name = "created_by_doctor_id")
    private Integer createdByDoctorId;

    @Column(name = "created_by_doctor_name", length = 150)
    private String createdByDoctorName;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(nullable = false, length = 16)
    private Severity severity;                      // Mild/Moderate/Severe/Life Threatening

    @Column(length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "actions_taken", columnDefinition = "TEXT")
    private String actionsTaken;

    @Column(name = "requires_medical_attention")
    private Boolean requiresMedicalAttention;

    @Column(columnDefinition = "TEXT")
    private String attachments; // JSON array of attachment links

    @Column(nullable = false, length = 12)
    private AdverseEventStatus status = AdverseEventStatus.REPORTED;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
