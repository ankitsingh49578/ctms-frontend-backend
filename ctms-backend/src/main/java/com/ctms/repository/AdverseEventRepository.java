package com.ctms.repository;

import com.ctms.entity.AdverseEvent;
import com.ctms.enums.Severity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdverseEventRepository extends JpaRepository<AdverseEvent, Integer> {
    List<AdverseEvent> findByTrial_TrialIdOrderByEventDateDesc(Integer trialId);
    List<AdverseEvent> findByTrial_TrialIdAndCreatedByDoctorIdOrderByEventDateDesc(Integer trialId, Integer doctorId);
    List<AdverseEvent> findByPatient_PatientIdOrderByEventDateDesc(Integer patientId);
    List<AdverseEvent> findByPatient_PatientIdAndCreatedByDoctorIdOrderByEventDateDesc(Integer patientId, Integer doctorId);
    long countBySeverity(Severity severity);

    /** Ownership check (AccessGuard): adverse event belongs to the login user's patient row. */
    boolean existsByEventIdAndPatient_User_UserId(Integer eventId, Integer userId);
}
