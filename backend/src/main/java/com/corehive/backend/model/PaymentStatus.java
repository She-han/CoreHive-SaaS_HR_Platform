package com.corehive.backend.model;

/**
 * Payment Transaction Status Enum
 */
public enum PaymentStatus {
    PENDING("Pending", "Payment is pending"),
    SUCCESS("Success", "Payment completed successfully"),
    FAILED("Failed", "Payment failed"),
    REFUNDED("Refunded", "Payment has been refunded");

    private final String displayName;
    private final String description;

    PaymentStatus(String displayName, String description) {
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
