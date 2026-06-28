package com.ctms.service;

import com.ctms.dto.request.CreateRoleRequest;
import com.ctms.dto.response.RoleResponse;
import com.ctms.entity.Role;
import com.ctms.enums.UserStatus;
import com.ctms.exception.BusinessException;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.exception.ValidationException;
import com.ctms.mapper.RoleMapper;
import com.ctms.repository.PermissionRepository;
import com.ctms.repository.RoleRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.impl.RoleServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Pure Mockito unit tests for {@link RoleServiceImpl} — no Spring context and no
 * database, exercising the preserved business rules (status defaulting,
 * name-uniqueness, not-found handling and the FK-restricted delete → 422 path).
 *
 * <p>This mirrors the testability the legacy app valued: services depend only on
 * injected collaborators, so each rule can be verified in isolation.
 */
@ExtendWith(MockitoExtension.class)
class RoleServiceImplTest {

    @Mock private RoleRepository roleRepository;
    @Mock private PermissionRepository permissionRepository;
    @Mock private AuditService audit;
    @Mock private CurrentUserContext currentUser;
    @Mock private RoleMapper roleMapper;

    @InjectMocks private RoleServiceImpl roleService;

    @Test
    @DisplayName("createRole: defaults status to ACTIVE, saves, audits and returns the mapped DTO")
    void createRole_happyPath() throws Exception {
        CreateRoleRequest req = new CreateRoleRequest();
        req.setRoleName("Coordinator");
        req.setDescription("Study coordinator");
        // no status and no permissionIds supplied -> ACTIVE + empty permissions

        when(roleRepository.existsByRoleName("Coordinator")).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenAnswer(inv -> {
            Role r = inv.getArgument(0);
            r.setRoleId(42);
            return r;
        });
        when(currentUser.currentUserId()).thenReturn(7);
        when(roleMapper.toResponse(any(Role.class)))
                .thenReturn(RoleResponse.builder().roleId(42).roleName("Coordinator").status("Active").build());

        RoleResponse result = roleService.createRole(req);

        assertNotNull(result);
        assertEquals(42, result.getRoleId());
        assertEquals("Coordinator", result.getRoleName());

        ArgumentCaptor<Role> savedCaptor = ArgumentCaptor.forClass(Role.class);
        verify(roleRepository).save(savedCaptor.capture());
        Role saved = savedCaptor.getValue();
        assertEquals("Coordinator", saved.getRoleName());
        assertEquals(UserStatus.ACTIVE, saved.getStatus(), "status should default to ACTIVE");
        assertTrue(saved.getPermissions().isEmpty(), "no permissionIds -> empty permission set");

        verify(audit).record(eq(7), eq("CREATE_ROLE"), eq("Role"));
        verifyNoInteractions(permissionRepository);
    }

    @Test
    @DisplayName("createRole: rejects a duplicate role name with ValidationException")
    void createRole_duplicateName() {
        CreateRoleRequest req = new CreateRoleRequest();
        req.setRoleName("Admin");
        when(roleRepository.existsByRoleName("Admin")).thenReturn(true);

        assertThrows(ValidationException.class, () -> roleService.createRole(req));
        verify(roleRepository, never()).save(any());
        verifyNoInteractions(audit);
    }

    @Test
    @DisplayName("getRole: throws ResourceNotFoundException when the id does not exist")
    void getRole_notFound() {
        when(roleRepository.findById(99)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> roleService.getRole(99));
    }

    @Test
    @DisplayName("deleteRole: a DataIntegrityViolation becomes a BusinessException (422)")
    void deleteRole_restrictedByFk() {
        Role role = new Role();
        role.setRoleId(5);
        role.setRoleName("Doctor");
        when(roleRepository.findById(5)).thenReturn(Optional.of(role));
        doThrow(new DataIntegrityViolationException("FK violation"))
                .when(roleRepository).flush();

        assertThrows(BusinessException.class, () -> roleService.deleteRole(5));
        verify(roleRepository).delete(role);
    }
}
