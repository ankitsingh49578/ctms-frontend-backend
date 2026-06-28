package com.ctms.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.CreateDoctorRequest;
import com.ctms.dto.request.UpdateDoctorRequest;
import com.ctms.dto.response.DoctorResponse;
import com.ctms.exception.CTMSException;

import java.util.List;

/** Business logic for doctor profiles (1:1 with a user account). */
public interface DoctorService {

    DoctorResponse createDoctor(CreateDoctorRequest request) throws CTMSException;
    DoctorResponse updateDoctor(Integer doctorId, UpdateDoctorRequest request) throws CTMSException;
    DoctorResponse updateDoctorProfile(Integer doctorId, com.ctms.dto.request.UpdateDoctorProfileRequest request) throws CTMSException;
    void deleteDoctor(Integer doctorId) throws CTMSException;
    DoctorResponse getDoctor(Integer doctorId) throws CTMSException;
    DoctorResponse getDoctorByUser(Integer userId) throws CTMSException;
    Page<DoctorResponse> listDoctors(Pageable pageable);
    Page<DoctorResponse> searchDoctors(String keyword, Pageable pageable);
    boolean doctorExists(Integer doctorId);
    long countDoctors();
}
