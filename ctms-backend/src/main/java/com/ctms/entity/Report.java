package com.ctms.entity;

import com.ctms.enums.ReportType;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/** reports table. A generated report; trial is optional (system-wide reports allowed). */
@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Integer reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trial_id")                  // nullable
    private Trial trial;

    @Column(name = "report_name", nullable = false, length = 150)
    private String reportName;

    @Column(name = "report_type", nullable = false, length = 12)
    private ReportType reportType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "generated_by", nullable = false)
    private User generatedBy;

    @CreationTimestamp
    @Column(name = "generated_date", updatable = false)
    private LocalDateTime generatedDate;

    @Column(name = "file_path", length = 255)
    private String filePath;
}
