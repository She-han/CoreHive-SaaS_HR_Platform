package com.corehive.backend.service;

import com.corehive.backend.dto.request.ForgotPasswordRequest;
import com.corehive.backend.dto.request.LoginRequest;
import com.corehive.backend.dto.request.ModuleConfigurationRequest;
import com.corehive.backend.dto.request.OrganizationSignupRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.LoginResponse;
import com.corehive.backend.model.*;
import com.corehive.backend.repository.*;
import com.corehive.backend.util.JwtUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.time.LocalDateTime;

/**
 * Authentication Service
 * Contains all authentication related business logic
 */
@Service
@RequiredArgsConstructor // Lombok: Auto generate constructor for final fields
@Slf4j // For logging
public class AuthService {

    // Dependencies injection (Constructor injection - recommended way)
    private final OrganizationRepository organizationRepository;
    private final SystemUserRepository systemUserRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder; // For password hashing 
    private final JwtUtil jwtUtil; // For JWT operations
    private final EmailService emailService;
    private final FileStorageService fileStorageService;
    private final ExtendedModuleRepository extendedModuleRepository;
    private final OrganizationModuleRepository organizationModuleRepository;
    private final BillingPlanRepository billingPlanRepository;
    private final ObjectMapper objectMapper;
    private final SubscriptionRepository subscriptionRepository;

    /**
     * Organization Registration (Company Signup)
     * @param request Registration data from frontend
     * @return Success/Error response with message
     */
    @Transactional
    public ApiResponse<String> signupOrganization(OrganizationSignupRequest request) {
        try {
            log.info("Processing organization signup for: {}", request.getAdminEmail());

            // Check if email already exists
            if (organizationRepository.existsByEmail(request.getAdminEmail())) {
                return ApiResponse.error("Email already registered");
            }

            // Generate organization UUID
            String organizationUuid = UUID.randomUUID().toString();

            // Handle business registration document upload
            String brDocumentPath = null;
            if (request.getBusinessRegistrationDocument() != null &&
                    !request.getBusinessRegistrationDocument().isEmpty()) {

                try {
                    brDocumentPath = fileStorageService.saveBusinessRegistrationDocument(
                            request.getBusinessRegistrationDocument(),
                            organizationUuid
                    );
                    log.info("Business registration document saved: {}", brDocumentPath);
                } catch (Exception e) {
                    log.error("Failed to save business registration document", e);
                    return ApiResponse.error("Failed to upload document: " + e.getMessage());
                }
            }

            // Create Organization
            Organization organization = Organization.builder()
                    .organizationUuid(organizationUuid)
                    .name(request.getOrganizationName())
                    .email(request.getAdminEmail())
                    .businessRegistrationNumber(request.getBusinessRegistrationNumber())
                    .businessRegistrationDocument(brDocumentPath) // NEW FIELD
                    .employeeCountRange(request.getEmployeeCountRange())
                    .status(OrganizationStatus.PENDING_APPROVAL)
                    .billingPlan(request.getSelectedPlanName()) // Store selected plan
                    .billingPricePerUserPerMonth(request.getSelectedPlanPrice() != null ? 
                        java.math.BigDecimal.valueOf(request.getSelectedPlanPrice()) : null)
                    .moduleQrAttendanceMarking(request.getModuleQrAttendanceMarking())
                    .moduleFaceRecognitionAttendanceMarking(request.getModuleFaceRecognitionAttendanceMarking())
                    .moduleEmployeeFeedback(request.getModuleEmployeeFeedback())
                    .moduleHiringManagement(request.getModuleHiringManagement())
                    .modulesConfigured(false)
                    .build();

            organizationRepository.save(organization);

            // Handle extended modules - either from selected billing plan or custom plan
            List<Long> moduleIdsToAssign = new ArrayList<>();
            
            // Priority 1: Check if user selected custom modules (Custom Plan flow)
            if (request.getCustomModules() != null && !request.getCustomModules().isEmpty()) {
                try {
                    log.info("Processing custom modules: {}", request.getCustomModules());
                    
                    // Parse the customModules JSON string to List<Long>
                    moduleIdsToAssign = objectMapper.readValue(
                        request.getCustomModules(), 
                        new TypeReference<List<Long>>(){}
                    );
                    
                    log.info("Parsed custom module IDs: {}", moduleIdsToAssign);
                } catch (Exception e) {
                    log.error("Error parsing custom modules", e);
                }
            }
            // Priority 2: If no custom modules, check if a billing plan was selected
            else if (request.getSelectedPlanId() != null) {
                try {
                    log.info("Fetching modules from billing plan ID: {}", request.getSelectedPlanId());
                    
                    Optional<BillingPlan> planOpt = billingPlanRepository.findById(request.getSelectedPlanId());
                    if (planOpt.isPresent()) {
                        BillingPlan plan = planOpt.get();
                        if (plan.getModuleIds() != null && !plan.getModuleIds().isEmpty()) {
                            moduleIdsToAssign = new ArrayList<>(plan.getModuleIds());
                            log.info("Found {} modules in billing plan '{}': {}", 
                                    moduleIdsToAssign.size(), plan.getName(), moduleIdsToAssign);
                        } else {
                            log.info("Billing plan '{}' has no extended modules", plan.getName());
                        }
                    } else {
                        log.warn("Billing plan with ID {} not found", request.getSelectedPlanId());
                    }
                } catch (Exception e) {
                    log.error("Error fetching billing plan modules", e);
                }
            }
            
            // Assign modules to organization if any were found
            if (!moduleIdsToAssign.isEmpty()) {
                try {
                    log.info("Assigning {} modules to organization {}", moduleIdsToAssign.size(), organization.getName());
                    
                    for (Long moduleId : moduleIdsToAssign) {
                        Optional<ExtendedModule> moduleOpt = extendedModuleRepository.findById(moduleId);
                        
                        if (moduleOpt.isPresent()) {
                            ExtendedModule module = moduleOpt.get();
                            
                            OrganizationModule orgModule = OrganizationModule.builder()
                                    .organization(organization)
                                    .extendedModule(module)
                                    .isEnabled(true)
                                    .subscribedAt(LocalDateTime.now())
                                    .build();
                            
                            organizationModuleRepository.save(orgModule);
                            log.info("Added module '{}' to organization '{}'", module.getName(), organization.getName());
                        } else {
                            log.warn("Module with ID {} not found", moduleId);
                        }
                    }
                    
                    // Mark modules as configured
                    organization.setModulesConfigured(true);
                    organizationRepository.save(organization);
                    log.info("Organization modules configured successfully");
                    
                } catch (Exception e) {
                    log.error("Error assigning modules to organization", e);
                    // Continue with registration even if module assignment fails
                }
            } else {
                log.info("No extended modules to assign for organization {}", organization.getName());
            }

            // Create ORG_ADMIN user
            String tempPassword = generateTemporaryPassword();
            AppUser orgAdmin = AppUser.builder()
                    .organizationUuid(organizationUuid)
                    .email(request.getAdminEmail())
                    .passwordHash(passwordEncoder.encode(tempPassword))
                    .role(AppUserRole.ORG_ADMIN)
                    .isActive(false) // Inactive until sys_admin approval
                    .build();

            appUserRepository.save(orgAdmin);

            // Send email
            emailService.sendOrganizationRegistrationEmail(
                    request.getAdminEmail(),
                    request.getOrganizationName()
            );

            log.info("Organization signup successful: {} (UUID: {})", request.getOrganizationName(), organizationUuid);
            return ApiResponse.success(null, "Organization registered successfully. Please wait for admin approval.");

        } catch (Exception e) {
            log.error("Organization signup failed", e);
            return ApiResponse.error("Registration failed: " + e.getMessage());
        }
    }

    /**
     * Universal Login (For both System Admin and Organization Users)
     * @param request Email + Password
     * @return JWT token with user details or error message
     */

    @Transactional
    public ApiResponse<LoginResponse> login(LoginRequest request) {
        try {
            String email = request.getEmail();
            String password = request.getPassword();

            log.info("Processing login for email: {}", email);

            // Try System Admin login first
            Optional<SystemUser> systemUserOpt = systemUserRepository.findByEmail(email);
            if (systemUserOpt.isPresent()) {
                SystemUser systemUser = systemUserOpt.get();

                if (!passwordEncoder.matches(password, systemUser.getPasswordHash())) {
                    log.warn("Invalid password for system admin: {}", email);
                    return ApiResponse.error("Invalid email or password");
                }

                if (!systemUser.getIsActive()) {
                    return ApiResponse.error("Account is deactivated");
                }

                // Build user details map for JWT
                Map<String, Object> userDetails = new HashMap<>();
                userDetails.put("userId", systemUser.getId());
                userDetails.put("email", email);
                userDetails.put("role", "SYS_ADMIN");

                String token = jwtUtil.generateToken(userDetails, "SYSTEM");

                LoginResponse response = LoginResponse.builder()
                        .token(token)
                        .email(email)
                        .role("SYS_ADMIN")
                        .userType("SYSTEM")
                        .isPasswordChangeRequired(systemUser.getIsPasswordChangeRequired() != null ? systemUser.getIsPasswordChangeRequired() : false)
                        .build();

                log.info("System admin login successful: {}", email);
                return ApiResponse.success(response, "Login successful");
            }

            // Try Organization User login
            Optional<AppUser> appUserOpt = appUserRepository.findByEmail(email);
            if (appUserOpt.isPresent()) {
                AppUser appUser = appUserOpt.get();

                if (!passwordEncoder.matches(password, appUser.getPasswordHash())) {
                    log.warn("Invalid password for app user: {}", email);
                    return ApiResponse.error("Invalid email or password");
                }

                if (!appUser.getIsActive()) {
                    return ApiResponse.error("Account is deactivated");
                }

                // Get organization
                Organization organization = organizationRepository
                        .findByOrganizationUuid(appUser.getOrganizationUuid())
                        .orElseThrow(() -> new RuntimeException("Organization not found"));

                // ⭐ NEW: Check subscription status
                boolean requiresPayment = false;
                boolean hasActiveSubscription = false;

                if (organization.getStatus() == OrganizationStatus.PENDING_APPROVAL) {
                    return ApiResponse.error("Your organization is pending approval");
                }

                // 🚧 TESTING MODE: Payment check temporarily disabled
                // TODO: Re-enable this check after testing payment gateway
                /*
                // Check if organization needs payment setup
                Optional<Subscription> subscriptionOpt = subscriptionRepository
                        .findByOrganizationUuid(organization.getOrganizationUuid());

                if (subscriptionOpt.isEmpty()) {
                    // No subscription exists - require payment
                    requiresPayment = true;
                    log.info("Organization requires payment setup: {}", organization.getOrganizationUuid());
                } else {
                    Subscription subscription = subscriptionOpt.get();
                    hasActiveSubscription = subscription.isActive();

                    if (!hasActiveSubscription) {
                        requiresPayment = true;
                        log.info("Subscription inactive - payment required");
                    }
                }
                */

                // Generate JWT token
                Map<String, Object> userDetails = new HashMap<>();
                userDetails.put("userId", appUser.getId());
                userDetails.put("email", email);
                userDetails.put("role", appUser.getRole().name());
                userDetails.put("organizationUuid", appUser.getOrganizationUuid());

                String token = jwtUtil.generateToken(userDetails, "ORG_USER");

                // Build response
                LoginResponse response = LoginResponse.builder()
                        .token(token)
                        .email(email)
                        .role(appUser.getRole().name())
                        .userType("ORG_USER")
                        .organizationUuid(appUser.getOrganizationUuid())
                        .organizationName(organization.getName())
                        .isPasswordChangeRequired(appUser.getIsPasswordChangeRequired())
                        .modulesConfigured(organization.getModulesConfigured())
                        .requiresPayment(requiresPayment) // ⭐ NEW FIELD
                        .hasActiveSubscription(hasActiveSubscription) // ⭐ NEW FIELD
                        .build();

                log.info("Organization user login successful: {} (Status: {}, Payment Required: {})",
                        email, organization.getStatus(), requiresPayment);

                return ApiResponse.success(response, "Login successful");
            }

            log.warn("No user found with email: {}", email);
            return ApiResponse.error("Invalid email or password");

        } catch (Exception e) {
            log.error("Login error", e);
            return ApiResponse.error("An error occurred during login");
        }
    }

    @Transactional
    public ApiResponse<String> forgotPassword(ForgotPasswordRequest request) {
        try {
            String email = request.getEmail();
            log.info("Processing forgot password request for: {}", email);

            // 1. Find the user (Checking AppUser table)
            Optional<AppUser> userOpt = appUserRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                // Security Note: Usually we shouldn't reveal if email exists, 
                // but for internal HR apps, explicit error is often preferred.
                return ApiResponse.error("User with this email does not exist");
            }

            AppUser user = userOpt.get();

            // 2. Generate new temporary password
            String tempPassword = generateTemporaryPassword(); // Reusing your existing helper method

            // 3. Update User Record
            user.setPasswordHash(passwordEncoder.encode(tempPassword));
            user.setIsPasswordChangeRequired(true); // IMPORTANT: Force password change
            
            appUserRepository.save(user);

            // 4. Send Email
            emailService.sendForgotPasswordEmail(email, tempPassword);

            log.info("Password reset successfully for: {}", email);
            return ApiResponse.success(null, "A temporary password has been sent to your email.");

        } catch (Exception e) {
            log.error("Error during password reset", e);
            return ApiResponse.error("Failed to reset password. Please try again.");
        }
    }

    /**
     * Handle System User Login
     */
    private ApiResponse<LoginResponse> handleSystemUserLogin(SystemUser systemUser, String password) {
        // 1. Verify password
        if (!passwordEncoder.matches(password, systemUser.getPasswordHash())) {
            log.warn("System user login failed - wrong password: {}", systemUser.getEmail());
            return ApiResponse.error("Invalid email or password");
        }

        // 2. Check if user is active
        if (!systemUser.getIsActive()) {
            log.warn("System user login failed - account inactive: {}", systemUser.getEmail());
            return ApiResponse.error("Account is inactive");
        }

        // 3. Generate JWT Token
        Map<String, Object> userDetails = new HashMap<>();
        userDetails.put("userId", systemUser.getId());
        userDetails.put("email", systemUser.getEmail());
        userDetails.put("role", systemUser.getRole());

        String token = jwtUtil.generateToken(userDetails, "SYSTEM_ADMIN");

        // 4. Build response
        LoginResponse response = LoginResponse.builder()
                .token(token)
                .userId(systemUser.getId())
                .email(systemUser.getEmail())
                .userType("SYSTEM")
                .role(systemUser.getRole())
                .organizationUuid(null) // System admin -> no org uuid
                .organizationName(null)
                .modulesConfigured(true) // System admin -> no modules
                .requiresPayment(false)
                .hasActiveSubscription(true)
                .moduleConfig(null)
                .build();

        log.info("System user login successful: {}", systemUser.getEmail());
        return ApiResponse.success(response, "Login successful");
    }


    /**
     * Handle App User (Organization User) Login - FIXED VERSION
     */
    private ApiResponse<LoginResponse> handleAppUserLogin(AppUser appUser, String password) {
        // 1. Verify password
        if (!passwordEncoder.matches(password, appUser.getPasswordHash())) {
            log.warn("App user login failed - wrong password: {}", appUser.getEmail());
            return ApiResponse.error("Invalid email or password");
        }

        // 2. Check if user is active
        if (!appUser.getIsActive()) {
            log.warn("App user login failed - account inactive: {}", appUser.getEmail());
            return ApiResponse.error("Account is inactive. Please contact your administrator.");
        }

        // 3. Organization status check 
        Optional<Organization> organizationOpt = organizationRepository
                .findByOrganizationUuid(appUser.getOrganizationUuid());

        if (organizationOpt.isEmpty()) {
            log.error("Organization not found for user: {}", appUser.getEmail());
            return ApiResponse.error("Organization not found");
        }

        Organization organization = organizationOpt.get();

        // 4. Check if organization is approved
        if (!organization.isActive()) {
            String message;
            if (organization.getStatus() == OrganizationStatus.PENDING_APPROVAL) {
                message = "Your organization registration is still pending approval";
            } else {
                message = "Your organization account is currently " + organization.getStatus().toString().toLowerCase();
            }

            log.warn("App user login failed - org not active: {} (Status: {})",
                    appUser.getEmail(), organization.getStatus());
            return ApiResponse.error(message);
        }

        // 5. Generate JWT Token
        Map<String, Object> userDetails = new HashMap<>();
        userDetails.put("userId", appUser.getId());
        userDetails.put("email", appUser.getEmail());
        userDetails.put("role", appUser.getRole().toString());
        userDetails.put("organizationUuid", appUser.getOrganizationUuid());

        String token = jwtUtil.generateToken(userDetails, "ORG_USER");

        // 6. Build module configuration map
        Map<String, Boolean> moduleConfig = buildModuleConfig(organization);

        // 7. Build response - FIXED: Include all required fields
        LoginResponse response = LoginResponse.builder()
                .token(token)
                .userId(appUser.getId())
                .email(appUser.getEmail())
                .userType("ORG_USER")
                .role(appUser.getRole().toString())
                .organizationUuid(appUser.getOrganizationUuid())
                .organizationName(organization.getName())
                .modulesConfigured(Boolean.TRUE.equals(organization.getModulesConfigured())) // FIXED: Proper boolean check
                .moduleConfig(moduleConfig)
                .isPasswordChangeRequired(Boolean.TRUE.equals(appUser.getIsPasswordChangeRequired()))
                .build();

        log.info("App user login successful: {} (Org: {})", appUser.getEmail(), organization.getName());
        return ApiResponse.success(response, "Login successful");
    }

    @Transactional
    public ApiResponse<String> changePassword(Long userId, String newPassword) {
        try {
            Optional<AppUser> userOpt = appUserRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ApiResponse.error("User not found");
            }

            AppUser user = userOpt.get();

            // Update password
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            user.setIsPasswordChangeRequired(false); // Flag එක false කරනවා

            appUserRepository.save(user);

            return ApiResponse.success(null, "Password changed successfully");
        } catch (Exception e) {
            log.error("Error changing password", e);
            return ApiResponse.error("Failed to change password");
        }
    }

    /**
     * Extract organization UUID from HttpServletRequest attributes
     * @param request HttpServletRequest with organizationUuid attribute set by JWT filter
     * @return organization UUID string
     */
    public String getOrganizationUuidFromRequest(jakarta.servlet.http.HttpServletRequest request) {
        return (String) request.getAttribute("organizationUuid");
    }

    /**
     * Module Configuration (First-time ORG_ADMIN login)
     * @param organizationUuid Current user's organization
     * @param request Module selections
     * @return Success/Error response
     */
    @Transactional
    public ApiResponse<String> configureModules(String organizationUuid, ModuleConfigurationRequest request) {
        try {
            log.info("Configuring modules for organization: {}", organizationUuid);

            // 1. Find organization
            Optional<Organization> organizationOpt = organizationRepository
                    .findByOrganizationUuid(organizationUuid);

            if (organizationOpt.isEmpty()) {
                return ApiResponse.error("Organization not found");
            }

            Organization organization = organizationOpt.get();

            // 2. Check if already configured
            if (organization.getModulesConfigured()) {
                return ApiResponse.error("Modules already configured");
            }

            // 3. Update module selections
            organization.setModuleQrAttendanceMarking(request.getModuleQrAttendanceMarking());
            organization.setModuleFaceRecognitionAttendanceMarking(request.getModuleFaceRecognitionAttendanceMarking());
            organization.setModuleEmployeeFeedback(request.getModuleEmployeeFeedback());
            organization.setModuleHiringManagement(request.getModuleHiringManagement());
            organization.setModulesConfigured(true);

            // 4. Save organization
            organizationRepository.save(organization);

            log.info("Modules configured successfully for organization: {}", organizationUuid);
            return ApiResponse.success(null, "Modules configured successfully");

        } catch (Exception e) {
            log.error("Error configuring modules for organization: {}", organizationUuid, e);
            return ApiResponse.error("Module configuration failed. Please try again.");
        }
    }

    /**
     * Get Current User Info (Token validation + user details)
     * @param token JWT token
     * @return User details or error
     */
    public ApiResponse<LoginResponse> getCurrentUser(String token) {
        try {
            // 1. Validate token
            String email = jwtUtil.extractEmail(token);
            String userType = jwtUtil.extractUserType(token);

            if ("SYSTEM_ADMIN".equals(userType)) {
                return getCurrentSystemUser(email, token);
            } else if ("ORG_USER".equals(userType)) {
                return getCurrentOrgUser(email, token);
            }

            return ApiResponse.error("Invalid token");

        } catch (Exception e) {
            log.error("Error getting current user", e);
            return ApiResponse.error("Invalid token");
        }
    }

    /**
     * Helper method - Build module config map
     */
    private Map<String, Boolean> buildModuleConfig(Organization organization) {
        Map<String, Boolean> moduleConfig = new HashMap<>();

        // Basic modules (always true)
        moduleConfig.put("employeeManagement", true);
        moduleConfig.put("payrollManagement", true);
        moduleConfig.put("leaveManagement", true);
        moduleConfig.put("attendanceManagement", true);
        moduleConfig.put("reportGeneration", true);
        moduleConfig.put("adminActivityTracking", true);
        moduleConfig.put("notificationSystem", true);
        moduleConfig.put("basicDashboard", true);

        // Extended modules (based on organization selection)

        moduleConfig.put("employeeFeedback", organization.getModuleEmployeeFeedback());
        moduleConfig.put("hiringManagement", organization.getModuleHiringManagement());
        moduleConfig.put("qrAttendance", organization.getModuleQrAttendanceMarking());
        moduleConfig.put("faceRecognitionAttendance",organization.getModuleFaceRecognitionAttendanceMarking());

        return moduleConfig;
    }

    /**
     * Helper method - Temporary password generate (Development only)
     */
    private String generateTemporaryPassword() {
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        return tempPassword;
    }

    /**
     * Helper method - Current system user details
     */
    private ApiResponse<LoginResponse> getCurrentSystemUser(String email, String token) {
        Optional<SystemUser> userOpt = systemUserRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ApiResponse.error("User not found");
        }

        SystemUser user = userOpt.get();
        LoginResponse response = LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .userType("SYSTEM")
                .role(user.getRole())
                .organizationUuid(null)
                .organizationName(null)
                .modulesConfigured(true)
                .requiresPayment(false)
                .hasActiveSubscription(true)
                .moduleConfig(null)
                .build();

        return ApiResponse.success(response, "User details retrieved");
    }

    /**
     * Helper method - Current org user details
     */
    private ApiResponse<LoginResponse> getCurrentOrgUser(String email, String token) {
        String orgUuid = jwtUtil.extractOrganizationUuid(token);

        Optional<AppUser> userOpt = appUserRepository.findByOrganizationUuidAndEmail(orgUuid, email);
        if (userOpt.isEmpty()) {
            return ApiResponse.error("User not found");
        }

        AppUser user = userOpt.get();
        Optional<Organization> orgOpt = organizationRepository.findByOrganizationUuid(orgUuid);

        if (orgOpt.isEmpty()) {
            return ApiResponse.error("Organization not found");
        }

        Organization organization = orgOpt.get();
        Map<String, Boolean> moduleConfig = buildModuleConfig(organization);

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .userType("ORG_USER")
                .role(user.getRole().toString())
                .organizationUuid(user.getOrganizationUuid())
                .organizationName(organization.getName())
                .modulesConfigured(organization.getModulesConfigured())
                .moduleConfig(moduleConfig)
                .build();

        return ApiResponse.success(response, "User details retrieved");
    }
}