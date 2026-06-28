package com.ctms.entity;

import com.ctms.enums.AssignmentRole;
import com.ctms.enums.UserStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** trial_assignments table. Assigns a {@link ClinicalManager} to a {@link Trial} in a role. */
@Entity
@Table(name = "trial_assignments")
@Getter
@Setter
@NoArgsConstructor
public class TrialAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Integer assignmentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trial_id", nullable = false)
    private Trial trial;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "manager_id", nullable = false)
    private ClinicalManager manager;

    @Column(nullable = false, length = 12)
    private AssignmentRole role;                    // Manager/Coordinator/Monitor

    @Column(name = "assigned_date", nullable = false)
    private LocalDate assignedDate;

    @Column(nullable = false, length = 10)
    private UserStatus status = UserStatus.ACTIVE;
}
