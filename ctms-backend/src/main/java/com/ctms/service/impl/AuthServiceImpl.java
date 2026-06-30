package com.ctms.service.impl;

import com.ctms.config.CtmsSecurityProperties;
import com.ctms.dto.response.AuthResponse;
import com.ctms.dto.response.UserResponse;
import com.ctms.entity.User;
import com.ctms.entity.UserSession;
import com.ctms.enums.UserStatus;
import com.ctms.exception.AuthenticationException;
import com.ctms.exception.CTMSException;
import com.ctms.mapper.UserMapper;
import com.ctms.mapper.PatientMapper;
import com.ctms.repository.RoleRepository;
import com.ctms.repository.PatientRepository;
import com.ctms.repository.UserRepository;
import com.ctms.repository.UserSessionRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.AuditService;
import com.ctms.service.AuthService;
import com.ctms.util.PasswordUtil;
import com.ctms.util.TokenUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ctms.entity.Role;
import com.ctms.entity.Patient;
import com.ctms.enums.Gender;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import com.ctms.service.AuthService;


/**
 * {@link AuthService} implementation migrated from the legacy AuthServiceImpl.
 * The ThreadLocal SessionManager is replaced by {@link CurrentUserContext}
 * (populated per-request by the auth interceptor); everything else — credential
 * checks, stale-session cleanup, token issuance and audit — is preserved.
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final AuditService auditService;
    private final CurrentUserContext currentUserContext;
    private final UserMapper userMapper;
    private final PatientMapper patientMapper;
    private final RoleRepository roleRepository;
    private final PatientRepository patientRepository;
    private final CtmsSecurityProperties securityProperties;
    private final com.ctms.service.FileStorageService fileStorageService;

    @Override
    @Transactional
    public AuthResponse login(String username, String rawPassword, String ipAddress) throws CTMSException {
        log.info("Login attempt for username='{}'", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Login failed - unknown username='{}'", username);
                    return new AuthenticationException("Invalid username or password");
                });

        if (user.getStatus() != UserStatus.ACTIVE) {
            log.warn("Login blocked - inactive account username='{}'", username);
            throw new AuthenticationException("Account is inactive. Contact administrator.");
        }
        if (!PasswordUtil.verify(rawPassword, user.getPassword())) {
            log.warn("Login failed - bad password username='{}'", username);
            throw new AuthenticationException("Invalid username or password");
        }

        // Close any stale sessions, then open a fresh one.
        closeActiveSessions(user.getUserId());
        String token = TokenUtil.generateToken();
        UserSession session = new UserSession();
        session.setUser(user);
        session.setToken(token);
        session.setIpAddress(ipAddress);
        session.setActive(true);
        long validity = securityProperties.getTokenValidityMinutes();
        if (validity > 0) {
            session.setExpiresAt(LocalDateTime.now().plusMinutes(validity));
        }
        userSessionRepository.save(session);

        auditService.record(user.getUserId(), "LOGIN", "Auth");
        log.info("User '{}' logged in as role='{}'", username,
                user.getRole() != null ? user.getRole().getRoleName() : "?");

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().getRoleName() : null)
                .build();
    }

    @Override
    @Transactional
    public void logout() throws CTMSException {
        if (!currentUserContext.isAuthenticated()) {
            throw new AuthenticationException("No authenticated session to log out");
        }
        Integer userId = currentUserContext.currentUserId();
        closeActiveSessions(userId);
        auditService.record(userId, "LOGOUT", "Auth");
        log.info("User id={} logged out", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse me() throws CTMSException {
        if (!currentUserContext.isAuthenticated()) {
            throw new AuthenticationException("Not authenticated");
        }
        User user = userRepository.findById(currentUserContext.currentUserId())
                .orElseThrow(() -> new AuthenticationException("Session user no longer exists"));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public com.ctms.dto.response.PatientResponse registerParticipant(com.ctms.dto.request.RegisterRequest req, MultipartFile medicalDocument) throws CTMSException {
        log.info("Registering new participant: {}", req.getEmail());

        if (userRepository.existsByUsername(req.getUsername())) {
            throw new com.ctms.exception.ValidationException("Username already exists");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new com.ctms.exception.ValidationException("Email already registered: " + req.getEmail());
        }

        if (req.getDob() != null) {
            int age = java.time.Period.between(req.getDob(), java.time.LocalDate.now()).getYears();
            if (age < 20) {
                throw new com.ctms.exception.ValidationException("Participant must be at least 20 years old.");
            }
            if (age > 40) {
                throw new com.ctms.exception.ValidationException("Participant age cannot exceed 40 years.");
            }
        }

        Role role = roleRepository.findByRoleName("Participant")
                .orElseThrow(() -> new com.ctms.exception.ResourceNotFoundException("Role Participant not found"));

        User user = new User();
        user.setRole(role);
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setPassword(PasswordUtil.hash(req.getPassword()));
        user.setStatus(UserStatus.ACTIVE);
        User savedUser = userRepository.save(user);

        Patient patient = new Patient();
        patient.setUser(savedUser);
        patient.setFirstName(req.getFirstName());
        patient.setLastName(req.getLastName());
        patient.setDob(req.getDob());
        patient.setGender(com.ctms.validation.EnumValidator.validate(req.getGender(), "gender", com.ctms.enums.Gender::fromDb));
        patient.setPhone(req.getPhone());
        patient.setEmail(req.getEmail());
        patient.setAddress(req.getAddress());
        
        // Store medical document
        if (medicalDocument != null && !medicalDocument.isEmpty()) {
            String path = fileStorageService.store(medicalDocument, com.ctms.service.FileStorageService.Context.MEDICAL);
            patient.setMedicalDocumentName(medicalDocument.getOriginalFilename());
            patient.setMedicalDocumentPath(path);
            patient.setMedicalDocumentSize(medicalDocument.getSize());
            patient.setMedicalDocumentUploadedDate(LocalDateTime.now());
        } else {
            throw new com.ctms.exception.ValidationException("Medical History Document is mandatory.");
        }

        patient.setStatus("Pending");

        String patientCode;
        long seq = patientRepository.nextPatientCodeSeq();
        while (true) {
            patientCode = String.format("PAT-%04d", seq);
            if (!patientRepository.existsByPatientCode(patientCode)) {
                break;
            }
            seq = patientRepository.nextPatientCodeSeq();
        }
        patient.setPatientCode(patientCode);

        Patient savedPatient = patientRepository.save(patient);
        
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                auditService.record(savedUser.getUserId(), "REGISTER_PARTICIPANT", "Auth");
            }
        });
        
        log.info("Participant registered successfully id={}", savedPatient.getPatientId());

        return patientMapper.toResponse(savedPatient);
    }

    /** Marks all active sessions for the user as closed (logout_time = now). */
    private void closeActiveSessions(Integer userId) {
        List<UserSession> active = userSessionRepository.findByUser_UserIdAndActiveTrue(userId);
        for (UserSession s : active) {
            s.setActive(false);
            s.setLogoutTime(LocalDateTime.now());
        }
        if (!active.isEmpty()) {
            userSessionRepository.saveAll(active);
        }
    }
}
