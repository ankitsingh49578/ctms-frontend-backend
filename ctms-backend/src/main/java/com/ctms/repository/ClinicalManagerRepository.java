package com.ctms.repository;

import com.ctms.entity.ClinicalManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClinicalManagerRepository extends JpaRepository<ClinicalManager, Integer> {

    Optional<ClinicalManager> findByUser_UserId(Integer userId);

    boolean existsByUser_UserId(Integer userId);

    @Query("""
           SELECT m FROM ClinicalManager m
           WHERE LOWER(m.managerName) LIKE LOWER(CONCAT('%', :kw, '%'))
              OR LOWER(m.department)  LIKE LOWER(CONCAT('%', :kw, '%'))""")
    Page<ClinicalManager> search(@Param("kw") String kw, Pageable pageable);
}
