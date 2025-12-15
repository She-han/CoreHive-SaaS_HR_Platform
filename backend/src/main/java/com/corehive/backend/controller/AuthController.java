package com.corehive.backend.controller;

import com.corehive.backend.dto.request.ChangePasswordRequest;
import com.corehive.backend.dto.request.ForgotPasswordRequest;
import com.corehive.backend.dto.request.LoginRequest;
import com.corehive.backend.dto.request.ModuleConfigurationRequest;
import com.corehive.backend.dto.request.OrganizationSignupRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.LoginResponse;
import com.corehive.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * All authentication related API endpoints
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000") // React development server
public class AuthController {

    private final AuthService authService;

    /**
     * Organization Registration Endpoint
     * POST /api/auth/signup
     *
     * Process data from frontend signup form
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<String>> signup(
            @Valid @ModelAttribute OrganizationSignupRequest request) { // Changed from @RequestBody to @ModelAttribute

        log.info("Organization signup request received for: {}", request.getAdminEmail());

        try {
            // Validate business registration document if provided
            if (request.getBusinessRegistrationDocument() != null &&
                    !request.getBusinessRegistrationDocument().isEmpty()) {
                log.info("Business registration document received: {} ({} bytes)",
                        request.getBusinessRegistrationDocument().getOriginalFilename(),
                        request.getBusinessRegistrationDocument().getSize());
            }

            ApiResponse<String> response = authService.signupOrganization(request);

            if (response.isSuccess()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            log.error("Organization signup error", e);
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Registration failed: " + e.getMessage())
            );
        }
    }

    /**
     * Universal Login Endpoint
     * POST /api/auth/login
     *
     * Login support for both System Admin and Organization Users
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request,
                                                            HttpServletRequest httpRequest) {
        log.info("Login request received for: {}", request.getEmail());

        // Log client IP address (for security)
        String clientIp = getClientIpAddress(httpRequest);
        log.debug("Login attempt from IP: {}", clientIp);

        try {
            ApiResponse<LoginResponse> response = authService.login(request);

            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED;

            if (response.isSuccess()) {
                log.info("Login successful for: {} (Type: {})",
                        request.getEmail(), response.getData().getUserType());
            } else {
                log.warn("Login failed for: {} - {}", request.getEmail(), response.getMessage());
            }

            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Unexpected error during login for: {}", request.getEmail(), e);
            ApiResponse<LoginResponse> errorResponse = ApiResponse.error("Internal server error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Note: You need to extract userId from token or pass it in request
        // For simplicity assuming request has userId or logic handles it.

        return ResponseEntity.ok(authService.changePassword(request.getUserId(), request.getNewPassword()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    /**
     * Module Configuration Endpoint
     * POST /api/auth/configure-modules
     *
     * Configure modules during first-time ORG_ADMIN login
     */
    @PostMapping("/configure-modules")
    public ResponseEntity<ApiResponse<String>> configureModules(
            @Valid @RequestBody ModuleConfigurationRequest request,
            HttpServletRequest httpRequest) {

        // Extract organization UUID from JWT token
        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        String userEmail = (String) httpRequest.getAttribute("userEmail");
        String userRole = (String) httpRequest.getAttribute("userRole");

        log.info("Module configuration request from: {} (Org: {}, Role: {})",
                userEmail, organizationUuid, userRole);

        try {
            // Only ORG_ADMIN can configure modules
            if (!"ORG_ADMIN".equals(userRole)) {
                log.warn("Unauthorized module configuration attempt by: {} (Role: {})", userEmail, userRole);
                ApiResponse<String> errorResponse = ApiResponse.error("Only organization admin can configure modules");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            if (organizationUuid == null) {
                log.error("Organization UUID not found in request for user: {}", userEmail);
                ApiResponse<String> errorResponse = ApiResponse.error("Organization information not found");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            ApiResponse<String> response = authService.configureModules(organizationUuid, request);

            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;

            log.info("Module configuration for org {} by {}: {}",
                    organizationUuid, userEmail, response.isSuccess() ? "SUCCESS" : "FAILED");

            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Unexpected error during module configuration for org: {} by user: {}",
                    organizationUuid, userEmail, e);
            ApiResponse<String> errorResponse = ApiResponse.error("Internal server error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get Current User Info Endpoint
     * GET /api/auth/me
     *
     * Token validation + current user details return කරනවා
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse>> getCurrentUser(HttpServletRequest request) {

        // Extract JWT token
        String authHeader = request.getHeader("Authorization");
        String userEmail = (String) request.getAttribute("userEmail");

        log.debug("Current user info request from: {}", userEmail);

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                ApiResponse<LoginResponse> errorResponse = ApiResponse.error("No valid token provided");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            String token = authHeader.substring(7); // Remove "Bearer "
            ApiResponse<LoginResponse> response = authService.getCurrentUser(token);

            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED;

            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error getting current user info for: {}", userEmail, e);
            ApiResponse<LoginResponse> errorResponse = ApiResponse.error("Failed to get user information");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Logout Endpoint (Optional - No server-side logout needed for JWT stateless)
     * POST /api/auth/logout
     *
     * Just tell client to clear token
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request) {
        String userEmail = (String) request.getAttribute("userEmail");
        log.info("Logout request from: {}", userEmail);

        // No server-side action needed for JWT stateless
        // Just tell frontend to clear token
        ApiResponse<String> response = ApiResponse.success("Logout successful. Please clear your token.", null);
        return ResponseEntity.ok(response);
    }

    /**
     * Helper method - Extract client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        // Extract real IP if behind reverse proxy (nginx, cloudflare)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}