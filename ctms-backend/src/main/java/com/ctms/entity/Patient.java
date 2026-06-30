package com.ctms.entity;

import com.ctms.enums.Gender;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * patients table (trial participants). The link to a login {@link User} is
 * optional (user_id is nullable + unique) because a participant need not have an
 * account. {@code status} is a free string because its CHECK set
 * (Active/Inactive/Pending/Verified) has no single matching enum.
 */
@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patient_id")
    private Integer patientId;

    /** Optimistic-lock version. Maps the version BIGINT column (DEFAULT 0). */
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)   // nullable on purpose
    private User user;

    @Column(name = "patient_code", nullable = false, unique = true, length = 20)
    private String patientCode;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false)
    private LocalDate dob;

    @Column(nullable = false, length = 10)
    private Gender gender;                          // converter -> Male/Female/Other

    @Column(length = 20)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "blood_group", length = 5)
    private String bloodGroup;

    @Column(nullable = false, length = 10)
    private String status = "Active";

    @Column(name = "medical_document_name", length = 255)
    private String medicalDocumentName;

    @Column(name = "medical_document_path", length = 500)
    private String medicalDocumentPath;

    @Column(name = "medical_document_size")
    private Long medicalDocumentSize;

    @Column(name = "medical_document_uploaded_date")
    private LocalDateTime medicalDocumentUploadedDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Transient
    public String fullName() {
        return firstName + " " + lastName;
    }
}
