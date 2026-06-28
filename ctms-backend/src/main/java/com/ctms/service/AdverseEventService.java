package com.ctms.service;

import com.ctms.dto.request.ReportAdverseEventRequest;
import com.ctms.dto.response.AdverseEventResponse;
import com.ctms.exception.CTMSException;

import java.util.List;

/** Business logic for reporting and tracking adverse safety events. */
public interface AdverseEventService {

    AdverseEventResponse reportEvent(ReportAdverseEventRequest request) throws CTMSException;
    void updateStatus(Integer eventId, String status) throws CTMSException;
    AdverseEventResponse getEvent(Integer eventId) throws CTMSException;
    List<AdverseEventResponse> eventsForTrial(Integer trialId) throws CTMSException;
    List<AdverseEventResponse> eventsForPatient(Integer patientId) throws CTMSException;
    long countBySeverity(String severity) throws CTMSException;
}
