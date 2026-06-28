package com.ctms.repository;

import com.ctms.entity.Trial;
import com.ctms.enums.TrialStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrialRepository extends JpaRepository<Trial, Integer> {

    Optional<Trial> findByTrialCode(String trialCode);

    boolean existsByTrialCode(String trialCode);

    // Hibernate applies the TrialStatusConverter to the parameter automatically.
    long countByStatus(TrialStatus status);

    /**
     * Paginated trials in a given lifecycle status. Backs the participant portal's
     * "browse available trials" view (which only ever requests {@code ACTIVE}); the
     * {@code TrialStatusConverter} is applied to the bound parameter automatically.
     */
    Page<Trial> findByStatus(TrialStatus status, Pageable pageable);

    @Query("""
           SELECT t FROM Trial t
           WHERE LOWER(t.trialCode) LIKE LOWER(CONCAT('%', :kw, '%'))
              OR LOWER(t.trialName) LIKE LOWER(CONCAT('%', :kw, '%'))""")
    Page<Trial> search(@Param("kw") String kw, Pageable pageable);
}
