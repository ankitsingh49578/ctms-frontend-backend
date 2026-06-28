package com.ctms.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import com.ctms.dto.ApiResponse;
import com.ctms.dto.request.CreateNotificationRequest;
import com.ctms.dto.response.NotificationResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

/** In-app notification endpoints. */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Per-user in-app notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @PreAuthorize("hasAnyRole('TRIAL_MANAGER','CLINICAL_MANAGER')")
    @PostMapping
    @Operation(summary = "Create a notification for a user")
    public ResponseEntity<ApiResponse<NotificationResponse>> create(
            @Valid @RequestBody CreateNotificationRequest request) throws CTMSException {
        NotificationResponse created =
                notificationService.notify(request.getUserId(), request.getTitle(), request.getMessage());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created("Notification created", created));
    }

    @PreAuthorize("hasRole('ADMIN') or @accessGuard.isSelf(#userId)")
    @GetMapping("/user/{userId}")
    @Operation(summary = "List a user's notifications (newest first)")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> forUser(@PathVariable Integer userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.forUser(userId, pageable)));
    }

    @PreAuthorize("hasRole('ADMIN') or @accessGuard.isSelf(#userId)")
    @GetMapping("/user/{userId}/unread")
    @Operation(summary = "List a user's unread notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> unreadForUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.unreadForUser(userId)));
    }

    @PreAuthorize("hasRole('ADMIN') or @accessGuard.isOwnNotification(#id)")
    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable Integer id) throws CTMSException {
        notificationService.markRead(id);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked read", null));
    }
}
