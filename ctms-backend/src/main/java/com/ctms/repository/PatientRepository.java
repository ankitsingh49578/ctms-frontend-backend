package com.ctms.repository;

import com.ctms.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Integer> {

    Optional<Patient> findByPatientCode(String patientCode);

    boolean existsByPatientCode(String patientCode);

    Optional<Patient> findByUser_UserId(Integer userId);

    List<Patient> findByStatusOrderByPatientId(String status);

    long countByStatus(String status);

    @Query("""
           SELECT p FROM Patient p
           WHERE LOWER(p.firstName)   LIKE LOWER(CONCAT('%', :kw, '%'))
              OR LOWER(p.lastName)    LIKE LOWER(CONCAT('%', :kw, '%'))
              OR LOWER(p.patientCode) LIKE LOWER(CONCAT('%', :kw, '%'))
              OR LOWER(p.email)       LIKE LOWER(CONCAT('%', :kw, '%'))""")
    Page<Patient> search(@Param("kw") String kw, Pageable pageable);

    /**
     * Atomically obtains the next value of the {@code patient_code_seq} DB sequence.
     * Used to generate collision-free participant codes under concurrency
     * (replaces the previous, race-prone {@code count()+1} approach).
     */
    @Query(value = "SELECT nextval('patient_code_seq')", nativeQuery = true)
    long nextPatientCodeSeq();

    /** Ownership check (AccessGuard): does patient row belong to this login user? */
    boolean existsByPatientIdAndUser_UserId(Integer patientId, Integer userId);
}
