package com.corehive.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileStorageService {

    private final AzureBlobStorageService azureBlobStorageService;

    @Value("${file.upload.dir:backend/uploads/business-registrations}")
    private String uploadDir;

    @Value("${storage.mode:local}")
    private String storageMode;

    /**
     * Save business registration document
     * Uses Azure Blob Storage in production, local storage in development
     * @return Storage path/URL
     */
    public String saveBusinessRegistrationDocument(MultipartFile file, String organizationUuid) throws IOException {
        validateFile(file);

        // Use Azure in production
        if (azureBlobStorageService.isAzureEnabled()) {
            log.info("📤 Uploading to Azure Blob Storage...");
            return azureBlobStorageService.uploadBusinessDocument(file, organizationUuid);
        }

        // Fallback to local storage
        log.info("📁 Saving to local storage...");
        return saveToLocalStorage(file, organizationUuid);
    }

    /**
     * Get download URL for document
     * For Azure: generates SAS URL
     * For local: returns file path
     */
    public String getDocumentDownloadUrl(String storedPath) {
        if (storedPath == null || storedPath.isEmpty()) {
            return null;
        }

        // If it's an Azure URL, generate SAS token
        if (storedPath.contains("blob.core.windows.net")) {
            return azureBlobStorageService.generateDownloadUrl(storedPath, 24); // 24 hours validity
        }

        // Local path - return as-is (will be served via FileController)
        return storedPath;
    }

    /**
     * Delete document from storage
     */
    public boolean deleteDocument(String storedPath) {
        if (storedPath == null || storedPath.isEmpty()) {
            return false;
        }

        // Azure blob
        if (storedPath.contains("blob.core.windows.net")) {
            return azureBlobStorageService.deleteBlob(storedPath);
        }

        // Local file
        return deleteLocalFile(storedPath);
    }

    private String saveToLocalStorage(MultipartFile file, String organizationUuid) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String newFilename = organizationUuid + "_" + System.currentTimeMillis() + fileExtension;

        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        log.info("✅ File saved locally: {}", filePath);
        return uploadDir + "/" + newFilename;
    }

    private boolean deleteLocalFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
            log.info("✅ Local file deleted: {}", filePath);
            return true;
        } catch (IOException e) {
            log.error("Failed to delete local file: {}", filePath, e);
            return false;
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        long maxSize = 2 * 1024 * 1024; // 2MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds 2MB limit");
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                !(contentType.equals("application/pdf") ||
                        contentType.equals("image/jpeg") ||
                        contentType.equals("image/jpg") ||
                        contentType.equals("image/png"))) {
            throw new IllegalArgumentException("Only PDF, JPG, and PNG files are allowed");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}