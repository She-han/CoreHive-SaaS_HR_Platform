package com.corehive.backend.service;

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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final AppUserRepository appUserRepository;

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
     * Approve organization registration - FIXED VERSION
     */
    @Transactional
    public ApiResponse<String> approveOrganization(String organizationUuid) {
        try {
            log.info("Approving organization: {}", organizationUuid);

            Optional<Organization> orgOpt = organizationRepository.findByOrganizationUuid(organizationUuid);
            if (orgOpt.isEmpty()) {
                return ApiResponse.error("Organization not found");
            }

            Organization organization = orgOpt.get();

            // Status check - FIXED VERSION
            if (!organization.isPendingApproval()) {
                return ApiResponse.error("Organization is not in pending approval status");
            }

            // Organization status update 
            organization.setStatus(OrganizationStatus.ACTIVE);
            organizationRepository.save(organization);

            // Admin user activate 
            List<AppUser> adminUsers = appUserRepository
                    .findByOrganizationUuidAndRole(organizationUuid, AppUserRole.ORG_ADMIN.name());

            for (AppUser adminUser : adminUsers) {
                adminUser.setIsActive(true);
                appUserRepository.save(adminUser);
            }

            log.info("Organization approved successfully: {} ({})", organization.getName(), organizationUuid);
            return ApiResponse.success("Organization approved successfully", null);

        } catch (Exception e) {
            log.error("Error approving organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to approve organization");
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
                .modulePerformanceTracking(org.getModulePerformanceTracking())
                .moduleEmployeeFeedback(org.getModuleEmployeeFeedback())
                .moduleHiringManagement(org.getModuleHiringManagement())
                .modulesConfigured(org.getModulesConfigured())
                .build();
    }
}