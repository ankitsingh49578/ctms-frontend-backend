package com.ctms.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.CreateManagerRequest;
import com.ctms.dto.request.UpdateManagerRequest;
import com.ctms.dto.response.ManagerResponse;
import com.ctms.entity.ClinicalManager;
import com.ctms.entity.User;
import com.ctms.exception.BusinessException;
import com.ctms.exception.CTMSException;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.exception.ValidationException;
import com.ctms.mapper.ManagerMapper;
import com.ctms.repository.ClinicalManagerRepository;
import com.ctms.repository.UserRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.AuditService;
import com.ctms.service.ManagerService;
import com.ctms.validation.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * {@link ManagerService} implementation migrated from the legacy ManagerServiceImpl.
 * Name/phone validation, linked-user existence and the one-profile-per-user rule
 * are preserved; the user_id int FK is now a real 1:1 {@link User} association.
 */
@Service
@RequiredArgsConstructor
public class ManagerServiceImpl implements ManagerService {

    private static final Logger log = LoggerFactory.getLogger(ManagerServiceImpl.class);

    private final ClinicalManagerRepository managerRepository;
    private final UserRepository userRepository;
    private final AuditService audit;
    private final CurrentUserContext currentUser;
    private final ManagerMapper managerMapper;

    @Override
    @Transactional
    public ManagerResponse createManager(CreateManagerRequest req) throws CTMSException {
        log.info("Creating manager profile name='{}'", req.getManagerName());
        ValidationUtil.requireNonBlank(req.getManagerName(), "managerName");
        ValidationUtil.requirePositive(req.getUserId() == null ? 0 : req.getUserId(), "userId");
        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            ValidationUtil.validatePhone(req.getPhone());
        }
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Linked user not found: id=" + req.getUserId()));
        if (managerRepository.existsByUser_UserId(req.getUserId())) {
            throw new ValidationException("A manager profile already exists for this user");
        }

        ClinicalManager manager = new ClinicalManager();
        manager.setUser(user);
        manager.setManagerName(req.getManagerName());
        manager.setDepartment(req.getDepartment());
        manager.setPhone(req.getPhone());

        ClinicalManager saved = managerRepository.save(manager);
        audit.record(currentUser.currentUserId(), "CREATE_MANAGER", "Manager");
        log.info("Manager profile created id={}", saved.getManagerId());
        return managerMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ManagerResponse updateManager(Integer managerId, UpdateManagerRequest req) throws CTMSException {
        log.info("Updating manager id={}", managerId);
        ClinicalManager manager = loadManager(managerId);
        if (req.getManagerName() != null && !req.getManagerName().isBlank()) {
            manager.setManagerName(req.getManagerName());
        }
        if (req.getDepartment() != null) manager.setDepartment(req.getDepartment());
        if (req.getPhone() != null) {
            if (!req.getPhone().isBlank()) ValidationUtil.validatePhone(req.getPhone());
            manager.setPhone(req.getPhone());
        }

        ClinicalManager saved = managerRepository.save(manager);
        audit.record(currentUser.currentUserId(), "UPDATE_MANAGER", "Manager");
        log.info("Manager updated id={}", managerId);
        return managerMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteManager(Integer managerId) throws CTMSException {
        log.info("Deleting manager id={}", managerId);
        ClinicalManager manager = loadManager(managerId);
        try {
            managerRepository.delete(manager);
            managerRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException(
                    "Cannot delete manager id=" + managerId + ": it is referenced by other records");
        }
        audit.record(currentUser.currentUserId(), "DELETE_MANAGER", "Manager");
        log.info("Manager deleted id={}", managerId);
    }

    @Override
    @Transactional(readOnly = true)
    public ManagerResponse getManager(Integer managerId) throws CTMSException {
        return managerMapper.toResponse(loadManager(managerId));
    }

    @Override
    @Transactional(readOnly = true)
    public ManagerResponse getManagerByUser(Integer userId) throws CTMSException {
        ClinicalManager manager = managerRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No manager profile for user id=" + userId));
        return managerMapper.toResponse(manager);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ManagerResponse> listManagers(Pageable pageable) {
        return managerRepository.findAll(pageable).map(managerMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ManagerResponse> searchManagers(String keyword, Pageable pageable) {
        return managerRepository.search(keyword == null ? "" : keyword, pageable)
                .map(managerMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean managerExists(Integer managerId) {
        return managerRepository.existsById(managerId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countManagers() {
        return managerRepository.count();
    }

    /* ------------------------------------------------------------------ */

    private ClinicalManager loadManager(Integer managerId) throws ResourceNotFoundException {
        return managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found: id=" + managerId));
    }
}
