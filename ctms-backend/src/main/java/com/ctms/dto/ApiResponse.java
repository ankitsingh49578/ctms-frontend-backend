package com.ctms.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Standardized response envelope returned by every REST endpoint and by the
 * {@link com.ctms.exception.GlobalExceptionHandler}. Null fields are omitted
 * from the JSON so success payloads stay clean.
 *
 * @param <T> the type of the {@code data} payload
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private List<String> errors;
    private String path;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /* ------------------------------------------------------------------ */
    /* Convenience factories                                              */
    /* ------------------------------------------------------------------ */

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder().success(true).message("Success").data(data).build();
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return ApiResponse.<T>builder().success(true).message(message).data(data).build();
    }

    public static <T> ApiResponse<T> created(String message, T data) {
        return ApiResponse.<T>builder().success(true).message(message).data(data).build();
    }

    public static <T> ApiResponse<T> error(String message, List<String> errors, String path) {
        return ApiResponse.<T>builder()
                .success(false).message(message).errors(errors).path(path).build();
    }
}
