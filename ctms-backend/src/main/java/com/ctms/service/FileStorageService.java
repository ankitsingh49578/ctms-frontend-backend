package com.ctms.service;

import com.ctms.exception.CTMSException;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

/**
 * Handles physical file I/O for consent document uploads.
 * Files are stored under {@code uploads/consent-documents/} with UUID-based names.
 */
public interface FileStorageService {

    /**
     * Validates and stores a PDF file.
     *
     * @param file the uploaded multipart file
     * @return the relative storage path (e.g. "uploads/consent-documents/abc-123.pdf")
     * @throws CTMSException if validation fails (wrong type, too large)
     */
    String store(MultipartFile file) throws CTMSException;

    /**
     * Loads a previously stored file as a Spring {@link Resource}.
     *
     * @param storedPath the path returned by {@link #store(MultipartFile)}
     * @return readable resource
     * @throws CTMSException if file not found
     */
    Resource load(String storedPath) throws CTMSException;
}
