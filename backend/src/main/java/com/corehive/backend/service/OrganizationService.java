package com.corehive.backend.service;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.request.UpdateModuleConfigRequest;
import com.corehive.backend.dto.response.ModuleConfigResponse;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.OrganizationSummaryResponse;
import com.corehive.backend.exception.hrReportsException.ResourceNotFoundException;
import com.corehive.backend.dto.response.PlatformStatistics;
import com.corehive.backend.model.*;
import com.corehive.backend.repository.AppUserRepository;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.repository.OrganizationRepository;
import com.corehive.backend.repository.OrganizationModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final EmployeeRepository employeeRepository;
    private final OrganizationModuleService organizationModuleService;
    private final OrganizationModuleRepository organizationModuleRepository;
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

            // Sync with organization_modules table
            log.info("Syncing organization modules with organization_modules table");
            organizationModuleService.syncOrganizationModules(organizationUuid);

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

    /**
     * Get organization name by organization UUID
     * Used internally (PDFs, audits, reports)
     */
    public String getOrganizationName(String organizationUuid) {

        if (organizationUuid == null || organizationUuid.isBlank()) {
            throw new IllegalArgumentException("Organization UUID is required");
        }

        Organization organization = organizationRepository
                .findByOrganizationUuid(organizationUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Organization not found for UUID: " + organizationUuid
                        )
                );

        return organization.getName();
    }



    /**
     * Get Platform Statistics for System Admin Dashboard
     * Returns real-time statistics from the database
     */
    public PlatformStatistics getPlatformStatistics() {
        log.info("Fetching platform statistics from database");

        try {
            // Count organizations by status using enum values
            long totalOrganizations = organizationRepository.count();
            long activeOrganizations = organizationRepository.countByStatus(OrganizationStatus.ACTIVE);
            long pendingOrganizations = organizationRepository.countByStatus(OrganizationStatus.PENDING_APPROVAL);
            long dormantOrganizations = organizationRepository.countByStatus(OrganizationStatus.DORMANT);
            long suspendedOrganizations = organizationRepository.countByStatus(OrganizationStatus.SUSPENDED);

            // Calculate total employees from employee count ranges in organizations
            List<Organization> allOrganizations = organizationRepository.findAll();
            long estimatedTotalEmployees = allOrganizations.stream()
                    .mapToLong(org -> estimateEmployeeCount(org.getEmployeeCountRange()))
                    .sum();

            // Also get actual employee count from AppUser table for comparison
            long actualEmployees = appUserRepository.count();
            
            // Use actual count if available, otherwise use estimated
            long totalEmployees = actualEmployees > 0 ? actualEmployees : estimatedTotalEmployees;

            PlatformStatistics stats = PlatformStatistics.builder()
                    .totalOrganizations(totalOrganizations)
                    .activeOrganizations(activeOrganizations)
                    .pendingOrganizations(pendingOrganizations)
                    .dormantOrganizations(dormantOrganizations)
                    .suspendedOrganizations(suspendedOrganizations)
                    .totalEmployees(totalEmployees)
                    .totalSystemUsers(0L) // Can be updated when SystemUser count is needed
                    .build();

            log.info("Platform statistics fetched - Total Orgs: {}, Active: {}, Pending: {}, Dormant: {}, Suspended: {}, Employees: {} (actual: {}, estimated: {})",
                    totalOrganizations, activeOrganizations, pendingOrganizations, 
                    dormantOrganizations, suspendedOrganizations, totalEmployees, actualEmployees, estimatedTotalEmployees);

            return stats;

        } catch (Exception e) {
            log.error("Error fetching platform statistics", e);
            // Return empty stats instead of throwing exception
            return PlatformStatistics.builder()
                    .totalOrganizations(0L)
                    .activeOrganizations(0L)
                    .pendingOrganizations(0L)
                    .dormantOrganizations(0L)
                    .suspendedOrganizations(0L)
                    .totalEmployees(0L)
                    .totalSystemUsers(0L)
                    .build();
        }
    }

    /**
     * Estimate employee count from range string
     * e.g., "1-50" returns midpoint 25, "50-100" returns 75
     */
    private long estimateEmployeeCount(String range) {
        if (range == null || range.isEmpty()) {
            return 0;
        }

        try {
            // Handle ranges like "1-50", "50-100", "100-500", "500+"
            if (range.contains("+")) {
                // For "500+" assume 750
                String number = range.replace("+", "").trim();
                return Long.parseLong(number) + 250;
            } else if (range.contains("-")) {
                // For "1-50" get midpoint
                String[] parts = range.split("-");
                if (parts.length == 2) {
                    long min = Long.parseLong(parts[0].trim());
                    long max = Long.parseLong(parts[1].trim());
                    return (min + max) / 2;
                }
            }
            
            // If it's just a number, return it
            return Long.parseLong(range.trim());
        } catch (Exception e) {
            log.warn("Could not parse employee count range: {}", range);
            return 25; // Default to 25 if parsing fails
        }
    }

    private String calculateBilling(String plan) {
        if (plan == null) return "$0/mo";

        switch (plan.toLowerCase()) {
            case "starter":
                return "$199/mo";
            case "professional":
                return "$599/mo";
            case "enterprise":
                return "$1,499/mo";
            default:
                return "$0/mo";
        }
    }

    private OrganizationSummaryResponse convertToSummaryResponse(Organization org) {
        // Count users for this organization
        int userCount = appUserRepository.countByOrganizationUuid(org.getOrganizationUuid());

        return OrganizationSummaryResponse.builder()
                .id(org.getId())
                .organizationUuid(org.getOrganizationUuid())
                .name(org.getName())
                .email(org.getEmail())
                .status(org.getStatus().name())
                .businessRegistrationNumber(org.getBusinessRegistrationNumber())
                .businessRegistrationDocument(org.getBusinessRegistrationDocument())
                .employeeCountRange(org.getEmployeeCountRange())
                .plan(org.getBillingPlan() != null ? org.getBillingPlan() : "Starter")
                .billing(calculateBilling(org.getBillingPlan()))
                .billingPrice(org.getBillingPricePerUserPerMonth() != null ? 
                    org.getBillingPricePerUserPerMonth().doubleValue() : null)
                .createdAt(org.getCreatedAt())
                .userCount(userCount)
                .moduleQrAttendanceMarking(org.getModuleQrAttendanceMarking())
                .moduleFaceRecognitionAttendanceMarking(org.getModuleFaceRecognitionAttendanceMarking())
                        .moduleEmployeeFeedback(org.getModuleEmployeeFeedback())
                        .moduleHiringManagement(org.getModuleHiringManagement())
                        .modulesConfigured(org.getModulesConfigured())
                        .build();
    }

    /**
     * Get employee by email (for current user profile)
     */
    public ApiResponse<Employee> getEmployeeByEmail(String organizationUuid, String email) {
        try {
            log.info("Fetching employee with email: {} for organization: {}", email, organizationUuid);

            Optional<Employee> employeeOpt = employeeRepository.findByEmailAndOrganizationUuid(email, organizationUuid);

            if (employeeOpt.isEmpty()) {
                log.warn("Employee not found with email: {}", email);
                return ApiResponse.error("Employee profile not found");
            }

            Employee employee = employeeOpt.get();
            log.info("Employee profile retrieved successfully for: {}", email);
            return ApiResponse.success("Employee profile retrieved successfully", employee);

        } catch (Exception e) {
            log.error("Error fetching employee with email: {}", email, e);
            return ApiResponse.error("Failed to retrieve employee profile");
        }
    }

    /**
     * Update employee by email (for current user profile)
     */
    @Transactional
    public ApiResponse<Employee> updateEmployeeByEmail(String organizationUuid, String email, EmployeeRequestDTO request) {
        try {
            log.info("Updating employee with email: {} for organization: {}", email, organizationUuid);

            Optional<Employee> employeeOpt = employeeRepository.findByEmailAndOrganizationUuid(email, organizationUuid);

            if (employeeOpt.isEmpty()) {
                log.warn("Employee not found with email: {}", email);
                return ApiResponse.error("Employee profile not found");
            }

            Employee employee = employeeOpt.get();

            // Employees can only update limited fields (not email, salary, department, etc.)
            employee.setFirstName(request.getFirstName());
            employee.setLastName(request.getLastName());
            employee.setPhone(request.getPhone());
            employee.setUpdatedAt(LocalDateTime.now());

            Employee savedEmployee = employeeRepository.save(employee);

            log.info("Employee profile updated successfully for: {}", email);
            return ApiResponse.success("Profile updated successfully", savedEmployee);

        } catch (Exception e) {
            log.error("Error updating employee with email: {}", email, e);
            return ApiResponse.error("Failed to update profile: " + e.getMessage());
        }
    }

    /**
     * Permanently delete an organization and all related data
     * Only accessible by System Admin
     */
    @Transactional
    public ApiResponse<String> deleteOrganization(String organizationUuid) {
        try {
            log.info("Attempting to delete organization: {}", organizationUuid);

            Organization organization = organizationRepository.findByOrganizationUuid(organizationUuid)
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

            // Delete all users associated with this organization
            List<AppUser> users = appUserRepository.findByOrganizationUuid(organizationUuid);
            if (!users.isEmpty()) {
                appUserRepository.deleteAll(users);
                log.info("Deleted {} users for organization: {}", users.size(), organizationUuid);
            }

            // Delete all employees associated with this organization
            List<Employee> employees = employeeRepository.findByOrganizationUuid(organizationUuid);
            if (!employees.isEmpty()) {
                employeeRepository.deleteAll(employees);
                log.info("Deleted {} employees for organization: {}", employees.size(), organizationUuid);
            }

            // Delete all organization modules
            List<OrganizationModule> organizationModules = organizationModuleRepository.findByOrganizationUuid(organizationUuid);
            if (!organizationModules.isEmpty()) {
                organizationModuleRepository.deleteAll(organizationModules);
                log.info("Deleted {} organization modules for organization: {}", organizationModules.size(), organizationUuid);
            }

            // Delete the organization
            organizationRepository.delete(organization);
            log.info("Successfully deleted organization: {} ({})", organization.getName(), organizationUuid);

            return ApiResponse.success("Organization deleted successfully", null);

        } catch (Exception e) {
            log.error("Error deleting organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to delete organization: " + e.getMessage());
        }
    }

}