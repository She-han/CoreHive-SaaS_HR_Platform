package com.corehive.backend.controller;

import com.corehive.backend.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
@Slf4j
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class FileController {

    private final FileStorageService fileStorageService;

    @Value("${file.upload.dir:backend/uploads/business-registrations}")
    private String uploadDir;

    /**
     * Download business registration document
     * Handles both Azure Blob URLs and local files
     */
    @GetMapping("/business-registration/{filename}")
    public ResponseEntity<?> downloadBusinessRegistration(
            @PathVariable String filename,
            @RequestParam(required = false) String blobUrl,
            HttpServletRequest request) {

        try {
            String userEmail = (String) request.getAttribute("userEmail");
            String userRole = (String) request.getAttribute("userRole");
            log.info("File access by: {} (Role: {})", userEmail, userRole);

            // If blobUrl is provided, redirect to Azure SAS URL
            if (blobUrl != null && blobUrl.contains("blob.core.windows.net")) {
                String downloadUrl = fileStorageService.getDocumentDownloadUrl(blobUrl);
                log.info("Redirecting to Azure URL: {}", downloadUrl);
                return ResponseEntity.status(HttpStatus.FOUND)
                        .location(URI.create(downloadUrl))
                        .build();
            }

            // Local file download
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.error("File not found: {}", filename);
                return ResponseEntity.notFound().build();
            }

            String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (Exception e) {
            log.error("Error downloading file: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * New endpoint: Get download URL for document
     * Returns direct Azure SAS URL or local file path
     */
    @GetMapping("/business-registration/download-url")
    public ResponseEntity<?> getDownloadUrl(
            @RequestParam String documentPath,
            HttpServletRequest request) {

        try {
            String userRole = (String) request.getAttribute("userRole");

            // Only allow SYSTEM_ADMIN and ORG_ADMIN to access
            if (userRole == null || (!userRole.equals("SYSTEM_ADMIN") && !userRole.equals("ORG_ADMIN"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied");
            }

            String downloadUrl = fileStorageService.getDocumentDownloadUrl(documentPath);

            return ResponseEntity.ok().body(new DownloadUrlResponse(downloadUrl));

        } catch (Exception e) {
            log.error("Error generating download URL: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Response DTO
    record DownloadUrlResponse(String downloadUrl) {}
}