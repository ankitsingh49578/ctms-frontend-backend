package com.ctms.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.CreateEnrollmentRequest;
import com.ctms.dto.request.CreatePatientRequest;
import com.ctms.dto.request.UpdatePatientRequest;
import com.ctms.dto.response.EnrollmentResponse;
import com.ctms.dto.response.ParticipantVisitSummaryResponse;
import com.ctms.dto.response.PatientResponse;
import com.ctms.exception.CTMSException;

import java.util.List;

/** Business logic for participant registration, verification and trial enrollment. */
public interface ParticipantService {

    PatientResponse createPatient(CreatePatientRequest request) throws CTMSException;
    PatientResponse updatePatient(Integer patientId, UpdatePatientRequest request) throws CTMSException;
    void verifyParticipant(Integer patientId) throws CTMSException;
    PatientResponse getParticipant(Integer patientId) throws CTMSException;
    Page<PatientResponse> listParticipants(Pageable pageable);
    Page<PatientResponse> searchParticipants(String keyword, Pageable pageable);
    long countParticipants();
    org.springframework.core.io.Resource downloadMedicalDocument(Integer patientId) throws CTMSException;

    /** Enroll a participant into a trial (trial must exist and be Active; no duplicates). */
    EnrollmentResponse enroll(CreateEnrollmentRequest request) throws CTMSException;
    void updateEnrollmentStatus(Integer enrollmentId, String status) throws CTMSException;
    org.springframework.data.domain.Page<EnrollmentResponse> getEnrollmentsByTrial(Integer trialId, org.springframework.data.domain.Pageable pageable) throws CTMSException;
    EnrollmentResponse getEnrollment(Integer enrollmentId) throws CTMSException;
    List<EnrollmentResponse> enrollmentsForPatient(Integer patientId) throws CTMSException;

    ParticipantVisitSummaryResponse getVisitSummary(Integer patientId) throws CTMSException;
}
