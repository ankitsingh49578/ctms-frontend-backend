package com.ctms.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.CreateRoleRequest;
import com.ctms.dto.request.UpdateRoleRequest;
import com.ctms.dto.response.RoleResponse;
import com.ctms.entity.Permission;
import com.ctms.entity.Role;
import com.ctms.enums.UserStatus;
import com.ctms.exception.BusinessException;
import com.ctms.exception.CTMSException;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.exception.ValidationException;
import com.ctms.mapper.RoleMapper;
import com.ctms.repository.PermissionRepository;
import com.ctms.repository.RoleRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.AuditService;
import com.ctms.service.RoleService;
import com.ctms.validation.EnumValidator;
import com.ctms.validation.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * {@link RoleService} implementation migrated from the legacy RoleServiceImpl.
 * Role-name uniqueness and status defaulting/validation are preserved; the
 * role_permissions junction is now managed through the {@code permissionIds}
 * field and the {@link Role#getPermissions()} {@code @ManyToMany}.
 */
@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private static final Logger log = LoggerFactory.getLogger(RoleServiceImpl.class);

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final AuditService audit;
    private final CurrentUserContext currentUser;
    private final RoleMapper roleMapper;

    @Override
    @Transactional
    public RoleResponse createRole(CreateRoleRequest req) throws CTMSException {
        log.info("Creating role name='{}'", req.getRoleName());
        ValidationUtil.requireNonBlank(req.getRoleName(), "roleName");
        UserStatus status = (req.getStatus() == null || req.getStatus().isBlank())
                ? UserStatus.ACTIVE
                : EnumValidator.validate(req.getStatus(), "status", UserStatus::fromDb);
        if (roleRepository.existsByRoleName(req.getRoleName())) {
            throw new ValidationException("Role already exists: " + req.getRoleName());
        }

        Role role = new Role();
        role.setRoleName(req.getRoleName());
        role.setDescription(req.getDescription());
        role.setStatus(status);
        role.setPermissions(resolvePermissions(req.getPermissionIds()));

        Role saved = roleRepository.save(role);
        audit.record(currentUser.currentUserId(), "CREATE_ROLE", "Role");
        log.info("Role created id={}", saved.getRoleId());
        return roleMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public RoleResponse updateRole(Integer roleId, UpdateRoleRequest req) throws CTMSException {
        log.info("Updating role id={}", roleId);
        Role role = loadRole(roleId);

        if (req.getRoleName() != null && !req.getRoleName().isBlank()
                && !req.getRoleName().equals(role.getRoleName())) {
            if (roleRepository.existsByRoleName(req.getRoleName())) {
                throw new ValidationException("Role already exists: " + req.getRoleName());
            }
            role.setRoleName(req.getRoleName());
        }
        if (req.getDescription() != null) role.setDescription(req.getDescription());
        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            role.setStatus(EnumValidator.validate(req.getStatus(), "status", UserStatus::fromDb));
        }
        if (req.getPermissionIds() != null) {
            role.setPermissions(resolvePermissions(req.getPermissionIds()));
        }

        Role saved = roleRepository.save(role);
        audit.record(currentUser.currentUserId(), "UPDATE_ROLE", "Role");
        log.info("Role updated id={}", roleId);
        return roleMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteRole(Integer roleId) throws CTMSException {
        log.info("Deleting role id={}", roleId);
        Role role = loadRole(roleId);
        try {
            roleRepository.delete(role);
            roleRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException(
                    "Cannot delete role id=" + roleId + ": it is assigned to one or more users");
        }
        audit.record(currentUser.currentUserId(), "DELETE_ROLE", "Role");
        log.info("Role deleted id={}", roleId);
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRole(Integer roleId) throws CTMSException {
        return roleMapper.toResponse(loadRole(roleId));
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleByName(String roleName) throws CTMSException {
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: name=" + roleName));
        return roleMapper.toResponse(role);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoleResponse> listRoles(Pageable pageable) {
        return roleRepository.findAll(pageable).map(roleMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoleResponse> searchRoles(String keyword, Pageable pageable) {
        return roleRepository.search(keyword == null ? "" : keyword, pageable)
                .map(roleMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean roleExists(String roleName) {
        return roleRepository.existsByRoleName(roleName);
    }

    @Override
    @Transactional(readOnly = true)
    public long countRoles() {
        return roleRepository.count();
    }

    /* ------------------------------------------------------------------ */

    private Set<Permission> resolvePermissions(Set<Integer> ids) throws CTMSException {
        if (ids == null || ids.isEmpty()) return new HashSet<>();
        List<Permission> found = permissionRepository.findAllById(ids);
        if (found.size() != ids.size()) {
            throw new ResourceNotFoundException("One or more permissions were not found: " + ids);
        }
        return new HashSet<>(found);
    }

    private Role loadRole(Integer roleId) throws ResourceNotFoundException {
        return roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: id=" + roleId));
    }
}
