package com.ctms.repository;

import com.ctms.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Integer> {

    Optional<Enrollment> findByPatient_PatientIdAndTrial_TrialId(Integer patientId, Integer trialId);

    boolean existsByPatient_PatientIdAndTrial_TrialId(Integer patientId, Integer trialId);

    List<Enrollment> findByPatient_PatientIdOrderByEnrollmentIdDesc(Integer patientId);

    List<Enrollment> findByTrial_TrialIdOrderByEnrollmentIdDesc(Integer trialId);

    /** Ownership check (AccessGuard): enrollment belongs to the login user's patient row. */
    boolean existsByEnrollmentIdAndPatient_User_UserId(Integer enrollmentId, Integer userId);
}
