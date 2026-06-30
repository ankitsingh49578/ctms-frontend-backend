package com.ctms.service;

import com.ctms.exception.CTMSException;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

/**
 * Handles physical file I/O for consent document uploads.
 * Files are stored under {@code uploads/consent-documents/} with UUID-based names.
 */
import java.util.List;

public interface FileStorageService {

    enum Context {
        CONSENT("uploads/consent-documents", List.of("pdf", "application/pdf")),
        MEDICAL("uploads/participant-medical-history", List.of("pdf", "jpg", "jpeg", "png", "application/pdf", "image/jpeg", "image/png"));

        private final String directory;
        private final List<String> allowedExtensions;

        Context(String directory, List<String> allowedExtensions) {
            this.directory = directory;
            this.allowedExtensions = allowedExtensions;
        }

        public String getDirectory() {
            return directory;
        }

        public List<String> getAllowedExtensions() {
            return allowedExtensions;
        }
    }

    /**
     * Validates and stores a file.
     *
     * @param file the uploaded multipart file
     * @param context the storage context indicating directory and allowed types
     * @return the relative storage path (e.g. "uploads/consent-documents/abc-123.pdf")
     * @throws CTMSException if validation fails (wrong type, too large)
     */
    String store(MultipartFile file, Context context) throws CTMSException;

    /**
     * Loads a previously stored file as a Spring {@link Resource}.
     *
     * @param storedPath the path returned by {@link #store(MultipartFile, Context)}
     * @return readable resource
     * @throws CTMSException if file not found
     */
    Resource load(String storedPath) throws CTMSException;
}
