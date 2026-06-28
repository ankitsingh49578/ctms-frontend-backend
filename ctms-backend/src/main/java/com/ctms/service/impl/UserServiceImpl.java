package com.ctms.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.ChangePasswordRequest;
import com.ctms.dto.request.CreateUserRequest;
import com.ctms.dto.request.UpdateUserRequest;
import com.ctms.dto.response.UserResponse;
import com.ctms.entity.Role;
import com.ctms.entity.User;
import com.ctms.enums.UserStatus;
import com.ctms.exception.BusinessException;
import com.ctms.exception.CTMSException;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.exception.UnauthorizedAccessException;
import com.ctms.exception.ValidationException;
import com.ctms.mapper.UserMapper;
import com.ctms.repository.RoleRepository;
import com.ctms.entity.UserSession;
import com.ctms.repository.UserRepository;
import com.ctms.repository.UserSessionRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.AuditService;
import com.ctms.service.UserService;
import com.ctms.util.PasswordUtil;
import com.ctms.validation.EnumValidator;
import com.ctms.validation.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * {@link UserService} implementation migrated from the legacy UserServiceImpl.
 * Validations (unique username/email, password strength), password hashing and
 * audit recording are preserved; the int role FK is now a real {@link Role}
 * association resolved via the repository.
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditService audit;
    private final CurrentUserContext currentUser;
    private final UserSessionRepository userSessionRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest req) throws CTMSException {
        log.info("Creating user username='{}'", req.getUsername());
        ValidationUtil.requireNonBlank(req.getUsername(), "username");
        ValidationUtil.validateEmail(req.getEmail());
        ValidationUtil.validatePasswordStrength(req.getPassword());
        ValidationUtil.requirePositive(req.getRoleId() == null ? 0 : req.getRoleId(), "roleId");
        ValidationUtil.validatePhone(req.getPhone());

        if (userRepository.existsByUsername(req.getUsername())) {
            throw new ValidationException("Username already exists: " + req.getUsername());
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ValidationException("Email already exists: " + req.getEmail());
        }
        Role role = roleRepository.findById(req.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: id=" + req.getRoleId()));

        User user = new User();
        user.setRole(role);
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setPassword(PasswordUtil.hash(req.getPassword()));
        user.setStatus(resolveStatus(req.getStatus(), UserStatus.ACTIVE));

        User saved = userRepository.save(user);
        audit.record(currentUser.currentUserId(), "CREATE_USER", "User");
        log.info("User created id={}", saved.getUserId());
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Integer userId, UpdateUserRequest req) throws CTMSException {
        log.info("Updating user id={}", userId);
        User user = loadUser(userId);

        if (req.getUsername() != null && !req.getUsername().isBlank()
                && !req.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(req.getUsername())) {
                throw new ValidationException("Username already exists: " + req.getUsername());
            }
            user.setUsername(req.getUsername());
        }
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            ValidationUtil.validateEmail(req.getEmail());
            if (!req.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(req.getEmail())) {
                throw new ValidationException("Email already exists: " + req.getEmail());
            }
            user.setEmail(req.getEmail());
        }
        if (req.getPhone() != null) {
            ValidationUtil.validatePhone(req.getPhone());
            user.setPhone(req.getPhone());
        }
        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            user.setStatus(EnumValidator.validate(req.getStatus(), "status", UserStatus::fromDb));
        }

        User saved = userRepository.save(user);
        audit.record(currentUser.currentUserId(), "UPDATE_USER", "User");
        log.info("User updated id={}", userId);
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void changeRole(Integer userId, Integer roleId) throws CTMSException {
        forbidSelfTarget(userId, "change your own role");
        log.info("Changing role of user id={} -> roleId={}", userId, roleId);
        User user = loadUser(userId);
        ValidationUtil.requirePositive(roleId == null ? 0 : roleId, "roleId");
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: id=" + roleId));
        user.setRole(role);
        userRepository.save(user);
        audit.record(currentUser.currentUserId(), "CHANGE_ROLE", "User");
        log.info("Role changed user id={}", userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void changePassword(Integer userId, ChangePasswordRequest req) throws CTMSException {
        log.info("Changing password for user id={}", userId);
        User user = loadUser(userId);

        boolean self = userId.equals(currentUser.currentUserId());
        if (self) {
            // A user changing their own password must prove knowledge of the old one.
            if (req.getCurrentPassword() == null
                    || !PasswordUtil.verify(req.getCurrentPassword(), user.getPassword())) {
                throw new UnauthorizedAccessException("Current password is incorrect");
            }
        }
        // Admin reset path (non-self) is already restricted to ROLE_ADMIN by
        // @PreAuthorize on the controller, so no current-password proof is required.

        ValidationUtil.validatePasswordStrength(req.getNewPassword());
        user.setPassword(PasswordUtil.hash(req.getNewPassword()));
        userRepository.save(user);

        // Invalidate every active session for this user so stolen/old tokens die now.
        List<UserSession> active = userSessionRepository.findByUser_UserIdAndActiveTrue(userId);
        for (UserSession s : active) {
            s.setActive(false);
        }
        userSessionRepository.saveAll(active);

        audit.record(currentUser.currentUserId(), "CHANGE_PASSWORD", "User");
        log.info("Password changed and {} session(s) revoked for user id={}", active.size(), userId);
    }

    @Override
    @Transactional
    public void enableUser(Integer userId) throws CTMSException {
        setStatus(userId, UserStatus.ACTIVE, "ENABLE_USER");
    }

    @Override
    @Transactional
    public void disableUser(Integer userId) throws CTMSException {
        forbidSelfTarget(userId, "disable your own account");
        setStatus(userId, UserStatus.INACTIVE, "DISABLE_USER");
    }

    @Override
    @Transactional
    public void deleteUser(Integer userId) throws CTMSException {
        forbidSelfTarget(userId, "delete your own account");
        log.info("Deleting user id={}", userId);
        User user = loadUser(userId);
        try {
            userRepository.delete(user);
            userRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException(
                    "Cannot delete user id=" + userId + ": it is referenced by other records");
        }
        audit.record(currentUser.currentUserId(), "DELETE_USER", "User");
        log.info("User deleted id={}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUser(Integer userId) throws CTMSException {
        return userMapper.toResponse(loadUser(userId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> listUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String keyword, Pageable pageable) {
        return userRepository.search(keyword == null ? "" : keyword, pageable)
                .map(userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUsers() {
        return userRepository.count();
    }

    /* ------------------------------------------------------------------ */

    /**
     * Prevents an administrator from locking themselves out (or silently escalating)
     * by targeting their own account with destructive role/status operations.
     */
    private void forbidSelfTarget(Integer targetUserId, String action) throws UnauthorizedAccessException {
        Integer me = currentUser.currentUserId();
        if (me != null && me.equals(targetUserId)) {
            throw new UnauthorizedAccessException("You cannot " + action);
        }
    }

    private void setStatus(Integer userId, UserStatus status, String action) throws CTMSException {
        User user = loadUser(userId);
        user.setStatus(status);
        userRepository.save(user);
        audit.record(currentUser.currentUserId(), action, "User");
        log.info("User status set id={} -> {}", userId, status.dbValue());
    }

    private User loadUser(Integer userId) throws ResourceNotFoundException {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: id=" + userId));
    }

    private UserStatus resolveStatus(String raw, UserStatus dflt) throws ValidationException {
        if (raw == null || raw.isBlank()) return dflt;
        return EnumValidator.validate(raw, "status", UserStatus::fromDb);
    }
}
