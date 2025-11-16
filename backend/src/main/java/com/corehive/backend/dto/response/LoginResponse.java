package com.corehive.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Login Response DTO
 * Data returned on successful login
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token; // JWT token
    private Long userId;
    private String email;
    private String userType; // "SYSTEM_ADMIN" or "ORG_USER"
    private String role;     // Specific role (SYS_ADMIN, ORG_ADMIN, HR_STAFF, EMPLOYEE)
    private String organizationUuid; // null for system admin
    private String organizationName;
    private Boolean modulesConfigured; // First-time login check
    private Map<String, Boolean> moduleConfig; // Available modules
}