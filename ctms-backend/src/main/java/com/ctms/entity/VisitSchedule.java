package com.ctms.entity;

import com.ctms.enums.VisitStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** visit_schedule table. A planned trial visit; doctor and manager are optional. */
@Entity
@Table(name = "visit_schedule")
@Getter
@Setter
@NoArgsConstructor
public class VisitSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "visit_id")
    private Integer visitId;

    /** Optimistic-lock version. Maps the version BIGINT column (DEFAULT 0). */
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trial_id", nullable = false)
    private Trial trial;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")                 // nullable (ON DELETE SET NULL)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")                // nullable (ON DELETE SET NULL)
    private ClinicalManager manager;

    @Column(name = "visit_number", nullable = false)
    private Integer visitNumber;

    @Column(name = "visit_type", nullable = false, length = 100)
    private String visitType;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "window_start")
    private LocalDate windowStart;

    @Column(name = "window_end")
    private LocalDate windowEnd;

    @Column(name = "actual_date")
    private LocalDate actualDate;

    @Column(name = "visit_status", nullable = false, length = 12)
    private VisitStatus visitStatus = VisitStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
