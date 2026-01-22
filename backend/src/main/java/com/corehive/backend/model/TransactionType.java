package com.corehive.backend.model;

/**
 * Payment Transaction Type Enum
 */
public enum TransactionType {
    SUBSCRIPTION("Subscription", "Initial subscription payment"),
    RENEWAL("Renewal", "Subscription renewal payment"),
    UPGRADE("Upgrade", "Plan upgrade payment"),
    REFUND("Refund", "Payment refund");

    private final String displayName;
    private final String description;

    TransactionType(String displayName, String description) {
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
