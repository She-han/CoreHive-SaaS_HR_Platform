
package com.corehive.backend.service;

import com.corehive.backend.config.PayHereConfig;
import com.corehive.backend.dto.request.InitiatePaymentRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.PaymentInitResponse;
import com.corehive.backend.model.*;
import com.corehive.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PayHereConfig payHereConfig;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrganizationRepository organizationRepository;
    private final AppUserRepository appUserRepository;

    /**
     * Process subscriptions that reached next billing date.
     * This creates a renewal transaction and marks subscription as PAST_DUE
     * until the renewal payment is confirmed by the gateway webhook.
     */
    @Scheduled(cron = "0 */30 * * * *")
    @Transactional
    public void processDueSubscriptionRenewals() {
        LocalDateTime now = LocalDateTime.now();
        List<SubscriptionStatus> dueStatuses = Arrays.asList(SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL, SubscriptionStatus.PAST_DUE);

        List<Subscription> dueSubscriptions = subscriptionRepository
                .findByStatusInAndNextBillingDateLessThanEqual(dueStatuses, now);

        if (dueSubscriptions.isEmpty()) {
            return;
        }

        log.info("Processing {} due subscriptions at {}", dueSubscriptions.size(), now);

        for (Subscription subscription : dueSubscriptions) {
            try {
                if (subscription.getStatus() == SubscriptionStatus.CANCELED
                        || subscription.getStatus() == SubscriptionStatus.SUSPENDED) {
                    continue;
                }

                if (paymentTransactionRepository.existsBySubscriptionIdAndTransactionTypeAndStatus(
                        subscription.getId(), TransactionType.RENEWAL, PaymentStatus.PENDING)) {
                    log.debug("Skipping subscription {} - pending renewal transaction already exists", subscription.getId());
                    continue;
                }

                Organization organization = organizationRepository
                        .findByOrganizationUuid(subscription.getOrganizationUuid())
                        .orElse(null);

                if (organization == null) {
                    log.warn("Skipping renewal for subscription {} - organization not found", subscription.getId());
                    continue;
                }

                BigDecimal renewalAmount = calculateRenewalAmount(subscription, organization);
                String renewalOrderId = "RNL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

                PaymentTransaction renewalTransaction = PaymentTransaction.builder()
                        .transactionUuid(UUID.randomUUID().toString())
                        .organizationUuid(subscription.getOrganizationUuid())
                        .subscriptionId(subscription.getId())
                        .amount(renewalAmount)
                        .currency(payHereConfig.getCurrency())
                        .transactionType(TransactionType.RENEWAL)
                        .paymentGateway("PAYHERE")
                        .gatewayOrderId(renewalOrderId)
                        .status(PaymentStatus.PENDING)
                        .billingEmail(organization.getEmail())
                        .metadata("Auto renewal triggered by due-date scheduler")
                        .build();

                // Gateway recurring charge trigger integration can be added here.
                if (subscription.getPayhereSubscriptionId() == null || subscription.getPayhereSubscriptionId().isBlank()) {
                    renewalTransaction.setStatus(PaymentStatus.FAILED);
                    renewalTransaction.setErrorMessage("No PayHere subscription token available for recurring charge");
                }

                paymentTransactionRepository.save(renewalTransaction);

                subscription.setStatus(SubscriptionStatus.PAST_DUE);
                subscription.setUpdatedAt(now);
                subscriptionRepository.save(subscription);

                log.info("Renewal transaction created for subscription {} with order {} and amount {}",
                        subscription.getId(), renewalOrderId, renewalAmount);

            } catch (Exception ex) {
                log.error("Failed to process due renewal for subscription {}", subscription.getId(), ex);
            }
        }
    }

    private BigDecimal calculateRenewalAmount(Subscription subscription, Organization organization) {
        BigDecimal perUserPrice = organization.getBillingPricePerUserPerMonth() != null
                ? organization.getBillingPricePerUserPerMonth()
                : subscription.getPlanPrice();

        if (perUserPrice == null) {
            perUserPrice = BigDecimal.valueOf(500);
        }

        long activeUsers = Math.max(1L,
                appUserRepository.countByOrganizationUuidAndIsActiveTrue(subscription.getOrganizationUuid()));

        subscription.setActiveUserCount((int) activeUsers);
        return perUserPrice.multiply(BigDecimal.valueOf(activeUsers)).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Initiate payment for subscription
     * Note: Not using @Transactional here to allow partial commits
     */
    public ApiResponse<PaymentInitResponse> initiateSubscriptionPayment(
            String organizationUuid, String userEmail) {

        try {
            log.info("Initiating payment for organization: {}", organizationUuid);

            // Get organization
            Organization organization = organizationRepository
                    .findByOrganizationUuid(organizationUuid)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));

            // Check if already has active subscription
            Subscription existingSubscription = subscriptionRepository
                    .findByOrganizationUuid(organizationUuid)
                    .orElse(null);

            if (existingSubscription != null) {
                log.info("Using existing subscription for organization: {}", organizationUuid);
                // Use existing subscription instead of creating new one
                return buildPaymentResponse(existingSubscription, organization, userEmail);
            }

            // Create new subscription (Trial mode)
            Subscription subscription = createTrialSubscription(organization);
            
            // Return payment response
            return buildPaymentResponse(subscription, organization, userEmail);

        } catch (Exception e) {
            log.error("Error initiating payment", e);
            return ApiResponse.error("Failed to initiate payment: " + e.getMessage());
        }
    }

    /**
     * Create trial subscription
     * IMPORTANT: Only creates if one doesn't exist for the organization
     */
    private Subscription createTrialSubscription(Organization organization) {
        try {
            // 🔒 Check if subscription already exists (prevent duplicates)
            Subscription existing = subscriptionRepository
                    .findByOrganizationUuid(organization.getOrganizationUuid())
                    .orElse(null);
            
            if (existing != null) {
                log.info("Subscription already exists for organization: {}, returning existing", 
                        organization.getOrganizationUuid());
                return existing;
            }

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime trialEnd = now.plusMonths(1);

            log.info("Creating NEW trial subscription for organization: {}", organization.getOrganizationUuid());

            // Handle nullable billing plan and price
            String planName = organization.getBillingPlan() != null 
                ? organization.getBillingPlan() 
                : "Standard Plan";
            
            BigDecimal planPrice = organization.getBillingPricePerUserPerMonth() != null
                ? organization.getBillingPricePerUserPerMonth()
                : BigDecimal.valueOf(500); // Default LKR 500 per user

            Subscription subscription = Subscription.builder()
                    .subscriptionUuid(UUID.randomUUID().toString())
                    .organizationUuid(organization.getOrganizationUuid())
                    .planName(planName)
                    .planPrice(planPrice)
                    .billingCycle(BillingCycle.MONTHLY)
                    .status(SubscriptionStatus.TRIAL)
                    .trialStartDate(now)
                    .trialEndDate(trialEnd)
                    .isTrial(true)
                    .nextBillingDate(trialEnd)
                    .activeUserCount(1) // Initial admin user
                    .build();

            Subscription saved = subscriptionRepository.save(subscription);
            log.info("Trial subscription created successfully with ID: {}", saved.getId());
            return saved;

        } catch (Exception e) {
            log.error("Failed to create trial subscription for organization: {}", 
                    organization.getOrganizationUuid(), e);
            throw new RuntimeException("Failed to create trial subscription: " + e.getMessage(), e);
        }
    }

    /**
     * Build PayHere payment data
     */
    private Map<String, String> buildPayHerePaymentData(
            String orderId, BigDecimal amount, Organization organization,
            String email, String transactionUuid, Subscription subscription) {

        Map<String, String> data = new HashMap<>();
        data.put("merchant_id", payHereConfig.getMerchantId());
        data.put("return_url", payHereConfig.getReturnUrl());
        data.put("cancel_url", payHereConfig.getCancelUrl());
        data.put("notify_url", payHereConfig.getNotifyUrl());

        data.put("order_id", orderId);
        data.put("items", "CoreHive HR - " + subscription.getPlanName() + " Plan (Trial)");
        data.put("currency", payHereConfig.getCurrency());
        // Format amount with 2 decimal places as required by PayHere
        data.put("amount", String.format("%.2f", amount));

        // Customer details
        data.put("first_name", organization.getName());
        data.put("last_name", "");
        data.put("email", email);
        data.put("phone", "");
        data.put("address", "");
        data.put("city", "");
        data.put("country", "Sri Lanka");

        // Custom fields
        data.put("custom_1", organization.getOrganizationUuid());
        data.put("custom_2", transactionUuid);

        // 🔄 Enable recurring payments (Monthly subscription)
        // Documentation: https://support.payhere.lk/api-&-mobile-sdk/recurring-api
        data.put("recurrence", "1 Month"); // Charge every month
        data.put("duration", "Forever");   // Continue until cancelled

        return data;
    }

    /**
     * Generate PayHere MD5 hash
     * Formula: uppercase(md5(merchant_id + order_id + amount + currency + uppercase(md5(merchant_secret))))
     */
    private String generatePayHereHash(Map<String, String> data) {
        try {
            String merchantId = data.get("merchant_id");
            String orderId = data.get("order_id");
            String amount = data.get("amount");
            String currency = data.get("currency");
            String merchantSecret = payHereConfig.getMerchantSecret();

            // First: Hash merchant secret and convert to uppercase
            String merchantSecretHash = getMd5Hash(merchantSecret).toUpperCase();
            
            // Second: Concatenate and hash again
            String hashString = merchantId + orderId + amount + currency + merchantSecretHash;
            String finalHash = getMd5Hash(hashString).toUpperCase();
            
            log.debug("Hash generation - Merchant ID: {}, Order ID: {}, Amount: {}, Currency: {}", 
                    merchantId, orderId, amount, currency);
            log.debug("Generated hash: {}", finalHash);

            return finalHash;

        } catch (Exception e) {
            log.error("Error generating PayHere hash", e);
            throw new RuntimeException("Hash generation failed");
        }
    }

    /**
     * MD5 Hash utility
     */
    private String getMd5Hash(String input) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] array = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : array) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("MD5 hashing failed", e);
        }
    }

    /**
     * Handle PayHere payment notification (Webhook)
     */
    @Transactional
    public ApiResponse<String> handlePaymentNotification(Map<String, String> params) {
        try {
            log.info("Received PayHere notification: {}", params);

            String orderId = params.get("order_id");
            String paymentId = params.get("payment_id");
            String statusCode = params.get("status_code");
            String mdHash = params.get("md5sig");

            // Verify hash
            if (!verifyPayHereHash(params, mdHash)) {
                log.error("Invalid PayHere hash for order: {}", orderId);
                return ApiResponse.error("Invalid hash");
            }

            // Find transaction
            PaymentTransaction transaction = paymentTransactionRepository
                    .findByGatewayOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Transaction not found"));

            // Update transaction
            transaction.setGatewayTransactionId(paymentId);
            transaction.setGatewayStatus(statusCode);
            transaction.setCompletedAt(LocalDateTime.now());

            // Status code 2 = Success
            if ("2".equals(statusCode)) {
                transaction.setStatus(PaymentStatus.SUCCESS);

                // Activate subscription
                Subscription subscription = subscriptionRepository
                        .findById(transaction.getSubscriptionId())
                        .orElseThrow(() -> new RuntimeException("Subscription not found"));

                subscription.setStatus(SubscriptionStatus.ACTIVE);
                subscription.setIsTrial(false);
                subscription.setLastPaymentDate(LocalDateTime.now());
                subscription.setLastPaymentAmount(transaction.getAmount());
                subscription.setNextBillingDate(LocalDateTime.now().plusMonths(1));
                subscription.setActiveUserCount((int) Math.max(
                    1L,
                    appUserRepository.countByOrganizationUuidAndIsActiveTrue(subscription.getOrganizationUuid())
                ));
                
                // 🔄 Store PayHere subscription ID for recurring payments
                String payhereSubscriptionId = params.get("subscription_id");
                if (payhereSubscriptionId != null && !payhereSubscriptionId.isEmpty()) {
                    subscription.setPayhereSubscriptionId(payhereSubscriptionId);
                    log.info("PayHere subscription ID captured: {} for subscription: {}", 
                            payhereSubscriptionId, subscription.getId());
                }
                
                subscriptionRepository.save(subscription);

                // Update organization status to ACTIVE
                Organization organization = organizationRepository
                        .findByOrganizationUuid(transaction.getOrganizationUuid())
                        .orElseThrow(() -> new RuntimeException("Organization not found"));

                organization.setStatus(OrganizationStatus.ACTIVE);
                organization.setUpdatedAt(LocalDateTime.now());
                organizationRepository.save(organization);

                log.info("Payment successful for order: {}", orderId);
            } else {
                transaction.setStatus(PaymentStatus.FAILED);
                transaction.setErrorMessage("Payment failed with status code: " + statusCode);

                Subscription subscription = subscriptionRepository
                        .findById(transaction.getSubscriptionId())
                        .orElse(null);

                if (subscription != null) {
                    subscription.setStatus(SubscriptionStatus.PAST_DUE);
                    subscription.setUpdatedAt(LocalDateTime.now());
                    subscriptionRepository.save(subscription);
                }

                log.warn("Payment failed for order: {}", orderId);
            }

            paymentTransactionRepository.save(transaction);
            return ApiResponse.success("Payment notification processed");

        } catch (Exception e) {
            log.error("Error processing payment notification", e);
            return ApiResponse.error("Failed to process notification");
        }
    }

    /**
     * Manually mark payment success (used after redirect if webhook not received)
     */
    @Transactional
    public ApiResponse<String> markPaymentSuccess(String organizationUuid, String orderId) {
        try {
            Organization organization = organizationRepository
                    .findByOrganizationUuid(organizationUuid)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));

            Subscription subscription = subscriptionRepository
                    .findByOrganizationUuid(organizationUuid)
                    .orElse(null);

            if (subscription == null) {
                // create active subscription with current plan
                LocalDateTime now = LocalDateTime.now();
                subscription = Subscription.builder()
                        .subscriptionUuid(UUID.randomUUID().toString())
                        .organizationUuid(organizationUuid)
                        .planName(organization.getBillingPlan() != null ? organization.getBillingPlan() : "Standard Plan")
                        .planPrice(organization.getBillingPricePerUserPerMonth() != null ? organization.getBillingPricePerUserPerMonth() : BigDecimal.valueOf(500))
                        .billingCycle(BillingCycle.MONTHLY)
                        .status(SubscriptionStatus.ACTIVE)
                        .isTrial(true)
                        .trialStartDate(now)
                        .trialEndDate(now.plusMonths(1))
                        .nextBillingDate(now.plusMonths(1))
                        .activeUserCount(1)
                        .lastPaymentDate(now)
                        .lastPaymentAmount(organization.getBillingPricePerUserPerMonth())
                        .paymentGateway("PAYHERE")
                        .createdAt(now)
                        .updatedAt(now)
                        .build();
            } else {
                subscription.setStatus(SubscriptionStatus.ACTIVE);
                subscription.setUpdatedAt(LocalDateTime.now());
                subscription.setLastPaymentDate(LocalDateTime.now());
                if (subscription.getPlanPrice() == null && organization.getBillingPricePerUserPerMonth() != null) {
                    subscription.setPlanPrice(organization.getBillingPricePerUserPerMonth());
                }
                subscription.setLastPaymentAmount(subscription.getPlanPrice());
                subscription.setNextBillingDate(LocalDateTime.now().plusMonths(1));
            }

            subscriptionRepository.save(subscription);

            organization.setStatus(OrganizationStatus.ACTIVE);
            organization.setUpdatedAt(LocalDateTime.now());
            organizationRepository.save(organization);

            log.info("Payment marked successful for org {} (orderId: {})", organizationUuid, orderId);
            return ApiResponse.success("Payment status updated to ACTIVE");
        } catch (Exception e) {
            log.error("Error marking payment success for org {}", organizationUuid, e);
            return ApiResponse.error("Failed to mark payment success: " + e.getMessage());
        }
    }

    /**
     * Verify PayHere notification hash
     */
    private boolean verifyPayHereHash(Map<String, String> params, String receivedHash) {
        try {
            String merchantId = params.get("merchant_id");
            String orderId = params.get("order_id");
            String paymentId = params.get("payment_id");
            String amount = params.get("payhere_amount");
            String currency = params.get("payhere_currency");
            String statusCode = params.get("status_code");
            String merchantSecret = payHereConfig.getMerchantSecret();

            String hashString = merchantId + orderId + amount + currency +
                    statusCode + getMd5Hash(merchantSecret);

            String calculatedHash = getMd5Hash(hashString).toUpperCase();

            return calculatedHash.equals(receivedHash.toUpperCase());

        } catch (Exception e) {
            log.error("Error verifying hash", e);
            return false;
        }
    }

    /**
     * Get subscription status
     */
    public ApiResponse<Map<String, Object>> getSubscriptionStatus(String organizationUuid) {
        try {
            Subscription subscription = subscriptionRepository
                    .findByOrganizationUuid(organizationUuid)
                    .orElse(null);

            if (subscription == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("hasSubscription", false);
                response.put("requiresPayment", true);
                return ApiResponse.success(response, "No subscription found");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("hasSubscription", true);
            response.put("requiresPayment", false);
            response.put("status", subscription.getStatus());
            response.put("isTrial", subscription.getIsTrial());
            response.put("trialEndDate", subscription.getTrialEndDate());
            response.put("isActive", subscription.isActive());
            response.put("planName", subscription.getPlanName());
            response.put("planPrice", subscription.getPlanPrice());

            return ApiResponse.success(response, "Subscription details retrieved");

        } catch (Exception e) {
            log.error("Error getting subscription status", e);
            return ApiResponse.error("Failed to get subscription status");
        }
    }

    /**
     * Build payment response for existing or new subscription
     * IMPORTANT: Reuses pending transaction if exists, prevents duplicates
     */
    private ApiResponse<PaymentInitResponse> buildPaymentResponse(
            Subscription subscription, Organization organization, String userEmail) {

        try {
            // 🔒 Check if there's already a PENDING transaction for this subscription
            PaymentTransaction existingTransaction = paymentTransactionRepository
                    .findBySubscriptionIdAndStatus(subscription.getId(), PaymentStatus.PENDING)
                    .stream()
                    .findFirst()
                    .orElse(null);

            if (existingTransaction != null) {
                log.info("Reusing existing PENDING transaction: {} for subscription: {}", 
                        existingTransaction.getGatewayOrderId(), subscription.getId());
                
                // Rebuild payment data with existing transaction
                Map<String, String> paymentData = buildPayHerePaymentData(
                        existingTransaction.getGatewayOrderId(), 
                        existingTransaction.getAmount(), 
                        organization, 
                        userEmail, 
                        existingTransaction.getTransactionUuid(), 
                        subscription
                );

                String hash = generatePayHereHash(paymentData);
                paymentData.put("hash", hash);

                PaymentInitResponse response = PaymentInitResponse.builder()
                        .orderId(existingTransaction.getGatewayOrderId())
                        .transactionUuid(existingTransaction.getTransactionUuid())
                        .amount(existingTransaction.getAmount())
                        .currency(payHereConfig.getCurrency())
                        .paymentGateway("PAYHERE")
                        .paymentUrl(payHereConfig.getPaymentUrl())
                        .paymentData(paymentData)
                        .message("Free trial - Payment gateway for card verification")
                        .isTrial(true)
                        .planName(subscription.getPlanName())
                        .planPrice(subscription.getPlanPrice())
                        .billingCycle(subscription.getBillingCycle().toString())
                        .build();

                return ApiResponse.success(response, "Payment initiated successfully (existing)");
            }

            // No pending transaction found, create new one
            // Generate unique order ID
            String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            // Use subscription plan price for card verification during trial
            // PayHere requires non-zero amount to show payment form
            BigDecimal amount = subscription.getPlanPrice();

            log.info("Creating NEW payment transaction for subscription ID: {}", subscription.getId());

            // Create payment transaction record
            PaymentTransaction transaction = PaymentTransaction.builder()
                    .transactionUuid(UUID.randomUUID().toString())
                    .organizationUuid(organization.getOrganizationUuid())
                    .subscriptionId(subscription.getId())
                    .amount(amount)
                    .currency(payHereConfig.getCurrency())
                    .transactionType(TransactionType.SUBSCRIPTION)
                    .paymentGateway("PAYHERE")
                    .gatewayOrderId(orderId)
                    .status(PaymentStatus.PENDING)
                    .billingEmail(userEmail)
                    .build();

            PaymentTransaction savedTransaction = paymentTransactionRepository.save(transaction);
            log.info("Payment transaction created with UUID: {}", savedTransaction.getTransactionUuid());

            // Generate PayHere payment details
            Map<String, String> paymentData = buildPayHerePaymentData(
                    orderId, amount, organization, userEmail, savedTransaction.getTransactionUuid(), subscription
            );

            // Calculate hash
            String hash = generatePayHereHash(paymentData);
            paymentData.put("hash", hash);
            
            // Debug log for PayHere data
            log.info("PayHere Payment Data: {}", paymentData);
            log.info("PayHere Form URL: {}", payHereConfig.getPaymentUrl());

            // Build response
            PaymentInitResponse response = PaymentInitResponse.builder()
                    .orderId(orderId)
                    .transactionUuid(savedTransaction.getTransactionUuid())
                    .amount(amount)
                    .currency(payHereConfig.getCurrency())
                    .paymentGateway("PAYHERE")
                    .paymentUrl(payHereConfig.getPaymentUrl())
                    .paymentData(paymentData)
                    .message("Free trial - Payment gateway for card verification")
                    .isTrial(true)
                    .planName(subscription.getPlanName())
                    .planPrice(subscription.getPlanPrice())
                    .billingCycle(subscription.getBillingCycle().toString())
                    .build();

            log.info("Payment response built successfully for order: {}", orderId);
            return ApiResponse.success(response, "Payment initiated successfully");

        } catch (Exception e) {
            log.error("Error building payment response for subscription ID: {}", 
                    subscription.getId(), e);
            throw new RuntimeException("Failed to build payment response: " + e.getMessage(), e);
        }
    }
}