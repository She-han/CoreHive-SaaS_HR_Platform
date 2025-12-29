package com.corehive.backend.service;

import com.corehive.backend.dto.request.CreateDesignationRequest;
import com.corehive.backend.dto.request.UpdateDesignationRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.model.Designation;
import com.corehive.backend.repository.DesignationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing designations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DesignationService {

    private final DesignationRepository designationRepository;

    /**
     * Get all designations for an organization
     */
    public List<Designation> getDesignationsByOrganization(String organizationUuid) {
        return designationRepository.findByOrganizationUuid(organizationUuid);
    }

    /**
     * Create a new designation for an organization
     */
    @Transactional
    public Designation createDesignation(String organizationUuid, CreateDesignationRequest request) {

        Optional<Designation> existingDesignation =
                designationRepository.findByOrganizationUuidAndName(organizationUuid, request.getName());

        if (existingDesignation.isPresent()) {
            throw new RuntimeException("Designation with this name already exists");
        }

        Designation designation = new Designation();
        designation.setOrganizationUuid(organizationUuid);
        designation.setName(request.getName());
        designation.setCreatedAt(LocalDateTime.now());

        return designationRepository.save(designation);
    }

    /**
     * Update a designation
     */
    @Transactional
    public ApiResponse<Designation> updateDesignation(String organizationUuid, UpdateDesignationRequest request) {
        try {
            Optional<Designation> designationOpt = designationRepository.findById(request.getId());

            if (designationOpt.isEmpty()) {
                return ApiResponse.error("Designation not found");
            }

            Designation designation = designationOpt.get();

            if (!designation.getOrganizationUuid().equals(organizationUuid)) {
                return ApiResponse.error("Unauthorized to update this designation");
            }

            // Check if name already exists (excluding current designation)
            Optional<Designation> existingName = designationRepository.findByOrganizationUuidAndName(organizationUuid, request.getName());
            if (existingName.isPresent() && !existingName.get().getId().equals(request.getId())) {
                return ApiResponse.error("Designation with this name already exists");
            }

            designation.setName(request.getName());

            Designation updatedDesignation = designationRepository.save(designation);
            return ApiResponse.success("Designation updated successfully", updatedDesignation);

        } catch (Exception e) {
            log.error("Error updating designation", e);
            return ApiResponse.error("Failed to update designation: " + e.getMessage());
        }
    }

    /**
     * Delete a designation
     */
    @Transactional
    public ApiResponse<Void> deleteDesignation(String organizationUuid, Long id) {
        try {
            Optional<Designation> designationOpt = designationRepository.findById(id);

            if (designationOpt.isEmpty()) {
                return ApiResponse.error("Designation not found");
            }

            Designation designation = designationOpt.get();

            if (!designation.getOrganizationUuid().equals(organizationUuid)) {
                return ApiResponse.error("Unauthorized to delete this designation");
            }

            designationRepository.delete(designation);
            return ApiResponse.success("Designation deleted successfully", null);

        } catch (Exception e) {
            log.error("Error deleting designation", e);
            return ApiResponse.error("Failed to delete designation: " + e.getMessage());
        }
    }
}