package com.ctms.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import com.ctms.dto.ApiResponse;
import com.ctms.dto.request.CreateManagerRequest;
import com.ctms.dto.request.UpdateManagerRequest;
import com.ctms.dto.response.ManagerResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.ManagerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

/** Clinical-manager profile management endpoints. */
@RestController
@RequestMapping("/api/managers")
@RequiredArgsConstructor
@Tag(name = "Managers", description = "Clinical-manager profile CRUD and lookup")
public class ManagerController {

    private final ManagerService managerService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    @Operation(summary = "List all managers")
    public ResponseEntity<ApiResponse<Page<ManagerResponse>>> list(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(managerService.listManagers(pageable)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/search")
    @Operation(summary = "Search managers by name/department")
    public ResponseEntity<ApiResponse<Page<ManagerResponse>>> search(@RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(managerService.searchManagers(keyword, pageable)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/count")
    @Operation(summary = "Count managers")
    public ResponseEntity<ApiResponse<Long>> count() {
        return ResponseEntity.ok(ApiResponse.ok(managerService.countManagers()));
    }

    @PreAuthorize("hasRole('ADMIN') or @accessGuard.isSelf(#userId)")
    @GetMapping("/by-user/{userId}")
    @Operation(summary = "Get the manager profile linked to a user")
    public ResponseEntity<ApiResponse<ManagerResponse>> byUser(@PathVariable Integer userId) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(managerService.getManagerByUser(userId)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    @Operation(summary = "Get a manager by id")
    public ResponseEntity<ApiResponse<ManagerResponse>> get(@PathVariable Integer id) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(managerService.getManager(id)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @Operation(summary = "Create a manager profile")
    public ResponseEntity<ApiResponse<ManagerResponse>> create(@Valid @RequestBody CreateManagerRequest request)
            throws CTMSException {
        ManagerResponse created = managerService.createManager(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Manager created", created));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    @Operation(summary = "Update a manager profile")
    public ResponseEntity<ApiResponse<ManagerResponse>> update(@PathVariable Integer id,
                                                               @Valid @RequestBody UpdateManagerRequest request)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok("Manager updated", managerService.updateManager(id, request)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a manager profile")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) throws CTMSException {
        managerService.deleteManager(id);
        return ResponseEntity.ok(ApiResponse.ok("Manager deleted", null));
    }
}
