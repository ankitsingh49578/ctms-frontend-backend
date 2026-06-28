package com.ctms.entity;

import com.ctms.enums.EnrollmentStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * enrollments table. Joins a {@link Patient} to a {@link Trial}; the
 * (patient_id, trial_id) pair is unique so a participant cannot be enrolled twice.
 */
@Entity
@Table(name = "enrollments",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_patient_trial", columnNames = {"patient_id", "trial_id"}))
@Getter
@Setter
@NoArgsConstructor
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "enrollment_id")
    private Integer enrollmentId;

    /** Optimistic-lock version. Maps the version BIGINT column (DEFAULT 0). */
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trial_id", nullable = false)
    private Trial trial;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate;

    @Column(nullable = false, length = 12)
    private EnrollmentStatus status = EnrollmentStatus.SCREENING;
}
