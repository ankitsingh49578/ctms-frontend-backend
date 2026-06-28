package com.ctms.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.entity.VisitSchedule;
import com.ctms.enums.VisitStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VisitScheduleRepository extends JpaRepository<VisitSchedule, Integer> {

    List<VisitSchedule> findByPatient_PatientIdOrderByScheduledDateAsc(Integer patientId);

    Page<VisitSchedule> findByPatient_PatientId(Integer patientId, Pageable pageable);

    List<VisitSchedule> findByTrial_TrialIdOrderByScheduledDateAsc(Integer trialId);

    Page<VisitSchedule> findByTrial_TrialId(Integer trialId, Pageable pageable);

    List<VisitSchedule> findByDoctor_DoctorIdOrderByScheduledDateAsc(Integer doctorId);

    // findUpcoming(from, to): scheduled_date BETWEEN ... AND visit_status = 'Scheduled'
    List<VisitSchedule> findByScheduledDateBetweenAndVisitStatusOrderByScheduledDateAsc(
            LocalDate from, LocalDate to, VisitStatus visitStatus);

    long countByVisitStatus(VisitStatus visitStatus);

    /* ------------- AccessGuard ownership / assignment checks ------------- */

    /** Participant owns this visit (visit.patient.user_id = userId). */
    boolean existsByVisitIdAndPatient_User_UserId(Integer visitId, Integer userId);

    /** Login user is the doctor on this visit. */
    boolean existsByVisitIdAndDoctor_User_UserId(Integer visitId, Integer userId);

    /** Login user (a doctor) has at least one visit with this patient = "assigned". */
    boolean existsByDoctor_User_UserIdAndPatient_PatientId(Integer userId, Integer patientId);
}
