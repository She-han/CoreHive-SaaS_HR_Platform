package com.corehive.backend.service;

import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.model.ExtendedModule;
import com.corehive.backend.model.Organization;
import com.corehive.backend.model.OrganizationModule;
import com.corehive.backend.repository.ExtendedModuleRepository;
import com.corehive.backend.repository.OrganizationModuleRepository;
import com.corehive.backend.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Organization Module Service
 * Business logic for managing organization-module subscriptions
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizationModuleService {

    private final OrganizationModuleRepository organizationModuleRepository;
    private final OrganizationRepository organizationRepository;
    private final ExtendedModuleRepository extendedModuleRepository;

    /**
     * Get all modules for an organization
     */
    public ApiResponse<List<OrganizationModule>> getOrganizationModules(String organizationUuid) {
        try {
            log.info("Fetching modules for organization: {}", organizationUuid);

            List<OrganizationModule> modules = organizationModuleRepository.findByOrganizationUuid(organizationUuid);

            log.info("Found {} modules for organization: {}", modules.size(), organizationUuid);
            return ApiResponse.success("Organization modules retrieved successfully", modules);

        } catch (Exception e) {
            log.error("Error fetching modules for organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to retrieve organization modules");
        }
    }

    /**
     * Get enabled modules for an organization
     */
    public ApiResponse<List<OrganizationModule>> getEnabledModules(String organizationUuid) {
        try {
            log.info("Fetching enabled modules for organization: {}", organizationUuid);

            List<OrganizationModule> modules = organizationModuleRepository.findEnabledByOrganizationUuid(organizationUuid);

            log.info("Found {} enabled modules for organization: {}", modules.size(), organizationUuid);
            return ApiResponse.success("Enabled modules retrieved successfully", modules);

        } catch (Exception e) {
            log.error("Error fetching enabled modules for organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to retrieve enabled modules");
        }
    }

    /**
     * Subscribe organization to a module
     */
    @Transactional
    public ApiResponse<OrganizationModule> subscribeToModule(String organizationUuid, Long moduleId) {
        try {
            log.info("Subscribing organization {} to module {}", organizationUuid, moduleId);

            Organization organization = organizationRepository.findByOrganizationUuid(organizationUuid)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));

            ExtendedModule module = extendedModuleRepository.findById(moduleId)
                    .orElseThrow(() -> new RuntimeException("Module not found"));

            // Check if module is active
            if (!module.isAvailable()) {
                return ApiResponse.error("Module is not available for subscription");
            }

            // Check if already subscribed
            Optional<OrganizationModule> existing = organizationModuleRepository
                    .findByOrganizationAndExtendedModule(organization, module);

            OrganizationModule orgModule;
            if (existing.isPresent()) {
                // Update existing subscription
                orgModule = existing.get();
                orgModule.setIsEnabled(true);
                orgModule.setSubscribedAt(LocalDateTime.now());
                log.info("Re-enabling existing subscription for organization {} to module {}", organizationUuid, moduleId);
            } else {
                // Create new subscription
                orgModule = OrganizationModule.builder()
                        .organization(organization)
                        .extendedModule(module)
                        .isEnabled(true)
                        .subscribedAt(LocalDateTime.now())
                        .build();
                log.info("Creating new subscription for organization {} to module {}", organizationUuid, moduleId);
            }

            OrganizationModule saved = organizationModuleRepository.save(orgModule);
            
            // Update organization's module flag based on module key
            updateOrganizationModuleFlag(organization, module.getModuleKey(), true);

            log.info("Organization {} successfully subscribed to module {}", organizationUuid, moduleId);
            return ApiResponse.success("Successfully subscribed to module", saved);

        } catch (Exception e) {
            log.error("Error subscribing organization {} to module {}", organizationUuid, moduleId, e);
            return ApiResponse.error("Failed to subscribe to module: " + e.getMessage());
        }
    }

    /**
     * Unsubscribe organization from a module
     */
    @Transactional
    public ApiResponse<String> unsubscribeFromModule(String organizationUuid, Long moduleId) {
        try {
            log.info("Unsubscribing organization {} from module {}", organizationUuid, moduleId);

            Organization organization = organizationRepository.findByOrganizationUuid(organizationUuid)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));

            ExtendedModule module = extendedModuleRepository.findById(moduleId)
                    .orElseThrow(() -> new RuntimeException("Module not found"));

            Optional<OrganizationModule> existing = organizationModuleRepository
                    .findByOrganizationAndExtendedModule(organization, module);

            if (existing.isPresent()) {
                OrganizationModule orgModule = existing.get();
                orgModule.setIsEnabled(false);
                organizationModuleRepository.save(orgModule);
                
                // Update organization's module flag
                updateOrganizationModuleFlag(organization, module.getModuleKey(), false);

                log.info("Organization {} unsubscribed from module {}", organizationUuid, moduleId);
                return ApiResponse.success("Successfully unsubscribed from module", null);
            } else {
                return ApiResponse.error("Organization is not subscribed to this module");
            }

        } catch (Exception e) {
            log.error("Error unsubscribing organization {} from module {}", organizationUuid, moduleId, e);
            return ApiResponse.error("Failed to unsubscribe from module: " + e.getMessage());
        }
    }

    /**
     * Sync organization modules with extended modules based on organization's boolean flags
     * This is called when organization updates module configuration
     */
    @Transactional
    public ApiResponse<String> syncOrganizationModules(String organizationUuid) {
        try {
            log.info("Syncing modules for organization: {}", organizationUuid);

            Organization organization = organizationRepository.findByOrganizationUuid(organizationUuid)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));

            // Get all active extended modules
            List<ExtendedModule> activeModules = extendedModuleRepository.findByIsActiveTrue();

            for (ExtendedModule module : activeModules) {
                String moduleKey = module.getModuleKey();
                boolean shouldBeEnabled = isModuleEnabledInOrganization(organization, moduleKey);

                Optional<OrganizationModule> existingOpt = organizationModuleRepository
                        .findByOrganizationAndExtendedModule(organization, module);

                if (shouldBeEnabled) {
                    if (existingOpt.isPresent()) {
                        // Update existing
                        OrganizationModule existing = existingOpt.get();
                        if (!existing.getIsEnabled()) {
                            existing.setIsEnabled(true);
                            existing.setSubscribedAt(LocalDateTime.now());
                            organizationModuleRepository.save(existing);
                            log.info("Re-enabled module {} for organization {}", moduleKey, organizationUuid);
                        }
                    } else {
                        // Create new subscription
                        OrganizationModule newOrgModule = OrganizationModule.builder()
                                .organization(organization)
                                .extendedModule(module)
                                .isEnabled(true)
                                .subscribedAt(LocalDateTime.now())
                                .build();
                        organizationModuleRepository.save(newOrgModule);
                        log.info("Created new subscription for module {} for organization {}", moduleKey, organizationUuid);
                    }
                } else {
                    if (existingOpt.isPresent()) {
                        // Disable existing
                        OrganizationModule existing = existingOpt.get();
                        if (existing.getIsEnabled()) {
                            existing.setIsEnabled(false);
                            organizationModuleRepository.save(existing);
                            log.info("Disabled module {} for organization {}", moduleKey, organizationUuid);
                        }
                    }
                }
            }

            log.info("Successfully synced modules for organization: {}", organizationUuid);
            return ApiResponse.success("Organization modules synced successfully", null);

        } catch (Exception e) {
            log.error("Error syncing modules for organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to sync organization modules: " + e.getMessage());
        }
    }

    /**
     * Check if module is enabled in organization based on boolean flags
     */
    private boolean isModuleEnabledInOrganization(Organization org, String moduleKey) {
        if (moduleKey == null) return false;

        switch (moduleKey) {
            case "moduleQrAttendanceMarking":
                return Boolean.TRUE.equals(org.getModuleQrAttendanceMarking());
            case "moduleFaceRecognitionAttendanceMarking":
                return Boolean.TRUE.equals(org.getModuleFaceRecognitionAttendanceMarking());
            case "moduleEmployeeFeedback":
                return Boolean.TRUE.equals(org.getModuleEmployeeFeedback());
            case "moduleHiringManagement":
                return Boolean.TRUE.equals(org.getModuleHiringManagement());
            default:
                return false;
        }
    }

    /**
     * Update organization's module boolean flag
     */
    private void updateOrganizationModuleFlag(Organization org, String moduleKey, boolean value) {
        if (moduleKey == null) return;

        switch (moduleKey) {
            case "moduleQrAttendanceMarking":
                org.setModuleQrAttendanceMarking(value);
                break;
            case "moduleFaceRecognitionAttendanceMarking":
                org.setModuleFaceRecognitionAttendanceMarking(value);
                break;
            case "moduleEmployeeFeedback":
                org.setModuleEmployeeFeedback(value);
                break;
            case "moduleHiringManagement":
                org.setModuleHiringManagement(value);
                break;
        }
        organizationRepository.save(org);
    }

    /**
     * Get module subscription count for a module
     */
    public ApiResponse<Long> getModuleSubscriptionCount(Long moduleId) {
        try {
            List<OrganizationModule> subscriptions = organizationModuleRepository
                    .findByExtendedModuleIdAndEnabled(moduleId);

            return ApiResponse.success("Subscription count retrieved", (long) subscriptions.size());

        } catch (Exception e) {
            log.error("Error getting subscription count for module {}", moduleId, e);
            return ApiResponse.error("Failed to get subscription count");
        }
    }
}
