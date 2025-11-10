package com.corehive.backend.model;

/**
 * App User Role Enum
 * Organization level user roles
 */
public enum AppUserRole {
    ORG_ADMIN("Organization Administrator", "Full administrative access to organization"),
    HR_STAFF("HR Staff", "HR operations and employee management"),
    EMPLOYEE("Employee", "Self-service access only");

    private final String displayName;
    private final String description;

    AppUserRole(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    // Check if role can access payroll
    public boolean canAccessPayroll() {
        return this == ORG_ADMIN;
    }

    // Check if role can manage users
    public boolean canManageUsers() {
        return this == ORG_ADMIN;
    }

    // Check if role can access HR operations
    public boolean canAccessHR() {
        return this == ORG_ADMIN || this == HR_STAFF;
    }

    // Get Spring Security role name
    public String getSecurityRole() {
        return "ROLE_" + this.name();
    }
}