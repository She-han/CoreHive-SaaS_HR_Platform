package com.corehive.backend.service;

import com.corehive.backend.dto.request.ForgotPasswordRequest;
import com.corehive.backend.dto.request.LoginRequest;
import com.corehive.backend.dto.request.ModuleConfigurationRequest;
import com.corehive.backend.dto.request.OrganizationSignupRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.LoginResponse;
import com.corehive.backend.model.*;
import com.corehive.backend.repository.AppUserRepository;
import com.corehive.backend.repository.OrganizationRepository;
import com.corehive.backend.repository.SystemUserRepository;
import com.corehive.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

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

    /**
     * Organization Registration (Company Signup)
     * @param request Registration data from frontend
     * @return Success/Error response with message
     */
    @Transactional // Transaction wrapper for database consistency
    public ApiResponse<String> signupOrganization(OrganizationSignupRequest request) {
        try {
            log.info("Processing organization signup for email: {}", request.getAdminEmail());

            // 1. Validation - Does email already exist?
            if (organizationRepository.existsByEmail(request.getAdminEmail())) {
                return ApiResponse.error("Email address already registered");
            }

            // 2. Is Business Registration Number duplicate?
            if (organizationRepository.existsByBusinessRegistrationNumber(request.getBusinessRegistrationNumber())) {
                return ApiResponse.error("Business registration number already exists");
            }

            // 3. Create Organization Entity
            Organization organization = Organization.builder()
                    .name(request.getOrganizationName())
                    .email(request.getAdminEmail())
                    .businessRegistrationNumber(request.getBusinessRegistrationNumber())
                    .employeeCountRange(request.getEmployeeCountRange())
                    .status(OrganizationStatus.PENDING_APPROVAL) // Initial status
                    .moduleQrAttendanceMarking(request.getModuleQrAttendanceMarking())
                    .moduleFaceRecognitionAttendanceMarking(request.getModuleFaceRecognitionAttendanceMarking())
                    .moduleEmployeeFeedback(request.getModuleEmployeeFeedback())
                    .moduleHiringManagement(request.getModuleHiringManagement())
                    .modulesConfigured(false) // Will be configured during first time login
                    .build();

            // 4. Save Organization
            Organization savedOrganization = organizationRepository.save(organization);
            log.info("Organization saved with UUID: {}", savedOrganization.getOrganizationUuid());

            // 5. Create Default ORG_ADMIN User
            String temporaryPassword = generateTemporaryPassword(); // Simple password for development

            AppUser adminUser = AppUser.builder()
                    .organizationUuid(savedOrganization.getOrganizationUuid())
                    .email(request.getAdminEmail())
                    .passwordHash(passwordEncoder.encode(temporaryPassword)) // Hash password
                    .role(AppUserRole.ORG_ADMIN)
                    .isActive(false) // Inactive until organization is approved
                    .build();

            adminUser.setIsPasswordChangeRequired(true);

            appUserRepository.save(adminUser);
            log.info("Admin user created for organization: {}", savedOrganization.getName());

            // 6. Return success response with temporary password (development only)
            String message = String.format(
                    "Organization registration successful! " +
                            "Your request is pending approval. " +

                            "(You can login after admin approval)"
            );

            return ApiResponse.success(message, savedOrganization.getOrganizationUuid());

        } catch (Exception e) {
            log.error("Error during organization signup", e);
            return ApiResponse.error("Registration failed. Please try again.");
        }
    }

    /**
     * Universal Login (For both System Admin and Organization Users)
     * @param request Email + Password
     * @return JWT token with user details or error message
     */
    public ApiResponse<LoginResponse> login(LoginRequest request) {
        try {
            log.info("Login attempt for email: {}", request.getEmail());

            // 1. Check if this is a System User (Platform Admin)
            Optional<SystemUser> systemUser = systemUserRepository.findByEmail(request.getEmail());

            if (systemUser.isPresent()) {
                return handleSystemUserLogin(systemUser.get(), request.getPassword());
            }

            // 2. Check if this is an App User (Organization User)
            Optional<AppUser> appUser = appUserRepository.findByEmail(request.getEmail());

            if (appUser.isPresent()) {
                return handleAppUserLogin(appUser.get(), request.getPassword());
            }

            // 3. User not found
            log.warn("Login failed - user not found: {}", request.getEmail());
            return ApiResponse.error("Invalid email or password");

        } catch (Exception e) {
            log.error("Error during login for email: {}", request.getEmail(), e);
            return ApiResponse.error("Login failed. Please try again.");
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
            return ApiResponse.success("A temporary password has been sent to your email.", null);

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
                .userType("SYSTEM_ADMIN")
                .role(systemUser.getRole())
                .organizationUuid(null) // System admin -> no org uuid
                .organizationName(null)
                .modulesConfigured(true) // System admin -> no modules

                .moduleConfig(null)
                .build();

        log.info("System user login successful: {}", systemUser.getEmail());
        return ApiResponse.success("Login successful", response);
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
        return ApiResponse.success("Login successful", response);
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

            return ApiResponse.success("Password changed successfully", null);
        } catch (Exception e) {
            log.error("Error changing password", e);
            return ApiResponse.error("Failed to change password");
        }
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
            return ApiResponse.success("Modules configured successfully", null);

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
                .userType("SYSTEM_ADMIN")
                .role(user.getRole())
                .organizationUuid(null)
                .organizationName(null)
                .modulesConfigured(true)
                .moduleConfig(null)
                .build();

        return ApiResponse.success("User details retrieved", response);
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

        return ApiResponse.success("User details retrieved", response);
    }
}