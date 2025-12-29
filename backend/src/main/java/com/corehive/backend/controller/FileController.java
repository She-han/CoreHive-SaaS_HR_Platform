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
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@Slf4j
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*", exposedHeaders = "*")
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

            log.info("File access request - File: {}, User: {}, Role: {}", filename, userEmail, userRole);

            if (blobUrl != null && blobUrl.contains("blob.core.windows.net")) {
                String downloadUrl = fileStorageService.getDocumentDownloadUrl(blobUrl);
                log.info("Redirecting to Azure URL: {}", downloadUrl);
                return ResponseEntity.status(HttpStatus.FOUND)
                        .location(URI.create(downloadUrl))
                        .build();
            }

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
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get download URL for document (with SAS token for Azure)
     */
    @GetMapping("/business-registration/download-url")
    public ResponseEntity<?> getDownloadUrl(
            @RequestParam String documentPath,
            HttpServletRequest request) {

        try {
            String userEmail = (String) request.getAttribute("userEmail");
            String userRole = (String) request.getAttribute("userRole");

            log.info("Download URL request - User: {}, Role: {}, Path: {}", userEmail, userRole, documentPath);

            if (userRole == null) {
                log.warn("No user role found - authentication may have failed");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Authentication required"));
            }

            if (!userRole.equals("SYSTEM_ADMIN") && !userRole.equals("ORG_ADMIN")) {
                log.warn("Access denied for role: {}", userRole);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Insufficient permissions"));
            }

            String downloadUrl = fileStorageService.getDocumentDownloadUrl(documentPath);

            log.info("Generated download URL successfully");

            Map<String, String> response = new HashMap<>();
            response.put("downloadUrl", downloadUrl);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error generating download URL: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}