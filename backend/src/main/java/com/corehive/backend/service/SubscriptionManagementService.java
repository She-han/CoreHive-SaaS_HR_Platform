package com.corehive.backend.service;

import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.model.*;
import com.corehive.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing subscriptions (view, cancel, change plan)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionManagementService {

    private final SubscriptionRepository subscriptionRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final BillingPlanRepository billingPlanRepository;
    private final OrganizationRepository organizationRepository;

    /**
     * Check if organization has an active subscription
     */
    public ApiResponse<Map<String, Object>> checkSubscription(String organizationUuid) {
        try {
            Subscription subscription = subscriptionRepository
                    .findByOrganizationUuid(organizationUuid)
                    .orElse(null);

            Map<String, Object> response = new HashMap<>();
            response.put("hasSubscription", subscription != null);
            
            if (subscription != null) {
                response.put("subscriptionId", subscription.getId());
                response.put("status", subscription.getStatus());
                response.put("planName", subscription.getPlanName());
                response.put("planPrice", subscription.getPlanPrice());
                response.put("billingCycle", subscription.getBillingCycle());
                response.put("isActive", subscription.isActive());
                response.put("isTrial", subscription.getIsTrial());
                response.put("trialEndDate", subscription.getTrialEndDate());
                response.put("nextBillingDate", subscription.getNextBillingDate());
                response.put("payhereSubscriptionId", subscription.getPayhereSubscriptionId());
            }

            return ApiResponse.success(response, "Subscription check completed");

        } catch (Exception e) {
            log.error("Error checking subscription for organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to check subscription");
        }
    }

    /**
     * Get subscription details with transaction history
     */
    public ApiResponse<Map<String, Object>> getSubscriptionDetails(String organizationUuid) {
        try {
            Subscription subscription = subscriptionRepository
                    .findByOrganizationUuid(organizationUuid)
                    .orElseThrow(() -> new RuntimeException("Subscription not found"));

            // Get transaction history
            List<PaymentTransaction> transactions = paymentTransactionRepository
                    .findByOrganizationUuid(organizationUuid);

            // Build transaction list
            List<Map<String, Object>> transactionList = transactions.stream()
                    .map(tx -> {
                        Map<String, Object> txMap = new HashMap<>();
                        txMap.put("transactionUuid", tx.getTransactionUuid());
                        txMap.put("amount", tx.getAmount());
                        txMap.put("currency", tx.getCurrency());
                        txMap.put("status", tx.getStatus());
                        txMap.put("transactionType", tx.getTransactionType());
                        txMap.put("transactionDate", tx.getTransactionDate());
                        txMap.put("completedAt", tx.getCompletedAt());
                        txMap.put("gatewayOrderId", tx.getGatewayOrderId());
                        txMap.put("gatewayTransactionId", tx.getGatewayTransactionId());
                        txMap.put("paymentMethod", tx.getPaymentMethod());
                        return txMap;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("subscription", buildSubscriptionMap(subscription));
            response.put("transactions", transactionList);

            return ApiResponse.success(response, "Subscription details retrieved");

        } catch (Exception e) {
            log.error("Error getting subscription details for organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to get subscription details: " + e.getMessage());
        }
    }

    /**
     * Cancel subscription
     */
    @Transactional
    public ApiResponse<String> cancelSubscription(String organizationUuid) {
        try {
            Subscription subscription = subscriptionRepository
                    .findByOrganizationUuid(organizationUuid)
                    .orElseThrow(() -> new RuntimeException("Subscription not found"));

            // Update subscription status
            subscription.setStatus(SubscriptionStatus.CANCELED);
            subscription.setUpdatedAt(LocalDateTime.now());
            subscriptionRepository.save(subscription);

            log.info("Subscription cancelled for organization: {}", organizationUuid);

            // TODO: Call PayHere Subscription Manager API to cancel recurring payments
            // This requires OAuth token and subscription_id from PayHere

            return ApiResponse.success("Subscription cancelled successfully");

        } catch (Exception e) {
            log.error("Error cancelling subscription for organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to cancel subscription: " + e.getMessage());
        }
    }

    /**
     * Change subscription plan
     */
    @Transactional
    public ApiResponse<String> changePlan(String organizationUuid, Long newPlanId) {
        try {
            Subscription subscription = subscriptionRepository
                    .findByOrganizationUuid(organizationUuid)
                    .orElseThrow(() -> new RuntimeException("Subscription not found"));

            BillingPlan newPlan = billingPlanRepository
                    .findById(newPlanId)
                    .orElseThrow(() -> new RuntimeException("Billing plan not found"));

            Organization organization = organizationRepository
                    .findByOrganizationUuid(organizationUuid)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));

            // Update subscription
            subscription.setPlanName(newPlan.getName());
            subscription.setPlanPrice(new BigDecimal(newPlan.getPrice()));
            subscription.setUpdatedAt(LocalDateTime.now());
            subscriptionRepository.save(subscription);

            // Update organization billing details
            organization.setBillingPlan(newPlan.getName());
            organization.setBillingPricePerUserPerMonth(new BigDecimal(newPlan.getPrice()));
            organizationRepository.save(organization);

            log.info("Plan changed to {} for organization: {}", newPlan.getName(), organizationUuid);

            return ApiResponse.success("Plan changed successfully");

        } catch (Exception e) {
            log.error("Error changing plan for organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to change plan: " + e.getMessage());
        }
    }

    /**
     * Get available billing plans
     */
    public ApiResponse<List<Map<String, Object>>> getAvailablePlans() {
        try {
            List<BillingPlan> plans = billingPlanRepository.findByActiveTrue();

            List<Map<String, Object>> planList = plans.stream()
                    .map(plan -> {
                        Map<String, Object> planMap = new HashMap<>();
                        planMap.put("id", plan.getId());
                        planMap.put("name", plan.getName());
                        planMap.put("price", plan.getPrice());
                        planMap.put("period", plan.getPeriod());
                        planMap.put("description", plan.getDescription());
                        planMap.put("employees", plan.getEmployees());
                        planMap.put("features", plan.getFeatures());
                        planMap.put("popular", plan.isPopular());
                        return planMap;
                    })
                    .collect(Collectors.toList());

            return ApiResponse.success(planList, "Available plans retrieved");

        } catch (Exception e) {
            log.error("Error getting available plans", e);
            return ApiResponse.error("Failed to get available plans");
        }
    }

    private Map<String, Object> buildSubscriptionMap(Subscription subscription) {
        Map<String, Object> map = new HashMap<>();
        map.put("subscriptionUuid", subscription.getSubscriptionUuid());
        map.put("organizationUuid", subscription.getOrganizationUuid());
        map.put("planName", subscription.getPlanName());
        map.put("planPrice", subscription.getPlanPrice());
        map.put("billingCycle", subscription.getBillingCycle());
        map.put("status", subscription.getStatus());
        map.put("isTrial", subscription.getIsTrial());
        map.put("trialStartDate", subscription.getTrialStartDate());
        map.put("trialEndDate", subscription.getTrialEndDate());
        map.put("nextBillingDate", subscription.getNextBillingDate());
        map.put("lastPaymentDate", subscription.getLastPaymentDate());
        map.put("lastPaymentAmount", subscription.getLastPaymentAmount());
        map.put("activeUserCount", subscription.getActiveUserCount());
        map.put("payhereSubscriptionId", subscription.getPayhereSubscriptionId());
        map.put("createdAt", subscription.getCreatedAt());
        return map;
    }
}
