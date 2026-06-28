package com.ctms.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.RecordTestResultRequest;
import com.ctms.dto.response.TestResultResponse;
import com.ctms.exception.CTMSException;

import java.util.List;

/** Business logic for recording and tracking clinical/lab test results. */
public interface TestResultService {

    TestResultResponse recordResult(RecordTestResultRequest request) throws CTMSException;
    void updateStatus(Integer resultId, String status) throws CTMSException;
    void deleteResult(Integer resultId) throws CTMSException;
    TestResultResponse getResult(Integer resultId) throws CTMSException;
    List<TestResultResponse> resultsForPatient(Integer patientId) throws CTMSException;
    List<TestResultResponse> resultsForVisit(Integer visitId) throws CTMSException;
    Page<TestResultResponse> searchResults(String keyword, Pageable pageable);
    Page<TestResultResponse> listResults(Pageable pageable);
    Page<com.ctms.dto.response.PatientTestResultSummaryResponse> getPatientSummaries(String keyword, Pageable pageable);
    long countResults();
}
