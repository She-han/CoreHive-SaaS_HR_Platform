
package com.corehive.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "payment_transaction")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_uuid", unique = true, nullable = false, length = 36)
    private String transactionUuid;

    @Column(name = "organization_uuid", nullable = false, length = 36)
    private String organizationUuid;

    @Column(name = "subscription_id")
    private Long subscriptionId;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", length = 10)
    private String currency = "LKR";

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private TransactionType transactionType;

    @Column(name = "payment_gateway", nullable = false, length = 50)
    private String paymentGateway;

    @Column(name = "gateway_transaction_id", length = 255)
    private String gatewayTransactionId;

    @Column(name = "gateway_order_id", length = 255)
    private String gatewayOrderId;

    @Column(name = "gateway_status", length = 50)
    private String gatewayStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "card_last_four", length = 4)
    private String cardLastFour;

    @Column(name = "billing_email", length = 255)
    private String billingEmail;

    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "transaction_date", nullable = false, updatable = false)
    private LocalDateTime transactionDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_uuid", referencedColumnName = "organization_uuid",
            insertable = false, updatable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", insertable = false, updatable = false)
    private Subscription subscription;
}

// Enums
enum TransactionType {
    SUBSCRIPTION, RENEWAL, UPGRADE, REFUND
}

enum PaymentStatus {
    PENDING, SUCCESS, FAILED, REFUNDED
}