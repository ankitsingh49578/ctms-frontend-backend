package com.ctms.repository;

import com.ctms.entity.TestResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestResultRepository extends JpaRepository<TestResult, Integer> {

    List<TestResult> findByPatient_PatientIdOrderByCollectedDateDesc(Integer patientId);

    List<TestResult> findByVisit_VisitIdOrderByCollectedDateDesc(Integer visitId);

    List<TestResult> findByVisit_Trial_TrialIdOrderByCollectedDateDesc(Integer trialId);

    @Query("""
           SELECT r FROM TestResult r
           WHERE LOWER(r.testName)    LIKE LOWER(CONCAT('%', :kw, '%'))
              OR LOWER(r.resultValue) LIKE LOWER(CONCAT('%', :kw, '%'))""")
    Page<TestResult> search(@Param("kw") String kw, Pageable pageable);

    /** Ownership check (AccessGuard): result belongs to the login user's patient row. */
    boolean existsByResultIdAndPatient_User_UserId(Integer resultId, Integer userId);

    @Query("""
           SELECT r.patient.patientId, CONCAT(r.patient.firstName, ' ', r.patient.lastName), r.visit.trial.trialName,
                  MAX(r.collectedDate), COUNT(r.resultId)
           FROM TestResult r
           WHERE LOWER(CONCAT(r.patient.firstName, ' ', r.patient.lastName)) LIKE LOWER(CONCAT('%', :kw, '%'))
              OR CAST(r.patient.patientId AS string) LIKE :kw
           GROUP BY r.patient.patientId, r.patient.firstName, r.patient.lastName, r.visit.trial.trialName""")
    Page<Object[]> searchPatientSummariesRaw(@Param("kw") String kw, Pageable pageable);

    Page<TestResult> findByDoctor_DoctorId(Integer doctorId, Pageable pageable);

    @Query("""
           SELECT r FROM TestResult r
           WHERE r.doctor.doctorId = :doctorId AND (LOWER(r.testName) LIKE LOWER(CONCAT('%', :kw, '%'))
              OR LOWER(r.resultValue) LIKE LOWER(CONCAT('%', :kw, '%')))""")
    Page<TestResult> searchByDoctorId(@Param("kw") String kw, @Param("doctorId") Integer doctorId, Pageable pageable);

    @Query("""
           SELECT r.patient.patientId, CONCAT(r.patient.firstName, ' ', r.patient.lastName), r.visit.trial.trialName,
                  MAX(r.collectedDate), COUNT(r.resultId)
           FROM TestResult r
           WHERE r.doctor.doctorId = :doctorId AND (LOWER(CONCAT(r.patient.firstName, ' ', r.patient.lastName)) LIKE LOWER(CONCAT('%', :kw, '%'))
              OR CAST(r.patient.patientId AS string) LIKE :kw)
           GROUP BY r.patient.patientId, r.patient.firstName, r.patient.lastName, r.visit.trial.trialName""")
    Page<Object[]> searchPatientSummariesRawByDoctor(@Param("kw") String kw, @Param("doctorId") Integer doctorId, Pageable pageable);

    long countByDoctor_DoctorId(Integer doctorId);
}
