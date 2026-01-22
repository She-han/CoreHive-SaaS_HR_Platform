package com.corehive.backend.model;

/**
 * Subscription Status Enum
 */
public enum SubscriptionStatus {
    TRIAL("Trial", "Organization in free trial period"),
    ACTIVE("Active", "Subscription is active and paid"),
    PAST_DUE("Past Due", "Payment is overdue"),
    CANCELED("Canceled", "Subscription has been canceled"),
    SUSPENDED("Suspended", "Subscription is suspended");

    private final String displayName;
    private final String description;

    SubscriptionStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return this == TRIAL || this == ACTIVE;
    }
}
