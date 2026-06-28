package com.ctms.service;

import com.ctms.dto.request.CreateConsentRequest;
import com.ctms.dto.response.ConsentResponse;
import com.ctms.exception.CTMSException;

import java.util.List;

/** Business logic for informed-consent records and their status lifecycle. */
public interface ConsentService {

    ConsentResponse createConsent(CreateConsentRequest request) throws CTMSException;
    void signConsent(Integer consentId) throws CTMSException;
    void declineConsent(Integer consentId) throws CTMSException;
    void withdrawConsent(Integer consentId) throws CTMSException;
    ConsentResponse getConsent(Integer consentId) throws CTMSException;
    List<ConsentResponse> consentsForPatient(Integer patientId) throws CTMSException;
    List<ConsentResponse> consentsForTrial(Integer trialId) throws CTMSException;
}
