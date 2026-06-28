package com.ctms.repository;

import com.ctms.entity.Analytics;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnalyticsRepository extends JpaRepository<Analytics, Integer> {

    // latestAnalytics(): ORDER BY generated_at DESC LIMIT 1
    Optional<Analytics> findTopByOrderByGeneratedAtDesc();

    List<Analytics> findByOrderByGeneratedAtDesc(Pageable pageable);
}
