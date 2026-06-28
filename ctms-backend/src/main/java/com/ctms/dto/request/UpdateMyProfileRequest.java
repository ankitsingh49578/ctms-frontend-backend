package com.ctms.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

/**
 * Payload for {@code PUT /api/portal/me}: the contact details a participant is
 * allowed to maintain about themselves.
 *
 * <p>This DTO deliberately omits {@code firstName}, {@code lastName}, {@code dob},
 * {@code gender} and {@code status}. Those are clinical-identity and verification
 * fields that must remain under staff control — exposing them here would let a
 * participant rename themselves or self-promote from {@code Pending} to
 * {@code Verified}, bypassing the screening gate enforced in
 * {@code ParticipantService.enroll(...)}. Restricting the self-service surface at
 * the contract level (rather than only in code) keeps that guarantee visible in
 * the OpenAPI document and in code review.</p>
 */
@Data
public class UpdateMyProfileRequest {

    @jakarta.validation.constraints.Pattern(
            regexp = "^$|^[+]?[0-9]{7,15}$",
            message = "phone must be 7-15 digits, optional leading +")
    private String phone;

    @Email(message = "email must be a valid address")
    private String email;

    private String address;

    private String bloodGroup;
}
