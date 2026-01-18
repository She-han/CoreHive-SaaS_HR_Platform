package com.corehive.backend.service;

import com.corehive.backend.dto.request.ExtendedModuleRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.ExtendedModuleResponse;
import com.corehive.backend.model.ExtendedModule;
import com.corehive.backend.repository.ExtendedModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Extended Module Service
 * Business logic for managing extended modules
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExtendedModuleService {

    private final ExtendedModuleRepository extendedModuleRepository;

    /**
     * Get all modules (for system admin)
     */
    public ApiResponse<List<ExtendedModuleResponse>> getAllModules() {
        try {
            log.info("Fetching all extended modules");

            List<ExtendedModule> modules = extendedModuleRepository.findAllByOrderByNameAsc();
            List<ExtendedModuleResponse> response = modules.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

            log.info("Retrieved {} extended modules", response.size());
            return ApiResponse.success("Modules retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error fetching extended modules", e);
            return ApiResponse.error("Failed to retrieve modules");
        }
    }

    /**
     * Get only active modules (for organization admins to select)
     */
    public ApiResponse<List<ExtendedModuleResponse>> getActiveModules() {
        try {
            log.info("Fetching active extended modules");

            List<ExtendedModule> modules = extendedModuleRepository.findByIsActiveTrue();
            List<ExtendedModuleResponse> response = modules.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

            log.info("Retrieved {} active extended modules", response.size());
            return ApiResponse.success("Active modules retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error fetching active extended modules", e);
            return ApiResponse.error("Failed to retrieve active modules");
        }
    }

    /**
     * Get module by ID
     */
    public ApiResponse<ExtendedModuleResponse> getModuleById(Long moduleId) {
        try {
            log.info("Fetching extended module with ID: {}", moduleId);

            ExtendedModule module = extendedModuleRepository.findById(moduleId)
                    .orElseThrow(() -> new RuntimeException("Module not found"));

            ExtendedModuleResponse response = convertToResponse(module);
            return ApiResponse.success("Module retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error fetching extended module with ID: {}", moduleId, e);
            return ApiResponse.error("Failed to retrieve module: " + e.getMessage());
        }
    }

    /**
     * Create new module (System Admin only)
     */
    @Transactional
    public ApiResponse<ExtendedModuleResponse> createModule(ExtendedModuleRequest request) {
        try {
            log.info("Creating new extended module: {}", request.getName());

            // Check if module with same name already exists
            if (extendedModuleRepository.existsByName(request.getName())) {
                return ApiResponse.error("Module with this name already exists");
            }

            // Check if module key already exists
            if (extendedModuleRepository.existsByModuleKey(request.getModuleKey())) {
                return ApiResponse.error("Module with this key already exists");
            }

            ExtendedModule module = ExtendedModule.builder()
                    .name(request.getName())
                    .description(request.getDescription())
                    .price(request.getPrice())
                    .isActive(request.getIsActive())
                    .moduleKey(request.getModuleKey())
                    .icon(request.getIcon())
                    .category(request.getCategory())
                    .build();

            ExtendedModule savedModule = extendedModuleRepository.save(module);
            log.info("Extended module created successfully with ID: {}", savedModule.getModuleId());

            ExtendedModuleResponse response = convertToResponse(savedModule);
            return ApiResponse.success("Module created successfully", response);

        } catch (Exception e) {
            log.error("Error creating extended module", e);
            return ApiResponse.error("Failed to create module: " + e.getMessage());
        }
    }

    /**
     * Update existing module (System Admin only)
     */
    @Transactional
    public ApiResponse<ExtendedModuleResponse> updateModule(Long moduleId, ExtendedModuleRequest request) {
        try {
            log.info("Updating extended module with ID: {}", moduleId);

            ExtendedModule module = extendedModuleRepository.findById(moduleId)
                    .orElseThrow(() -> new RuntimeException("Module not found"));

            // Check if name is being changed and if new name already exists
            if (!module.getName().equals(request.getName()) &&
                extendedModuleRepository.existsByName(request.getName())) {
                return ApiResponse.error("Module with this name already exists");
            }

            // Check if module key is being changed and if new key already exists
            if (!module.getModuleKey().equals(request.getModuleKey()) &&
                extendedModuleRepository.existsByModuleKey(request.getModuleKey())) {
                return ApiResponse.error("Module with this key already exists");
            }

            module.setName(request.getName());
            module.setDescription(request.getDescription());
            module.setPrice(request.getPrice());
            module.setIsActive(request.getIsActive());
            module.setModuleKey(request.getModuleKey());
            module.setIcon(request.getIcon());
            module.setCategory(request.getCategory());

            ExtendedModule updatedModule = extendedModuleRepository.save(module);
            log.info("Extended module updated successfully: {}", moduleId);

            ExtendedModuleResponse response = convertToResponse(updatedModule);
            return ApiResponse.success("Module updated successfully", response);

        } catch (Exception e) {
            log.error("Error updating extended module with ID: {}", moduleId, e);
            return ApiResponse.error("Failed to update module: " + e.getMessage());
        }
    }

    /**
     * Toggle module active status (System Admin only)
     */
    @Transactional
    public ApiResponse<ExtendedModuleResponse> toggleModuleStatus(Long moduleId) {
        try {
            log.info("Toggling status for extended module with ID: {}", moduleId);

            ExtendedModule module = extendedModuleRepository.findById(moduleId)
                    .orElseThrow(() -> new RuntimeException("Module not found"));

            module.setIsActive(!module.getIsActive());
            ExtendedModule updatedModule = extendedModuleRepository.save(module);

            log.info("Extended module status toggled to {}: {}", module.getIsActive(), moduleId);

            ExtendedModuleResponse response = convertToResponse(updatedModule);
            return ApiResponse.success("Module status updated successfully", response);

        } catch (Exception e) {
            log.error("Error toggling status for extended module with ID: {}", moduleId, e);
            return ApiResponse.error("Failed to update module status: " + e.getMessage());
        }
    }

    /**
     * Delete module (System Admin only)
     */
    @Transactional
    public ApiResponse<String> deleteModule(Long moduleId) {
        try {
            log.info("Deleting extended module with ID: {}", moduleId);

            if (!extendedModuleRepository.existsById(moduleId)) {
                return ApiResponse.error("Module not found");
            }

            extendedModuleRepository.deleteById(moduleId);
            log.info("Extended module deleted successfully: {}", moduleId);

            return ApiResponse.success("Module deleted successfully", null);

        } catch (Exception e) {
            log.error("Error deleting extended module with ID: {}", moduleId, e);
            return ApiResponse.error("Failed to delete module: " + e.getMessage());
        }
    }

    /**
     * Get modules by category
     */
    public ApiResponse<List<ExtendedModuleResponse>> getModulesByCategory(String category) {
        try {
            log.info("Fetching extended modules by category: {}", category);

            List<ExtendedModule> modules = extendedModuleRepository.findByIsActiveTrueAndCategory(category);
            List<ExtendedModuleResponse> response = modules.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

            log.info("Retrieved {} extended modules for category: {}", response.size(), category);
            return ApiResponse.success("Modules retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error fetching extended modules by category: {}", category, e);
            return ApiResponse.error("Failed to retrieve modules");
        }
    }

    /**
     * Convert ExtendedModule entity to response DTO
     */
    private ExtendedModuleResponse convertToResponse(ExtendedModule module) {
        return ExtendedModuleResponse.builder()
                .moduleId(module.getModuleId())
                .name(module.getName())
                .description(module.getDescription())
                .price(module.getPrice())
                .isActive(module.getIsActive())
                .moduleKey(module.getModuleKey())
                .icon(module.getIcon())
                .category(module.getCategory())
                .displayName(module.getDisplayName())
                .createdAt(module.getCreatedAt())
                .updatedAt(module.getUpdatedAt())
                .build();
    }
}
