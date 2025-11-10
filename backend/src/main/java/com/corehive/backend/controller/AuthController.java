package com.corehive.backend.controller;

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
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * සියලු authentication related API endpoints
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
     * Frontend signup form එකෙන් එන data process කරනවා
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<String>> signup(@Valid @RequestBody OrganizationSignupRequest request) {
        log.info("Organization signup request received for: {}", request.getAdminEmail());

        try {
            // Service layer එකට request forward කරනවා
            ApiResponse<String> response = authService.signupOrganization(request);

            // Response status determine කරන්න
            HttpStatus status = response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;

            log.info("Signup response for {}: {}", request.getAdminEmail(),
                    response.isSuccess() ? "SUCCESS" : "FAILED");

            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Unexpected error during signup for: {}", request.getAdminEmail(), e);
            ApiResponse<String> errorResponse = ApiResponse.error("Internal server error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Universal Login Endpoint
     * POST /api/auth/login
     *
     * System Admin සහ Organization Users දෙකටම login support
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request,
                                                            HttpServletRequest httpRequest) {
        log.info("Login request received for: {}", request.getEmail());

        // Client IP address log කරන්න (security සඳහා)
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

    /**
     * Module Configuration Endpoint
     * POST /api/auth/configure-modules
     *
     * First-time ORG_ADMIN login වෙලාවේ modules configure කරන්න
     */
    @PostMapping("/configure-modules")
    public ResponseEntity<ApiResponse<String>> configureModules(
            @Valid @RequestBody ModuleConfigurationRequest request,
            HttpServletRequest httpRequest) {

        // JWT token එකෙන් organization UUID extract කරන්න
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

        // JWT token extract කරන්න
        String authHeader = request.getHeader("Authorization");
        String userEmail = (String) request.getAttribute("userEmail");

        log.debug("Current user info request from: {}", userEmail);

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                ApiResponse<LoginResponse> errorResponse = ApiResponse.error("No valid token provided");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            String token = authHeader.substring(7); // "Bearer " remove කරන්න
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
     * Logout Endpoint (Optional - JWT stateless නිසා server-side logout නෑ)
     * POST /api/auth/logout
     *
     * Client-side token clear කරන්න කියන්න විතරයි
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request) {
        String userEmail = (String) request.getAttribute("userEmail");
        log.info("Logout request from: {}", userEmail);

        // JWT stateless නිසා server එකේ කරන්න දෙයක් නෑ
        // Frontend එකේ token clear කරන්න කියන්න විතරයි
        ApiResponse<String> response = ApiResponse.success("Logout successful. Please clear your token.", null);
        return ResponseEntity.ok(response);
    }

    /**
     * Helper method - Client IP address extract කරන්න
     */
    private String getClientIpAddress(HttpServletRequest request) {
        // Reverse proxy (nginx, cloudflare) පිටිපස්සෙ තියෙනවා නම් real IP extract කරන්න
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