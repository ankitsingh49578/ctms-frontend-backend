package com.ctms.repository;

import com.ctms.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Integer> {

    Optional<Doctor> findByUser_UserId(Integer userId);

    boolean existsByUser_UserId(Integer userId);

    boolean existsByLicenseNo(String licenseNo);

    @Query("""
           SELECT d FROM Doctor d
           WHERE LOWER(d.doctorName)     LIKE LOWER(CONCAT('%', :kw, '%'))
              OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :kw, '%'))
              OR LOWER(d.licenseNo)      LIKE LOWER(CONCAT('%', :kw, '%'))""")
    Page<Doctor> search(@Param("kw") String kw, Pageable pageable);

    /** Ownership check (AccessGuard): does doctor profile belong to this login user? */
    boolean existsByDoctorIdAndUser_UserId(Integer doctorId, Integer userId);
}
