package com.ctms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Body for POST /api/users/{id}/change-password.
 *
 * <p>{@code currentPassword} is verified when a user changes their own password.
 * When an Admin resets another user's password, the current password is not
 * required (it is ignored if supplied).</p>
 */
@Data
public class ChangePasswordRequest {

    /** Required only when changing one's own password. */
    private String currentPassword;

    @NotBlank(message = "newPassword is required")
    private String newPassword;
}
