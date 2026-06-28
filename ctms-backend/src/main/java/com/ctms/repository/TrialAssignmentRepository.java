package com.ctms.repository;

import com.ctms.entity.TrialAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrialAssignmentRepository extends JpaRepository<TrialAssignment, Integer> {
    List<TrialAssignment> findByTrial_TrialIdOrderByAssignmentId(Integer trialId);
    List<TrialAssignment> findByManager_ManagerIdOrderByAssignmentId(Integer managerId);

    /** Scope check (AccessGuard): login user's clinical-manager profile is assigned to the trial. */
    boolean existsByTrial_TrialIdAndManager_User_UserId(Integer trialId, Integer userId);
}
