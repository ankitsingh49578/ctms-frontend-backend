package com.ctms.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import com.ctms.dto.ApiResponse;
import com.ctms.dto.request.CreateRoleRequest;
import com.ctms.dto.request.UpdateRoleRequest;
import com.ctms.dto.response.RoleResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

/** Role and permission administration endpoints. */
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Tag(name = "Roles", description = "Role CRUD and permission grants")
public class RoleController {

    private final RoleService roleService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    @Operation(summary = "List all roles")
    public ResponseEntity<ApiResponse<Page<RoleResponse>>> list(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(roleService.listRoles(pageable)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/search")
    @Operation(summary = "Search roles by name/description")
    public ResponseEntity<ApiResponse<Page<RoleResponse>>> search(@RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(roleService.searchRoles(keyword, pageable)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/count")
    @Operation(summary = "Count roles")
    public ResponseEntity<ApiResponse<Long>> count() {
        return ResponseEntity.ok(ApiResponse.ok(roleService.countRoles()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/by-name")
    @Operation(summary = "Get a role by name")
    public ResponseEntity<ApiResponse<RoleResponse>> byName(@RequestParam String name) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(roleService.getRoleByName(name)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/exists")
    @Operation(summary = "Check whether a role name exists")
    public ResponseEntity<ApiResponse<Boolean>> exists(@RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.ok(roleService.roleExists(name)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    @Operation(summary = "Get a role by id")
    public ResponseEntity<ApiResponse<RoleResponse>> get(@PathVariable Integer id) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(roleService.getRole(id)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @Operation(summary = "Create a role")
    public ResponseEntity<ApiResponse<RoleResponse>> create(@Valid @RequestBody CreateRoleRequest request)
            throws CTMSException {
        RoleResponse created = roleService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Role created", created));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    @Operation(summary = "Update a role")
    public ResponseEntity<ApiResponse<RoleResponse>> update(@PathVariable Integer id,
                                                            @Valid @RequestBody UpdateRoleRequest request)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok("Role updated", roleService.updateRole(id, request)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a role")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) throws CTMSException {
        roleService.deleteRole(id);
        return ResponseEntity.ok(ApiResponse.ok("Role deleted", null));
    }
}
