package com.ctms.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.AssignManagerRequest;
import com.ctms.dto.request.CreateTrialRequest;
import com.ctms.dto.request.UpdateTrialRequest;
import com.ctms.dto.response.TrialAssignmentResponse;
import com.ctms.dto.response.TrialResponse;
import com.ctms.exception.CTMSException;

import java.util.List;

/** Business logic for trial CRUD, status transitions and manager assignment. */
public interface TrialService {

    TrialResponse createTrial(CreateTrialRequest request) throws CTMSException;
    TrialResponse updateTrial(Integer trialId, UpdateTrialRequest request) throws CTMSException;
    void deleteTrial(Integer trialId) throws CTMSException;
    void updateStatus(Integer trialId, String status) throws CTMSException;
    TrialResponse getTrial(Integer trialId) throws CTMSException;
    com.ctms.dto.response.TrialDetailsResponse getTrialDetails(Integer trialId) throws CTMSException;
    Page<TrialResponse> listTrials(Pageable pageable);
    Page<TrialResponse> searchTrials(String keyword, Pageable pageable);
    long countByStatus(String status) throws CTMSException;

    TrialAssignmentResponse assignManager(Integer trialId, AssignManagerRequest request) throws CTMSException;
    List<TrialAssignmentResponse> assignmentsForTrial(Integer trialId) throws CTMSException;
}
