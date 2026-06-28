package com.ctms.entity;

import com.ctms.enums.TestResultStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** test_results table. A lab/clinical result captured at a {@link VisitSchedule}. */
@Entity
@Table(name = "test_results")
@Getter
@Setter
@NoArgsConstructor
public class TestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Integer resultId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "visit_id", nullable = false)
    private VisitSchedule visit;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "test_name", nullable = false, length = 150)
    private String testName;

    @Column(name = "result_value", columnDefinition = "TEXT")
    private String resultValue;

    @Column(length = 50)
    private String unit;

    @Column(name = "result_status", nullable = false, length = 12)
    private TestResultStatus resultStatus = TestResultStatus.NORMAL;

    @Column(name = "collected_date", nullable = false)
    private LocalDate collectedDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
