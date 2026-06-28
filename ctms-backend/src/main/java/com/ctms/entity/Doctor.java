package com.ctms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** doctors table. 1:1 with {@link User} (a doctor profile always has a login account). */
@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "doctor_id")
    private Integer doctorId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "doctor_name", nullable = false, length = 150)
    private String doctorName;

    @Column(length = 150)
    private String specialization;

    @Column(name = "license_no", unique = true, length = 100)
    private String licenseNo;

    @Column(length = 20)
    private String phone;

    @Column(name = "profile_image", length = 255)
    private String profileImage;

    @Column(name = "employee_id", unique = true, length = 50)
    private String employeeId;

    @Column(length = 100)
    private String department;

    @Column(length = 100)
    private String designation;

    @Column(length = 150)
    private String qualification;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "emergency_contact", length = 100)
    private String emergencyContact;
}
