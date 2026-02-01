package com.corehive.backend.service;

import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.model.*;
import com.corehive.backend.repository.*;
import jakarta.persistence.EntityManager;
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
    private final OrganizationModuleRepository organizationModuleRepository;
    private final ExtendedModuleRepository extendedModuleRepository;
    private final EntityManager entityManager;

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
    public ApiResponse<String> changePlan(String organizationUuid, Long newPlanId, List<Long> customModules, Double totalPrice) {
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

            // Determine the final price to save
            BigDecimal finalPrice;
            if (totalPrice != null && totalPrice > 0) {
                // Use the calculated total price (for Custom plan with modules)
                finalPrice = BigDecimal.valueOf(totalPrice);
                log.info("Using custom total price: {} for organization: {}", totalPrice, organizationUuid);
            } else {
                // Use the plan's default price
                finalPrice = new BigDecimal(newPlan.getPrice());
            }

            // Update subscription with the final calculated price
            subscription.setPlanName(newPlan.getName());
            subscription.setPlanPrice(finalPrice);
            subscription.setUpdatedAt(LocalDateTime.now());
            subscriptionRepository.save(subscription);

            // Update organization billing details
            organization.setBillingPlan(newPlan.getName());
            organization.setBillingPricePerUserPerMonth(finalPrice);
            
            // Determine which modules to activate
            List<Long> modulesToActivate;
            if ("Custom".equalsIgnoreCase(newPlan.getName()) && customModules != null && !customModules.isEmpty()) {
                // For Custom plan, use manually selected modules
                modulesToActivate = customModules;
                log.info("Custom plan selected with {} modules", customModules.size());
            } else {
                // For predefined plans, use modules from plan_modules table
                modulesToActivate = newPlan.getModuleIds();
                log.info("Predefined plan '{}' selected with {} modules from plan_modules", newPlan.getName(), 
                        modulesToActivate != null ? modulesToActivate.size() : 0);
            }

            // Clear all existing organization_modules records for this organization
            List<OrganizationModule> existingModules = organizationModuleRepository.findByOrganization(organization);
            if (!existingModules.isEmpty()) {
                organizationModuleRepository.deleteAll(existingModules);
                entityManager.flush(); // Force flush to execute DELETE before INSERT
                log.info("Removed {} existing module subscriptions for organization: {}", 
                        existingModules.size(), organizationUuid);
            }

            // Reset all module flags first
            organization.setModuleQrAttendanceMarking(false);
            organization.setModuleFaceRecognitionAttendanceMarking(false);
            organization.setModuleEmployeeFeedback(false);
            organization.setModuleHiringManagement(false);

            // Create new organization_modules records and update boolean flags
            if (modulesToActivate != null && !modulesToActivate.isEmpty()) {
                for (Long moduleId : modulesToActivate) {
                    try {
                        ExtendedModule module = extendedModuleRepository.findById(moduleId)
                                .orElseThrow(() -> new RuntimeException("Module not found: " + moduleId));

                        // Create organization_module record
                        OrganizationModule orgModule = OrganizationModule.builder()
                                .organization(organization)
                                .extendedModule(module)
                                .isEnabled(true)
                                .subscribedAt(LocalDateTime.now())
                                .build();
                        organizationModuleRepository.save(orgModule);

                        // Update organization boolean flags based on module key
                        updateOrganizationModuleFlag(organization, module.getModuleKey(), true);

                        log.info("Added module '{}' (ID: {}) to organization: {}", 
                                module.getName(), moduleId, organizationUuid);

                    } catch (Exception e) {
                        log.error("Error adding module {} to organization {}: {}", 
                                moduleId, organizationUuid, e.getMessage());
                        // Continue with other modules even if one fails
                    }
                }
                log.info("Successfully activated {} modules for organization: {}", 
                        modulesToActivate.size(), organizationUuid);
            } else {
                log.info("No modules to activate for organization: {}", organizationUuid);
            }
            
            organizationRepository.save(organization);

            log.info("Plan changed to {} for organization: {} with final price: {}", 
                    newPlan.getName(), organizationUuid, finalPrice);

            return ApiResponse.success("Plan changed successfully");

        } catch (Exception e) {
            log.error("Error changing plan for organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to change plan: " + e.getMessage());
        }
    }

    /**
     * Update organization's module boolean flag based on module key
     */
    private void updateOrganizationModuleFlag(Organization org, String moduleKey, boolean value) {
        if (moduleKey == null) return;

        switch (moduleKey) {
            case "moduleQrAttendanceMarking":
                org.setModuleQrAttendanceMarking(value);
                break;
            case "moduleFaceRecognitionAttendanceMarking":
                org.setModuleFaceRecognitionAttendanceMarking(value);
                break;
            case "moduleEmployeeFeedback":
                org.setModuleEmployeeFeedback(value);
                break;
            case "moduleHiringManagement":
                org.setModuleHiringManagement(value);
                break;
            default:
                log.warn("Unknown module key: {}", moduleKey);
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

    /**
     * Activate subscription with 30-day trial for APPROVED_PENDING_PAYMENT organization
     * Changes organization status to ACTIVE
     */
    @Transactional
    public ApiResponse<Map<String, Object>> activateSubscriptionWithTrial(String organizationUuid) {
        try {
            // Check if subscription already exists
            if (subscriptionRepository.findByOrganizationUuid(organizationUuid).isPresent()) {
                return ApiResponse.error("Subscription already exists for this organization");
            }

            // Get organization
            Organization organization = organizationRepository
                    .findByOrganizationUuid(organizationUuid)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));

            // Validate organization status
            if (!OrganizationStatus.APPROVED_PENDING_PAYMENT.equals(organization.getStatus())) {
                return ApiResponse.error("Organization is not in APPROVED_PENDING_PAYMENT status");
            }

            // Create subscription with 30-day trial
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime trialEnd = now.plusDays(30);

            Subscription subscription = Subscription.builder()
                    .subscriptionUuid(java.util.UUID.randomUUID().toString())
                    .organizationUuid(organizationUuid)
                    .planName(organization.getBillingPlan())
                    .planPrice(organization.getBillingPricePerUserPerMonth())
                    .billingCycle(BillingCycle.MONTHLY)
                    .status(SubscriptionStatus.TRIAL)
                    .trialStartDate(now)
                    .trialEndDate(trialEnd)
                    .isTrial(true)
                    .nextBillingDate(trialEnd)
                    .activeUserCount(0)
                    .paymentGateway("PAYHERE")
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            subscriptionRepository.save(subscription);

            // Update organization status to ACTIVE
            organization.setStatus(OrganizationStatus.ACTIVE);
            organization.setUpdatedAt(now);
            organizationRepository.save(organization);

            log.info("Subscription activated with 30-day trial for organization: {}", organizationUuid);

            Map<String, Object> response = new HashMap<>();
            response.put("subscription", buildSubscriptionMap(subscription));
            response.put("organizationStatus", organization.getStatus());
            response.put("message", "Subscription activated successfully with 30-day free trial");

            return ApiResponse.success(response, "Subscription activated with trial");

        } catch (Exception e) {
            log.error("Error activating subscription for organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to activate subscription: " + e.getMessage());
        }
    }

    /**
     * Get organization billing information for payment gateway display
     */
    public ApiResponse<Map<String, Object>> getOrganizationBillingInfo(String organizationUuid) {
        try {
            Organization organization = organizationRepository
                    .findByOrganizationUuid(organizationUuid)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));

            Map<String, Object> billingInfo = new HashMap<>();
            billingInfo.put("organizationUuid", organization.getOrganizationUuid());
            billingInfo.put("organizationName", organization.getName());
            billingInfo.put("planName", organization.getBillingPlan());
            billingInfo.put("price", organization.getBillingPricePerUserPerMonth());
            billingInfo.put("organizationStatus", organization.getStatus());
            billingInfo.put("employeeCountRange", organization.getEmployeeCountRange());

            return ApiResponse.success(billingInfo, "Billing information retrieved");

        } catch (Exception e) {
            log.error("Error getting billing info for organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to get billing information: " + e.getMessage());
        }
    }
}
