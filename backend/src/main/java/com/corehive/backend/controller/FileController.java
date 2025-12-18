package com.corehive.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class FileController {

    @Value("${file.upload.dir:backend/uploads/business-registrations}")
    private String uploadDir;

    /**
     * Download business registration document
     * GET /api/files/business-registration/{filename}
     */
    @GetMapping("/business-registration/{filename}")
    public ResponseEntity<Resource> downloadBusinessRegistration(
            @PathVariable String filename,
            HttpServletRequest request) {

        try {
            log.info("File download request: {}", filename);

            // Get user email from request (JWT token already validated)
            String userEmail = (String) request.getAttribute("userEmail");
            String userRole = (String) request.getAttribute("userRole");

            log.info("File access by: {} (Role: {})", userEmail, userRole);

            // Load file as Resource
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.error("File not found or not readable: {}", filename);
                return ResponseEntity.notFound().build();
            }

            // Determine content type
            String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            log.info("File download successful: {}", filename);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (Exception e) {
            log.error("Error downloading file: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}