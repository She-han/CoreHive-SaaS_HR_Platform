
package com.corehive.backend.service;

import com.corehive.backend.config.PayHereConfig;
import com.corehive.backend.dto.request.InitiatePaymentRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.PaymentInitResponse;
import com.corehive.backend.model.*;
import com.corehive.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
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
     * Initiate payment for subscription
     */
    @Transactional
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

            if (existingSubscription != null && existingSubscription.isActive()) {
                return ApiResponse.error("Organization already has an active subscription");
            }

            // Create new subscription (Trial mode)
            Subscription subscription = createTrialSubscription(organization);

            // Generate unique order ID
            String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            // For trial period, amount is 0 (Free first month)
            BigDecimal amount = BigDecimal.ZERO;

            // Create payment transaction record
            PaymentTransaction transaction = PaymentTransaction.builder()
                    .transactionUuid(UUID.randomUUID().toString())
                    .organizationUuid(organizationUuid)
                    .subscriptionId(subscription.getId())
                    .amount(amount)
                    .currency(payHereConfig.getCurrency())
                    .transactionType(TransactionType.SUBSCRIPTION)
                    .paymentGateway("PAYHERE")
                    .gatewayOrderId(orderId)
                    .status(PaymentStatus.PENDING)
                    .billingEmail(userEmail)
                    .build();

            paymentTransactionRepository.save(transaction);

            // Generate PayHere payment details
            Map<String, String> paymentData = buildPayHerePaymentData(
                    orderId, amount, organization, userEmail, transaction.getTransactionUuid()
            );

            // Calculate hash
            String hash = generatePayHereHash(paymentData);
            paymentData.put("hash", hash);

            // Build response
            PaymentInitResponse response = PaymentInitResponse.builder()
                    .orderId(orderId)
                    .transactionUuid(transaction.getTransactionUuid())
                    .amount(amount)
                    .currency(payHereConfig.getCurrency())
                    .paymentGateway("PAYHERE")
                    .paymentUrl(payHereConfig.getPaymentUrl())
                    .paymentData(paymentData)
                    .message("Free trial - Payment gateway for card verification")
                    .isTrial(true)
                    .build();

            log.info("Payment initiated successfully for order: {}", orderId);
            return ApiResponse.success(response, "Payment initiated successfully");

        } catch (Exception e) {
            log.error("Error initiating payment", e);
            return ApiResponse.error("Failed to initiate payment: " + e.getMessage());
        }
    }

    /**
     * Create trial subscription
     */
    private Subscription createTrialSubscription(Organization organization) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime trialEnd = now.plusMonths(1);

        Subscription subscription = Subscription.builder()
                .subscriptionUuid(UUID.randomUUID().toString())
                .organizationUuid(organization.getOrganizationUuid())
                .planName(organization.getBillingPlan())
                .planPrice(organization.getBillingPricePerUserPerMonth())
                .billingCycle(BillingCycle.MONTHLY)
                .status(SubscriptionStatus.TRIAL)
                .trialStartDate(now)
                .trialEndDate(trialEnd)
                .isTrial(true)
                .nextBillingDate(trialEnd)
                .activeUserCount(1) // Initial admin user
                .build();

        return subscriptionRepository.save(subscription);
    }

    /**
     * Build PayHere payment data
     */
    private Map<String, String> buildPayHerePaymentData(
            String orderId, BigDecimal amount, Organization organization,
            String email, String transactionUuid) {

        Map<String, String> data = new HashMap<>();
        data.put("merchant_id", payHereConfig.getMerchantId());
        data.put("return_url", payHereConfig.getReturnUrl());
        data.put("cancel_url", payHereConfig.getCancelUrl());
        data.put("notify_url", payHereConfig.getNotifyUrl());

        data.put("order_id", orderId);
        data.put("items", "CoreHive HR - " + organization.getBillingPlan() + " Plan (Trial)");
        data.put("currency", payHereConfig.getCurrency());
        data.put("amount", amount.toString());

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

        return data;
    }

    /**
     * Generate PayHere MD5 hash
     */
    private String generatePayHereHash(Map<String, String> data) {
        try {
            String merchantId = data.get("merchant_id");
            String orderId = data.get("order_id");
            String amount = data.get("amount");
            String currency = data.get("currency");
            String merchantSecret = payHereConfig.getMerchantSecret();

            String hashString = merchantId + orderId + amount + currency +
                    getMd5Hash(merchantSecret);

            return getMd5Hash(hashString).toUpperCase();

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

                subscription.setStatus(SubscriptionStatus.TRIAL);
                subscription.setLastPaymentDate(LocalDateTime.now());
                subscription.setLastPaymentAmount(transaction.getAmount());
                subscriptionRepository.save(subscription);

                // Update organization status to ACTIVE
                Organization organization = organizationRepository
                        .findByOrganizationUuid(transaction.getOrganizationUuid())
                        .orElseThrow(() -> new RuntimeException("Organization not found"));

                organization.setStatus(OrganizationStatus.TRIAL);
                organizationRepository.save(organization);

                log.info("Payment successful for order: {}", orderId);
            } else {
                transaction.setStatus(PaymentStatus.FAILED);
                transaction.setErrorMessage("Payment failed with status code: " + statusCode);
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
}