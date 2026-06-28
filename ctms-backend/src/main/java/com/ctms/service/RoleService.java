package com.ctms.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.CreateRoleRequest;
import com.ctms.dto.request.UpdateRoleRequest;
import com.ctms.dto.response.RoleResponse;
import com.ctms.exception.CTMSException;

import java.util.List;

/** Business logic for roles and their permission grants. */
public interface RoleService {

    RoleResponse createRole(CreateRoleRequest request) throws CTMSException;
    RoleResponse updateRole(Integer roleId, UpdateRoleRequest request) throws CTMSException;
    void deleteRole(Integer roleId) throws CTMSException;
    RoleResponse getRole(Integer roleId) throws CTMSException;
    RoleResponse getRoleByName(String roleName) throws CTMSException;
    Page<RoleResponse> listRoles(Pageable pageable);
    Page<RoleResponse> searchRoles(String keyword, Pageable pageable);
    boolean roleExists(String roleName);
    long countRoles();
}
