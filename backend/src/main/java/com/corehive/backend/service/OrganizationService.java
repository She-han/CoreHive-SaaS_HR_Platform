package com.corehive.backend.service;

import com.corehive.backend.dto.request.UpdateModuleConfigRequest;
import com.corehive.backend.dto.response.ModuleConfigResponse;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.OrganizationSummaryResponse;
import com.corehive.backend.model.AppUser;
import com.corehive.backend.model.Organization;
import com.corehive.backend.model.OrganizationStatus;
import com.corehive.backend.model.AppUserRole;
import com.corehive.backend.repository.AppUserRepository;
import com.corehive.backend.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    /**
     * Get all pending organization approvals
     */
    public ApiResponse<List<OrganizationSummaryResponse>> getPendingApprovals() {
        try {
            log.info("Fetching pending organization approvals");

            List<Organization> pendingOrgs = organizationRepository.findPendingApprovals();

            List<OrganizationSummaryResponse> response = pendingOrgs.stream()
                    .map(this::convertToSummaryResponse)
                    .collect(Collectors.toList());

            log.info("Found {} pending organizations", response.size());
            return ApiResponse.success("Pending approvals retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error fetching pending approvals", e);
            return ApiResponse.error("Failed to retrieve pending approvals");
        }
    }

    /**
     * Approve organization registration - ENHANCED ERROR HANDLING VERSION
     */
    @Transactional
    public ApiResponse<String> approveOrganization(String organizationUuid) {
        try {
            log.info("Approving organization: {}", organizationUuid);

            Optional<Organization> orgOpt = organizationRepository.findByOrganizationUuid(organizationUuid);
            if (orgOpt.isEmpty()) {
                log.warn("Organization not found: {}", organizationUuid);
                return ApiResponse.error("Organization not found");
            }

            Organization organization = orgOpt.get();
            log.info("Found organization: {} with status: {}", organization.getName(), organization.getStatus());

            // Status check
            if (!organization.isPendingApproval()) {
                log.warn("Organization {} is not in pending approval status. Current status: {}", 
                        organizationUuid, organization.getStatus());
                return ApiResponse.error("Organization is not in pending approval status. Current status: " + organization.getStatus());
            }


            // Organization status update
            log.info("Updating organization status to ACTIVE for: {}", organization.getName());




            String tempPassword = UUID.randomUUID().toString().substring(0, 8);
            String hashedPassword = passwordEncoder.encode(tempPassword);

            organization.setStatus(OrganizationStatus.ACTIVE);
            organizationRepository.save(organization);
            log.info("Organization status updated successfully to ACTIVE: {}", organization.getName());

            // Admin user activate - SIMPLIFIED VERSION USING ONLY STRING METHOD
            log.info("Starting user activation process for organization: {}", organizationUuid);
            
            // Use only the string method since that works correctly
            List<AppUser> adminUsers = appUserRepository
                    .findByOrganizationUuidAndRole(organizationUuid, AppUserRole.ORG_ADMIN.name());
            log.info("Found {} admin users using string role '{}' for organization: {}", 
                    adminUsers.size(), AppUserRole.ORG_ADMIN.name(), organizationUuid);
            
            if (adminUsers.isEmpty()) {
                log.warn("No ORG_ADMIN users found for organization: {}", organizationUuid);
                // Let's also try to find all users for this organization to debug
                List<AppUser> allUsers = appUserRepository.findByOrganizationUuid(organizationUuid);
                log.info("Total users found for organization {}: {}", organizationUuid, allUsers.size());
                for (AppUser user : allUsers) {
                    log.info("User found: email={}, role={}, isActive={}", user.getEmail(), user.getRole(), user.getIsActive());
                }
                
                // Continue with approval but note that no admin users were activated
                log.info("Organization approved successfully: {} ({}) - No admin users found to activate", 
                        organization.getName(), organizationUuid);
                return ApiResponse.success("Organization approved successfully (no admin users found to activate)", null);
            }

            log.info("Activating {} admin users for organization: {}", adminUsers.size(), organizationUuid);
            int activatedCount = 0;
            for (AppUser adminUser : adminUsers) {
                try {
                    boolean wasActive = adminUser.getIsActive();
                    log.info("Processing admin user: {} (currently active: {})", adminUser.getEmail(), wasActive);
                    
                    adminUser.setIsActive(true);
                    adminUser.setPasswordHash(hashedPassword);
                    AppUser savedUser = appUserRepository.save(adminUser);
                    activatedCount++;
                    try {
                        emailService.sendOrgPasswordEmail(adminUser.getEmail(), tempPassword ,organization.getName());
                    } catch (Exception e) {
                        System.err.println("Failed to send email: " + e.getMessage());
                    }
                    log.info("Admin user activated successfully: {} (was active: {}, now active: {})", 
                            savedUser.getEmail(), wasActive, savedUser.getIsActive());
                } catch (Exception e) {
                    log.error("Error activating admin user: {}", adminUser.getEmail(), e);
                    throw e; // Re-throw to fail the transaction
                }
            }

            log.info("Organization approved successfully: {} ({}) - Activated {} admin users", 
                    organization.getName(), organizationUuid, activatedCount);
            return ApiResponse.success("Organization approved successfully", null);

        } catch (Exception e) {
            log.error("Error approving organization: {} - Exception: {}", organizationUuid, e.getMessage(), e);
            return ApiResponse.error("Failed to approve organization: " + e.getMessage());
        }
    }

    /**
     * Reject organization registration - FIXED VERSION
     */
    @Transactional
    public ApiResponse<String> rejectOrganization(String organizationUuid) {
        try {
            log.info("Rejecting organization: {}", organizationUuid);

            Optional<Organization> orgOpt = organizationRepository.findByOrganizationUuid(organizationUuid);
            if (orgOpt.isEmpty()) {
                return ApiResponse.error("Organization not found");
            }

            Organization organization = orgOpt.get();

            // Status check - FIXED VERSION
            if (!organization.isPendingApproval()) {
                return ApiResponse.error("Organization is not in pending approval status");
            }

            // Status update 
            organization.setStatus(OrganizationStatus.SUSPENDED);
            organizationRepository.save(organization);

            log.info("Organization rejected: {} ({})", organization.getName(), organizationUuid);
            return ApiResponse.success("Organization rejected", null);

        } catch (Exception e) {
            log.error("Error rejecting organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to reject organization");
        }
    }

    /**
     * Get all organizations with pagination and filtering
     */
    public ApiResponse<Page<OrganizationSummaryResponse>> getAllOrganizations(Pageable pageable) {
        try {
            log.info("Fetching all organizations with pagination");

            Page<Organization> organizations = organizationRepository.findAll(pageable);

            List<OrganizationSummaryResponse> responseList = organizations.getContent()
                    .stream()
                    .map(this::convertToSummaryResponse)
                    .collect(Collectors.toList());

            Page<OrganizationSummaryResponse> response = new PageImpl<>(
                    responseList,
                    pageable,
                    organizations.getTotalElements()
            );

            log.info("Retrieved {} organizations (page {} of {})",
                    responseList.size(), pageable.getPageNumber() + 1, response.getTotalPages());

            return ApiResponse.success("Organizations retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error fetching organizations", e);
            return ApiResponse.error("Failed to retrieve organizations");
        }
    }

    /**
     * Change organization status - FIXED VERSION
     */
    @Transactional
    public ApiResponse<String> changeOrganizationStatus(String organizationUuid, String newStatus) {
        try {
            log.info("Changing organization status: {} to {}", organizationUuid, newStatus);

            Optional<Organization> orgOpt = organizationRepository.findByOrganizationUuid(organizationUuid);
            if (orgOpt.isEmpty()) {
                return ApiResponse.error("Organization not found");
            }

            Organization organization = orgOpt.get();

            // Validate status transition
            OrganizationStatus targetStatus;
            try {
                targetStatus = OrganizationStatus.valueOf(newStatus.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ApiResponse.error("Invalid status: " + newStatus);
            }

            // Check if status change is allowed
            if (!organization.getStatus().canChangeTo(targetStatus)) {
                return ApiResponse.error(
                        String.format("Cannot change status from %s to %s",
                                organization.getStatus().getDisplayName(),
                                targetStatus.getDisplayName())
                );
            }

            organization.setStatus(targetStatus);
            organizationRepository.save(organization);

            // Status users activate/deactivate 
            List<AppUser> users = appUserRepository.findByOrganizationUuid(organizationUuid);
            boolean shouldActivateUsers = targetStatus.allowsLogin();

            for (AppUser user : users) {
                user.setIsActive(shouldActivateUsers);
                appUserRepository.save(user);
            }

            log.info("Organization status changed: {} -> {}", organization.getName(), targetStatus.getDisplayName());
            return ApiResponse.success("Organization status updated successfully", null);

        } catch (Exception e) {
            log.error("Error changing organization status: {}", organizationUuid, e);
            return ApiResponse.error("Failed to change organization status");
        }
    }

    /**
     * Get organization details by UUID
     * For admin review and approval workflow
     */
    public ApiResponse<OrganizationSummaryResponse> getOrganizationDetails(String organizationUuid) {
        try {
            log.info("Fetching organization details: {}", organizationUuid);

            Optional<Organization> orgOpt = organizationRepository.findByOrganizationUuid(organizationUuid);
            if (orgOpt.isEmpty()) {
                return ApiResponse.error("Organization not found");
            }

            Organization organization = orgOpt.get();
            OrganizationSummaryResponse response = convertToSummaryResponse(organization);

            log.info("Organization details retrieved: {}", organization.getName());
            return ApiResponse.success("Organization details retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error fetching organization details: {}", organizationUuid, e);
            return ApiResponse.error("Failed to retrieve organization details");
        }
    }

    /**
     * Helper method - Convert Organization to Summary Response - FIXED VERSION
     */
    private OrganizationSummaryResponse convertToSummaryResponse(Organization org) {
        return OrganizationSummaryResponse.builder()
                .id(org.getId())
                .organizationUuid(org.getOrganizationUuid())
                .name(org.getName())
                .email(org.getEmail())
                .status(org.getStatus().name()) // FIXED: Use .name() instead of .toString()
                .employeeCountRange(org.getEmployeeCountRange())
                .createdAt(org.getCreatedAt())
                .moduleQrAttendanceMarking(org.getModuleQrAttendanceMarking())
                .moduleFaceRecognitionAttendanceMarking((org.getModuleFaceRecognitionAttendanceMarking()))
                .moduleEmployeeFeedback(org.getModuleEmployeeFeedback())
                .moduleHiringManagement(org.getModuleHiringManagement())
                .modulesConfigured(org.getModulesConfigured())
                .build();
    }

    /**
     * Get current module configuration for an organization
     */
    public ApiResponse<ModuleConfigResponse> getModuleConfiguration(String organizationUuid) {
        try {
            log.info("Fetching module configuration for organization: {}", organizationUuid);

            Optional<Organization> orgOpt = organizationRepository.findByOrganizationUuid(organizationUuid);
            if (orgOpt.isEmpty()) {
                return ApiResponse.error("Organization not found");
            }

            Organization organization = orgOpt.get();

            ModuleConfigResponse response = ModuleConfigResponse.builder()
                    .organizationUuid(organization.getOrganizationUuid())
                    .organizationName(organization.getName())
                    .moduleQrAttendanceMarking(organization.getModuleQrAttendanceMarking())
                    .moduleFaceRecognitionAttendanceMarking(organization.getModuleFaceRecognitionAttendanceMarking())
                    .moduleEmployeeFeedback(organization.getModuleEmployeeFeedback())
                    .moduleHiringManagement(organization.getModuleHiringManagement())
                    .modulesConfigured(organization.getModulesConfigured())
                    .build();

            log.info("Module configuration retrieved for: {}", organization.getName());
            return ApiResponse.success("Module configuration retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error fetching module configuration: {}", organizationUuid, e);
            return ApiResponse.error("Failed to retrieve module configuration");
        }
    }

    /**
     * Update module configuration for an organization
     */
    @Transactional
    public ApiResponse<ModuleConfigResponse> updateModuleConfiguration(
            String organizationUuid,
            UpdateModuleConfigRequest request) {
        try {
            log.info("Updating module configuration for organization: {}", organizationUuid);

            Optional<Organization> orgOpt = organizationRepository.findByOrganizationUuid(organizationUuid);
            if (orgOpt.isEmpty()) {
                return ApiResponse.error("Organization not found");
            }

            Organization organization = orgOpt.get();

            // Update only the fields that are provided (not null)
            if (request.getModuleQrAttendanceMarking() != null) {
                organization.setModuleQrAttendanceMarking(request.getModuleQrAttendanceMarking());
            }
            if (request.getModuleFaceRecognitionAttendanceMarking() != null) {
                organization.setModuleFaceRecognitionAttendanceMarking(request.getModuleFaceRecognitionAttendanceMarking());
            }
            if (request.getModuleEmployeeFeedback() != null) {
                organization.setModuleEmployeeFeedback(request.getModuleEmployeeFeedback());
            }
            if (request.getModuleHiringManagement() != null) {
                organization.setModuleHiringManagement(request.getModuleHiringManagement());
            }

            // Mark as configured if not already
            if (!Boolean.TRUE.equals(organization.getModulesConfigured())) {
                organization.setModulesConfigured(true);
            }

            Organization savedOrg = organizationRepository.save(organization);

            ModuleConfigResponse response = ModuleConfigResponse.builder()
                    .organizationUuid(savedOrg.getOrganizationUuid())
                    .organizationName(savedOrg.getName())
                    .moduleQrAttendanceMarking(savedOrg.getModuleQrAttendanceMarking())
                    .moduleFaceRecognitionAttendanceMarking(savedOrg.getModuleFaceRecognitionAttendanceMarking())
                    .moduleEmployeeFeedback(savedOrg.getModuleEmployeeFeedback())
                    .moduleHiringManagement(savedOrg.getModuleHiringManagement())
                    .modulesConfigured(savedOrg.getModulesConfigured())
                    .build();

            log.info("Module configuration updated successfully for: {}", organization.getName());
            return ApiResponse.success("Module configuration updated successfully", response);

        } catch (Exception e) {
            log.error("Error updating module configuration: {}", organizationUuid, e);
            return ApiResponse.error("Failed to update module configuration");
        }
    }
 }