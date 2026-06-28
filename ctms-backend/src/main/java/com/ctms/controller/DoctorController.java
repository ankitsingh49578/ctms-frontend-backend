package com.ctms.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import com.ctms.dto.ApiResponse;
import com.ctms.dto.request.CreateDoctorRequest;
import com.ctms.dto.request.UpdateDoctorRequest;
import com.ctms.dto.response.DoctorResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

/** Doctor profile management endpoints. */
@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "Doctor profile CRUD and lookup")
public class DoctorController {

    private final DoctorService doctorService;
    private final com.ctms.service.UserService userService;
    private final com.ctms.security.CurrentUserContext currentUser;

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @GetMapping
    @Operation(summary = "List all doctors")
    public ResponseEntity<ApiResponse<Page<DoctorResponse>>> list(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.listDoctors(pageable)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @GetMapping("/search")
    @Operation(summary = "Search doctors by name/specialization/license")
    public ResponseEntity<ApiResponse<Page<DoctorResponse>>> search(@RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.searchDoctors(keyword, pageable)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @GetMapping("/count")
    @Operation(summary = "Count doctors")
    public ResponseEntity<ApiResponse<Long>> count() {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.countDoctors()));
    }

    @PreAuthorize("hasRole('ADMIN') or @accessGuard.isSelf(#userId)")
    @GetMapping("/by-user/{userId}")
    @Operation(summary = "Get the doctor profile linked to a user")
    public ResponseEntity<ApiResponse<DoctorResponse>> byUser(@PathVariable Integer userId) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getDoctorByUser(userId)));
    }

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER') or @accessGuard.isDoctorProfile(#id)")
    @GetMapping("/{id}")
    @Operation(summary = "Get a doctor by id")
    public ResponseEntity<ApiResponse<DoctorResponse>> get(@PathVariable Integer id) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getDoctor(id)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @Operation(summary = "Create a doctor profile")
    public ResponseEntity<ApiResponse<DoctorResponse>> create(@Valid @RequestBody CreateDoctorRequest request)
            throws CTMSException {
        DoctorResponse created = doctorService.createDoctor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Doctor created", created));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    @Operation(summary = "Update a doctor profile")
    public ResponseEntity<ApiResponse<DoctorResponse>> update(@PathVariable Integer id,
                                                              @Valid @RequestBody UpdateDoctorRequest request)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok("Doctor updated", doctorService.updateDoctor(id, request)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a doctor profile")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) throws CTMSException {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(ApiResponse.ok("Doctor deleted", null));
    }

    // --- Profile Endpoints (Self-Service) ---

    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/profile")
    @Operation(summary = "Get current doctor profile")
    public ResponseEntity<ApiResponse<DoctorResponse>> getProfile() throws CTMSException {
        Integer currentUserId = currentUser.currentUserId();
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getDoctorByUser(currentUserId)));
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/profile")
    @Operation(summary = "Update current doctor profile")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateProfile(
            @Valid @RequestBody com.ctms.dto.request.UpdateDoctorProfileRequest request) throws CTMSException {
        Integer currentUserId = currentUser.currentUserId();
        DoctorResponse doc = doctorService.getDoctorByUser(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", doctorService.updateDoctorProfile(doc.getDoctorId(), request)));
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PostMapping("/change-password")
    @Operation(summary = "Change password for the current doctor")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody com.ctms.dto.request.ChangePasswordRequest request) throws CTMSException {
        Integer currentUserId = currentUser.currentUserId();
        userService.changePassword(currentUserId, request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }
}
