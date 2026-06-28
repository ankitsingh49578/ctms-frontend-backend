package com.ctms.service;

import com.ctms.dto.request.CreateConsentRequest;
import com.ctms.dto.response.ConsentResponse;
import com.ctms.exception.CTMSException;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/** Business logic for informed-consent records and their status lifecycle. */
public interface ConsentService {

    ConsentResponse createConsent(CreateConsentRequest request, MultipartFile document) throws CTMSException;
    void signConsent(Integer consentId) throws CTMSException;
    void declineConsent(Integer consentId) throws CTMSException;
    void withdrawConsent(Integer consentId) throws CTMSException;
    ConsentResponse getConsent(Integer consentId) throws CTMSException;
    List<ConsentResponse> consentsForPatient(Integer patientId) throws CTMSException;
    List<ConsentResponse> consentsForTrial(Integer trialId) throws CTMSException;

    /** Loads the physical PDF document for a consent record. */
    Resource getConsentDocument(Integer consentId) throws CTMSException;

    /** Returns the original filename of the uploaded document. */
    String getConsentDocumentName(Integer consentId) throws CTMSException;
}
