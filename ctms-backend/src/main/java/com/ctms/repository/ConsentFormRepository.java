package com.ctms.repository;

import com.ctms.entity.ConsentForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsentFormRepository extends JpaRepository<ConsentForm, Integer> {
    List<ConsentForm> findByPatient_PatientIdOrderByConsentIdDesc(Integer patientId);
    List<ConsentForm> findByTrial_TrialIdOrderByConsentIdDesc(Integer trialId);

    /** Ownership check (AccessGuard): consent belongs to the login user's patient row. */
    boolean existsByConsentIdAndPatient_User_UserId(Integer consentId, Integer userId);
}
