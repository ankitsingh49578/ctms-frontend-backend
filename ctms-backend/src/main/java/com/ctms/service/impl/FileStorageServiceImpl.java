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

    public FileStorageServiceImpl() {
        for (FileStorageService.Context ctx : FileStorageService.Context.values()) {
            try {
                Path uploadPath = Paths.get(ctx.getDirectory()).toAbsolutePath().normalize();
                Files.createDirectories(uploadPath);
                log.info("Initialized upload directory: {} for context: {}", uploadPath, ctx.name());
            } catch (IOException e) {
                throw new RuntimeException("Could not create upload directory for " + ctx.name(), e);
            }
        }
    }

    @Override
    public String store(MultipartFile file, Context context) throws CTMSException {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Document is mandatory.");
        }

        // Validate file type
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new ValidationException("File name is missing.");
        }
        
        String ext = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        String contentType = file.getContentType();
        
        boolean isValidExt = context.getAllowedExtensions().contains(ext);
        boolean isValidType = contentType != null && context.getAllowedExtensions().contains(contentType.toLowerCase());
        
        if (!isValidExt && !isValidType) {
            throw new ValidationException("Invalid file type. Allowed: " + String.join(", ", context.getAllowedExtensions()));
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ValidationException("Maximum file size is 10 MB.");
        }

        // Generate unique filename
        String storedFilename = UUID.randomUUID() + "." + ext;
        Path targetPath = Paths.get(context.getDirectory()).toAbsolutePath().normalize().resolve(storedFilename);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored document: {} -> {}", originalFilename, storedFilename);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store document", e);
        }

        return context.getDirectory() + "/" + storedFilename;
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
