package com.ctms.service.impl;

import com.ctms.exception.CTMSException;
import com.ctms.exception.ValidationException;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageServiceImpl.class);
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final String UPLOAD_DIR = "uploads/consent-documents";

    private final Path uploadPath;

    public FileStorageServiceImpl() {
        this.uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
            log.info("Consent document upload directory: {}", this.uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + UPLOAD_DIR, e);
        }
    }

    @Override
    public String store(MultipartFile file) throws CTMSException {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Consent document is mandatory.");
        }

        // Validate file type
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new ValidationException("Only PDF files are allowed.");
        }

        String contentType = file.getContentType();
        if (contentType != null && !contentType.equalsIgnoreCase("application/pdf")) {
            throw new ValidationException("Only PDF files are allowed.");
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ValidationException("Maximum file size is 10 MB.");
        }

        // Generate unique filename
        String storedFilename = UUID.randomUUID() + ".pdf";
        Path targetPath = this.uploadPath.resolve(storedFilename);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored consent document: {} -> {}", originalFilename, storedFilename);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store consent document", e);
        }

        return UPLOAD_DIR + "/" + storedFilename;
    }

    @Override
    public Resource load(String storedPath) throws CTMSException {
        try {
            Path filePath = Paths.get(storedPath).toAbsolutePath().normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new ResourceNotFoundException("Consent document not found: " + storedPath);
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Consent document not found: " + storedPath);
        }
    }
}
