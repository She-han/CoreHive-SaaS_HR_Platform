package com.corehive.backend.controller;

import com.corehive.backend.dto.request.ExtendedModuleRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.ExtendedModuleResponse;
import com.corehive.backend.service.ExtendedModuleService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Extended Module Controller
 * REST API endpoints for managing extended modules
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ExtendedModuleController {

    private final ExtendedModuleService extendedModuleService;

    /**
     * Get all modules (System Admin only)
     * GET /api/sys_admin/modules
     */
    @GetMapping("/sys_admin/modules")
    @PreAuthorize("hasRole('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<List<ExtendedModuleResponse>>> getAllModules(
            HttpServletRequest request) {
        
        String adminEmail = (String) request.getAttribute("userEmail");
        log.info("Get all modules request from admin: {}", adminEmail);

        try {
            ApiResponse<List<ExtendedModuleResponse>> response = extendedModuleService.getAllModules();
            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error retrieving all modules", e);
            ApiResponse<List<ExtendedModuleResponse>> errorResponse = 
                    ApiResponse.error("Failed to retrieve modules");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get active modules (Organization Admins can access)
     * GET /api/modules/active
     */
    @GetMapping("/modules/active")
    @PreAuthorize("hasAnyRole('SYS_ADMIN', 'ORG_ADMIN')")
    public ResponseEntity<ApiResponse<List<ExtendedModuleResponse>>> getActiveModules(
            HttpServletRequest request) {
        
        String userEmail = (String) request.getAttribute("userEmail");
        log.info("Get active modules request from user: {}", userEmail);

        try {
            ApiResponse<List<ExtendedModuleResponse>> response = extendedModuleService.getActiveModules();
            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error retrieving active modules", e);
            ApiResponse<List<ExtendedModuleResponse>> errorResponse = 
                    ApiResponse.error("Failed to retrieve active modules");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get module by ID (System Admin only)
     * GET /api/sys_admin/modules/{moduleId}
     */
    @GetMapping("/sys_admin/modules/{moduleId}")
    @PreAuthorize("hasRole('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<ExtendedModuleResponse>> getModuleById(
            @PathVariable Long moduleId,
            HttpServletRequest request) {
        
        String adminEmail = (String) request.getAttribute("userEmail");
        log.info("Get module {} request from admin: {}", moduleId, adminEmail);

        try {
            ApiResponse<ExtendedModuleResponse> response = extendedModuleService.getModuleById(moduleId);
            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.NOT_FOUND;
            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error retrieving module {}", moduleId, e);
            ApiResponse<ExtendedModuleResponse> errorResponse = 
                    ApiResponse.error("Failed to retrieve module");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Create new module (System Admin only)
     * POST /api/sys_admin/modules
     */
    @PostMapping("/sys_admin/modules")
    @PreAuthorize("hasRole('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<ExtendedModuleResponse>> createModule(
            @Valid @RequestBody ExtendedModuleRequest request,
            HttpServletRequest httpRequest) {
        
        String adminEmail = (String) httpRequest.getAttribute("userEmail");
        log.info("Create module request from admin: {} - Module: {}", adminEmail, request.getName());

        try {
            ApiResponse<ExtendedModuleResponse> response = extendedModuleService.createModule(request);
            HttpStatus status = response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error creating module", e);
            ApiResponse<ExtendedModuleResponse> errorResponse = 
                    ApiResponse.error("Failed to create module");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Update module (System Admin only)
     * PUT /api/sys_admin/modules/{moduleId}
     */
    @PutMapping("/sys_admin/modules/{moduleId}")
    @PreAuthorize("hasRole('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<ExtendedModuleResponse>> updateModule(
            @PathVariable Long moduleId,
            @Valid @RequestBody ExtendedModuleRequest request,
            HttpServletRequest httpRequest) {
        
        String adminEmail = (String) httpRequest.getAttribute("userEmail");
        log.info("Update module {} request from admin: {}", moduleId, adminEmail);

        try {
            ApiResponse<ExtendedModuleResponse> response = 
                    extendedModuleService.updateModule(moduleId, request);
            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error updating module {}", moduleId, e);
            ApiResponse<ExtendedModuleResponse> errorResponse = 
                    ApiResponse.error("Failed to update module");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Toggle module active status (System Admin only)
     * PUT /api/sys_admin/modules/{moduleId}/toggle
     */
    @PutMapping("/sys_admin/modules/{moduleId}/toggle")
    @PreAuthorize("hasRole('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<ExtendedModuleResponse>> toggleModuleStatus(
            @PathVariable Long moduleId,
            HttpServletRequest request) {
        
        String adminEmail = (String) request.getAttribute("userEmail");
        log.info("Toggle module {} status request from admin: {}", moduleId, adminEmail);

        try {
            ApiResponse<ExtendedModuleResponse> response = 
                    extendedModuleService.toggleModuleStatus(moduleId);
            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.NOT_FOUND;
            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error toggling module {} status", moduleId, e);
            ApiResponse<ExtendedModuleResponse> errorResponse = 
                    ApiResponse.error("Failed to toggle module status");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Delete module (System Admin only)
     * DELETE /api/sys_admin/modules/{moduleId}
     */
    @DeleteMapping("/sys_admin/modules/{moduleId}")
    @PreAuthorize("hasRole('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteModule(
            @PathVariable Long moduleId,
            HttpServletRequest request) {
        
        String adminEmail = (String) request.getAttribute("userEmail");
        log.info("Delete module {} request from admin: {}", moduleId, adminEmail);

        try {
            ApiResponse<String> response = extendedModuleService.deleteModule(moduleId);
            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.NOT_FOUND;
            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error deleting module {}", moduleId, e);
            ApiResponse<String> errorResponse = 
                    ApiResponse.error("Failed to delete module");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get modules by category
     * GET /api/modules/category/{category}
     */
    @GetMapping("/modules/category/{category}")
    @PreAuthorize("hasAnyRole('SYS_ADMIN', 'ORG_ADMIN')")
    public ResponseEntity<ApiResponse<List<ExtendedModuleResponse>>> getModulesByCategory(
            @PathVariable String category,
            HttpServletRequest request) {
        
        String userEmail = (String) request.getAttribute("userEmail");
        log.info("Get modules by category {} request from user: {}", category, userEmail);

        try {
            ApiResponse<List<ExtendedModuleResponse>> response = 
                    extendedModuleService.getModulesByCategory(category);
            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error retrieving modules by category {}", category, e);
            ApiResponse<List<ExtendedModuleResponse>> errorResponse = 
                    ApiResponse.error("Failed to retrieve modules by category");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
