// File: backend/src/main/java/com/corehive/backend/model/Subscription.java

package com.corehive.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subscription_uuid", unique = true, nullable = false, length = 36)
    private String subscriptionUuid;

    @Column(name = "organization_uuid", nullable = false, length = 36)
    private String organizationUuid;

    @Column(name = "plan_name", nullable = false, length = 100)
    private String planName;

    @Column(name = "plan_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal planPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", length = 20)
    private BillingCycle billingCycle = BillingCycle.MONTHLY;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SubscriptionStatus status = SubscriptionStatus.TRIAL;

    @Column(name = "trial_start_date", nullable = false)
    private LocalDateTime trialStartDate;

    @Column(name = "trial_end_date", nullable = false)
    private LocalDateTime trialEndDate;

    @Column(name = "is_trial")
    private Boolean isTrial = true;

    @Column(name = "next_billing_date")
    private LocalDateTime nextBillingDate;

    @Column(name = "last_payment_date")
    private LocalDateTime lastPaymentDate;

    @Column(name = "last_payment_amount", precision = 10, scale = 2)
    private BigDecimal lastPaymentAmount;

    @Column(name = "payment_method_id", length = 255)
    private String paymentMethodId;

    @Column(name = "payment_gateway", length = 50)
    private String paymentGateway = "PAYHERE";

    @Column(name = "active_user_count")
    private Integer activeUserCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_uuid", referencedColumnName = "organization_uuid",
            insertable = false, updatable = false)
    private Organization organization;

    // Business methods
    public boolean isActive() {
        return status == SubscriptionStatus.ACTIVE || status == SubscriptionStatus.TRIAL;
    }

    public boolean isInTrial() {
        return isTrial && LocalDateTime.now().isBefore(trialEndDate);
    }

    public boolean isTrialExpired() {
        return isTrial && LocalDateTime.now().isAfter(trialEndDate);
    }

    public BigDecimal calculateMonthlyBilling() {
        return planPrice.multiply(BigDecimal.valueOf(activeUserCount));
    }
}

// Enums
enum BillingCycle {
    MONTHLY, YEARLY
}

enum SubscriptionStatus {
    TRIAL, ACTIVE, PAST_DUE, CANCELED, SUSPENDED
}