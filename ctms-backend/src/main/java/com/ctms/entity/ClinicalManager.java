package com.ctms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** clinical_managers table. 1:1 with {@link User}. */
@Entity
@Table(name = "clinical_managers")
@Getter
@Setter
@NoArgsConstructor
public class ClinicalManager {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "manager_id")
    private Integer managerId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "manager_name", nullable = false, length = 150)
    private String managerName;

    @Column(length = 150)
    private String department;

    @Column(length = 20)
    private String phone;
}
