package com.ctms.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.CreateVisitRequest;
import com.ctms.dto.response.VisitResponse;
import com.ctms.exception.CTMSException;

import java.time.LocalDate;
import java.util.List;

/** Business logic for scheduling trial visits and their status lifecycle. */
public interface VisitService {

    VisitResponse scheduleVisit(CreateVisitRequest request) throws CTMSException;
    void rescheduleVisit(Integer visitId, LocalDate newDate) throws CTMSException;
    void markCompleted(Integer visitId, LocalDate actualDate) throws CTMSException;
    void markMissed(Integer visitId) throws CTMSException;
    void cancelVisit(Integer visitId) throws CTMSException;
    VisitResponse getVisit(Integer visitId) throws CTMSException;
    Page<VisitResponse> visitsForPatient(Integer patientId, Pageable pageable) throws CTMSException;
    Page<VisitResponse> visitsForTrial(Integer trialId, Pageable pageable) throws CTMSException;
    List<VisitResponse> upcomingVisits(LocalDate from, LocalDate to);
    List<VisitResponse> visitsForDoctor(Integer doctorId) throws CTMSException;
    long countByStatus(String status) throws CTMSException;
}
