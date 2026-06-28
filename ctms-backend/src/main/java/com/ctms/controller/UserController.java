package com.ctms.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import com.ctms.dto.ApiResponse;
import com.ctms.dto.request.ChangePasswordRequest;
import com.ctms.dto.request.ChangeRoleRequest;
import com.ctms.dto.request.CreateUserRequest;
import com.ctms.dto.request.UpdateUserRequest;
import com.ctms.dto.response.UserResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

/** User account administration endpoints. */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User account and role administration")
public class UserController {

    private final UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    @Operation(summary = "List all users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> list(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(userService.listUsers(pageable)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/search")
    @Operation(summary = "Search users by username/email")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> search(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(userService.searchUsers(keyword, pageable)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/count")
    @Operation(summary = "Count users")
    public ResponseEntity<ApiResponse<Long>> count() {
        return ResponseEntity.ok(ApiResponse.ok(userService.countUsers()));
    }

    @PreAuthorize("hasRole('ADMIN') or @accessGuard.isSelf(#id)")
    @GetMapping("/{id}")
    @Operation(summary = "Get a user by id")
    public ResponseEntity<ApiResponse<UserResponse>> get(@PathVariable Integer id) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUser(id)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @Operation(summary = "Create a user")
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody CreateUserRequest request)
            throws CTMSException {
        UserResponse created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("User created", created));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    @Operation(summary = "Update a user")
    public ResponseEntity<ApiResponse<UserResponse>> update(@PathVariable Integer id,
                                                            @Valid @RequestBody UpdateUserRequest request)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok("User updated", userService.updateUser(id, request)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) throws CTMSException {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted", null));
    }

    @PreAuthorize("hasRole('ADMIN') or @accessGuard.isSelf(#id)")
    @PostMapping("/{id}/change-password")
    @Operation(summary = "Change a user's password",
            description = "Self-service requires currentPassword; Admin reset of another account does not. All active sessions of the target user are revoked.")
    public ResponseEntity<ApiResponse<Void>> changePassword(@PathVariable Integer id,
                                                            @Valid @RequestBody ChangePasswordRequest request)
            throws CTMSException {
        userService.changePassword(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed; existing sessions revoked", null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/change-role")
    @Operation(summary = "Change a user's role")
    public ResponseEntity<ApiResponse<UserResponse>> changeRole(@PathVariable Integer id,
                                                                @Valid @RequestBody ChangeRoleRequest request)
            throws CTMSException {
        userService.changeRole(id, request.getRoleId());
        return ResponseEntity.ok(ApiResponse.ok("Role changed", userService.getUser(id)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/enable")
    @Operation(summary = "Enable (activate) a user")
    public ResponseEntity<ApiResponse<UserResponse>> enable(@PathVariable Integer id) throws CTMSException {
        userService.enableUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User enabled", userService.getUser(id)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/disable")
    @Operation(summary = "Disable (deactivate) a user")
    public ResponseEntity<ApiResponse<UserResponse>> disable(@PathVariable Integer id) throws CTMSException {
        userService.disableUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User disabled", userService.getUser(id)));
    }
}
