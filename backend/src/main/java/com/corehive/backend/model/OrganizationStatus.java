package com.corehive.backend.model;

/**
 * Organization Status Enum
 * Status of Organizations
 */
public enum OrganizationStatus {
    PENDING_APPROVAL("Pending Approval", "Registration submitted, waiting for admin approval"),
    APPROVED_PENDING_PAYMENT("Approved - Pending Payment", "Approved by admin, waiting for payment confirmation"),
    ACTIVE("Active", "Organization is active and operational"),
    TRIAL("Trial Period", "Organization in free trial period"),
    DORMANT("Dormant", "Temporarily inactive due to payment or other issues"),
    SUSPENDED("Suspended", "Suspended by system administrator");

    private final String displayName;
    private final String description;

    OrganizationStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    // Check if status allows login
    public boolean allowsLogin() {
        return this == ACTIVE || this == TRIAL;
    }

    // Check if status can be changed to target status
    public boolean canChangeTo(OrganizationStatus targetStatus) {
        switch (this) {
            case PENDING_APPROVAL:
                return targetStatus == ACTIVE || targetStatus == SUSPENDED;
            case ACTIVE:
                return targetStatus == DORMANT || targetStatus == SUSPENDED;
            case DORMANT:
                return targetStatus == ACTIVE || targetStatus == SUSPENDED;
            case SUSPENDED:
                return targetStatus == ACTIVE;
            default:
                return false;
        }
    }
}