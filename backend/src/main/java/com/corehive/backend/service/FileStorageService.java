package com.corehive.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    // File upload directory - can be configured in application.properties
    @Value("${file.upload.dir:backend/uploads/business-registrations}")
    private String uploadDir;

    /**
     * Save business registration document
     * @param file Uploaded file
     * @param organizationUuid Organization UUID for folder organization
     * @return Saved file path (relative)
     */
    public String saveBusinessRegistrationDocument(MultipartFile file, String organizationUuid) throws IOException {

        // Validate file
        validateFile(file);

        // Create upload directory if not exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("Created upload directory: {}", uploadPath);
        }

        // Generate unique filename: orgUuid_timestamp_originalName
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String newFilename = organizationUuid + "_" + System.currentTimeMillis() + fileExtension;

        // Save file
        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        log.info("Business registration document saved: {}", filePath);

        // Return relative path (for database storage)
        return uploadDir + "/" + newFilename;
    }

    /**
     * Validate uploaded file
     */
    private void validateFile(MultipartFile file) {
        // Check if file is empty
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        // Check file size (2MB max)
        long maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds 2MB limit");
        }

        // Check file type
        String contentType = file.getContentType();
        if (contentType == null ||
                !(contentType.equals("application/pdf") ||
                        contentType.equals("image/jpeg") ||
                        contentType.equals("image/jpg") ||
                        contentType.equals("image/png"))) {
            throw new IllegalArgumentException("Only PDF, JPG, and PNG files are allowed");
        }
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    /**
     * Delete file (for cleanup operations)
     */
    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
            log.info("File deleted: {}", filePath);
        } catch (IOException e) {
            log.error("Failed to delete file: {}", filePath, e);
        }
    }
}