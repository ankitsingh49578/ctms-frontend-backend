package com.ctms.entity;

import com.ctms.enums.ConsentStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** consent_forms table. Informed-consent record for a patient on a trial. */
@Entity
@Table(name = "consent_forms")
@Getter
@Setter
@NoArgsConstructor
public class ConsentForm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "consent_id")
    private Integer consentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trial_id", nullable = false)
    private Trial trial;

    @Column(name = "consent_version", nullable = false, length = 50)
    private String consentVersion;

    @Column(name = "consent_date", nullable = false)
    private LocalDate consentDate;

    @Column(name = "consent_status", nullable = false, length = 10)
    private ConsentStatus consentStatus = ConsentStatus.PENDING;

    @Column(name = "file_path", length = 255)
    private String filePath;

    /* ---- Document metadata (PDF upload) ---- */

    @Column(name = "document_name", length = 255)
    private String documentName;

    @Column(name = "document_path", length = 500)
    private String documentPath;

    @Column(name = "document_size")
    private Long documentSize;

    @Column(name = "uploaded_by", length = 100)
    private String uploadedBy;

    @Column(name = "uploaded_date")
    private LocalDateTime uploadedDate;

    @Column(name = "signed_date")
    private LocalDateTime signedDate;
}
