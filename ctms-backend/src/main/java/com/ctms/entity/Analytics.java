package com.ctms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** analytics table. A point-in-time KPI snapshot of the whole programme. */
@Entity
@Table(name = "analytics")
@Getter
@Setter
@NoArgsConstructor
public class Analytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analytics_id")
    private Integer analyticsId;

    @Column(name = "metric_date", nullable = false)
    private LocalDate metricDate;

    @Column(name = "active_trials", nullable = false)
    private Integer activeTrials = 0;

    @Column(name = "total_patients", nullable = false)
    private Integer totalPatients = 0;

    @Column(name = "enrolled_patients", nullable = false)
    private Integer enrolledPatients = 0;

    @Column(name = "completion_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal completionRate = BigDecimal.ZERO;

    @Column(name = "compliance_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal complianceRate = BigDecimal.ZERO;

    @Column(name = "pending_visits", nullable = false)
    private Integer pendingVisits = 0;

    @Column(name = "overdue_visits", nullable = false)
    private Integer overdueVisits = 0;

    @CreationTimestamp
    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;
}
