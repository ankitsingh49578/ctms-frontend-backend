package com.ctms.repository;

import com.ctms.entity.Report;
import com.ctms.enums.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Integer> {

    List<Report> findAllByOrderByGeneratedDateDesc();

    List<Report> findByTrial_TrialIdOrderByGeneratedDateDesc(Integer trialId);

    List<Report> findByReportTypeOrderByGeneratedDateDesc(ReportType reportType);

    Optional<Report> findTopByOrderByGeneratedDateDesc();
}
