package com.ctms.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.CreateDoctorRequest;
import com.ctms.dto.request.UpdateDoctorRequest;
import com.ctms.dto.response.DoctorResponse;
import com.ctms.entity.Doctor;
import com.ctms.entity.User;
import com.ctms.exception.BusinessException;
import com.ctms.exception.CTMSException;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.exception.ValidationException;
import com.ctms.mapper.DoctorMapper;
import com.ctms.repository.DoctorRepository;
import com.ctms.repository.UserRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.AuditService;
import com.ctms.service.DoctorService;
import com.ctms.validation.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * {@link DoctorService} implementation migrated from the legacy DoctorServiceImpl.
 * Name/phone validation, linked-user existence, the one-profile-per-user rule and
 * license-number uniqueness are preserved; the user_id int FK is now a real 1:1
 * {@link User} association.
 */
@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private static final Logger log = LoggerFactory.getLogger(DoctorServiceImpl.class);

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final AuditService audit;
    private final CurrentUserContext currentUser;
    private final DoctorMapper doctorMapper;

    @Override
    @Transactional
    public DoctorResponse createDoctor(CreateDoctorRequest req) throws CTMSException {
        log.info("Creating doctor profile name='{}'", req.getDoctorName());
        ValidationUtil.requireNonBlank(req.getDoctorName(), "doctorName");
        ValidationUtil.requirePositive(req.getUserId() == null ? 0 : req.getUserId(), "userId");
        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            ValidationUtil.validatePhone(req.getPhone());
        }
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Linked user not found: id=" + req.getUserId()));
        if (doctorRepository.existsByUser_UserId(req.getUserId())) {
            throw new ValidationException("A doctor profile already exists for this user");
        }
        if (req.getLicenseNo() != null && !req.getLicenseNo().isBlank()
                && doctorRepository.existsByLicenseNo(req.getLicenseNo())) {
            throw new ValidationException("License number already in use: " + req.getLicenseNo());
        }

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setDoctorName(req.getDoctorName());
        doctor.setSpecialization(req.getSpecialization());
        doctor.setLicenseNo(req.getLicenseNo());
        doctor.setPhone(req.getPhone());
        doctor.setProfileImage(req.getProfileImage());

        Doctor saved = doctorRepository.save(doctor);
        audit.record(currentUser.currentUserId(), "CREATE_DOCTOR", "Doctor");
        log.info("Doctor profile created id={}", saved.getDoctorId());
        return doctorMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public DoctorResponse updateDoctor(Integer doctorId, UpdateDoctorRequest req) throws CTMSException {
        log.info("Updating doctor id={}", doctorId);
        Doctor doctor = loadDoctor(doctorId);
        if (req.getDoctorName() != null && !req.getDoctorName().isBlank()) doctor.setDoctorName(req.getDoctorName());
        if (req.getSpecialization() != null) doctor.setSpecialization(req.getSpecialization());
        if (req.getPhone() != null) {
            if (!req.getPhone().isBlank()) ValidationUtil.validatePhone(req.getPhone());
            doctor.setPhone(req.getPhone());
        }
        if (req.getLicenseNo() != null && !req.getLicenseNo().equals(doctor.getLicenseNo())) {
            if (!req.getLicenseNo().isBlank() && doctorRepository.existsByLicenseNo(req.getLicenseNo())) {
                throw new ValidationException("License number already in use: " + req.getLicenseNo());
            }
            doctor.setLicenseNo(req.getLicenseNo());
        }
        if (req.getProfileImage() != null) doctor.setProfileImage(req.getProfileImage());

        Doctor saved = doctorRepository.save(doctor);
        audit.record(currentUser.currentUserId(), "UPDATE_DOCTOR", "Doctor");
        log.info("Doctor updated id={}", doctorId);
        return doctorMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public DoctorResponse updateDoctorProfile(Integer doctorId, com.ctms.dto.request.UpdateDoctorProfileRequest req) throws CTMSException {
        log.info("Doctor self-updating profile id={}", doctorId);
        Doctor doctor = loadDoctor(doctorId);
        if (req.getPhone() != null) {
            if (!req.getPhone().isBlank()) ValidationUtil.validatePhone(req.getPhone());
            doctor.setPhone(req.getPhone());
        }
        if (req.getAddress() != null) doctor.setAddress(req.getAddress());
        if (req.getProfileImage() != null) doctor.setProfileImage(req.getProfileImage());
        if (req.getEmergencyContact() != null) doctor.setEmergencyContact(req.getEmergencyContact());

        Doctor saved = doctorRepository.save(doctor);
        audit.record(currentUser.currentUserId(), "UPDATE_DOCTOR_PROFILE", "Doctor");
        log.info("Doctor profile self-updated id={}", doctorId);
        return doctorMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteDoctor(Integer doctorId) throws CTMSException {
        log.info("Deleting doctor id={}", doctorId);
        Doctor doctor = loadDoctor(doctorId);
        try {
            doctorRepository.delete(doctor);
            doctorRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException(
                    "Cannot delete doctor id=" + doctorId + ": it is referenced by other records");
        }
        audit.record(currentUser.currentUserId(), "DELETE_DOCTOR", "Doctor");
        log.info("Doctor deleted id={}", doctorId);
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse getDoctor(Integer doctorId) throws CTMSException {
        return doctorMapper.toResponse(loadDoctor(doctorId));
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse getDoctorByUser(Integer userId) throws CTMSException {
        Doctor doctor = doctorRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No doctor profile for user id=" + userId));
        return doctorMapper.toResponse(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponse> listDoctors(Pageable pageable) {
        return doctorRepository.findAll(pageable).map(doctorMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponse> searchDoctors(String keyword, Pageable pageable) {
        return doctorRepository.search(keyword == null ? "" : keyword, pageable)
                .map(doctorMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean doctorExists(Integer doctorId) {
        return doctorRepository.existsById(doctorId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countDoctors() {
        return doctorRepository.count();
    }

    /* ------------------------------------------------------------------ */

    private Doctor loadDoctor(Integer doctorId) throws ResourceNotFoundException {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: id=" + doctorId));
    }
}
