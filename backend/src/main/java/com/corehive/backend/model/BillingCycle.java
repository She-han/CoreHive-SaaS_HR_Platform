package com.corehive.backend.model;

/**
 * Billing Cycle Enum
 */
public enum BillingCycle {
    MONTHLY("Monthly", "Billed monthly"),
    YEARLY("Yearly", "Billed annually");

    private final String displayName;
    private final String description;

    BillingCycle(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
