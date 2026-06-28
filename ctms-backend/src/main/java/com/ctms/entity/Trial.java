package com.ctms.entity;

import com.ctms.enums.TrialPhase;
import com.ctms.enums.TrialStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** trials table. A clinical study with a phase, status lifecycle and a creator. */
@Entity
@Table(name = "trials")
@Getter
@Setter
@NoArgsConstructor
public class Trial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trial_id")
    private Integer trialId;

    /** Optimistic-lock version. Maps the version BIGINT column (DEFAULT 0). */
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @Column(name = "trial_code", nullable = false, unique = true, length = 20)
    private String trialCode;

    @Column(name = "trial_name", nullable = false, length = 255)
    private String trialName;

    @Column(nullable = false, length = 4)
    private TrialPhase phase;                       // converter -> I/II/III/IV

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(nullable = false, length = 12)
    private TrialStatus status = TrialStatus.PENDING;   // dbValue 'Planned'

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
