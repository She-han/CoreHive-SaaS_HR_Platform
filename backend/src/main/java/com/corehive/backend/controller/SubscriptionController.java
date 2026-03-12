package com.corehive.backend.controller;

import com.corehive.backend.dto.BillingPlanDTO;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.service.BillingPlanService;
import com.corehive.backend.service.SubscriptionManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for subscription management endpoints
 */
@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class SubscriptionController {

    private final SubscriptionManagementService subscriptionManagementService;
    private final BillingPlanService billingPlanService;

    /**
     * Check if organization has subscription
     * GET /api/subscription/check/{organizationUuid}
     */
    @GetMapping("/check/{organizationUuid}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkSubscription(
            @PathVariable String organizationUuid) {
        log.info("Checking subscription for organization: {}", organizationUuid);
        ApiResponse<Map<String, Object>> response = subscriptionManagementService.checkSubscription(organizationUuid);
        return ResponseEntity.ok(response);
    }

    /**
     * Get subscription details with transaction history
     * GET /api/subscription/details/{organizationUuid}
     */
    @GetMapping("/details/{organizationUuid}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSubscriptionDetails(
            @PathVariable String organizationUuid) {
        log.info("Getting subscription details for organization: {}", organizationUuid);
        ApiResponse<Map<String, Object>> response = subscriptionManagementService.getSubscriptionDetails(organizationUuid);
        return ResponseEntity.ok(response);
    }

    /**
     * Cancel subscription
     * POST /api/subscription/cancel/{organizationUuid}
     */
    @PostMapping("/cancel/{organizationUuid}")
    public ResponseEntity<ApiResponse<String>> cancelSubscription(
            @PathVariable String organizationUuid) {
        log.info("Cancelling subscription for organization: {}", organizationUuid);
        ApiResponse<String> response = subscriptionManagementService.cancelSubscription(organizationUuid);
        return ResponseEntity.ok(response);
    }

    /**
     * Change subscription plan
     * PUT /api/subscription/plan/{organizationUuid}
     */
    @PutMapping("/plan/{organizationUuid}")
    public ResponseEntity<ApiResponse<String>> changePlan(
            @PathVariable String organizationUuid,
            @RequestBody Map<String, Object> request) {
        Long newPlanId = ((Number) request.get("planId")).longValue();
        @SuppressWarnings("unchecked")
        List<Long> customModules = request.get("customModules") != null 
            ? ((List<Number>) request.get("customModules")).stream()
                .map(Number::longValue)
                .collect(java.util.stream.Collectors.toList())
            : java.util.Collections.emptyList();
        
        // Get total price for Custom plan with selected modules
        Double totalPrice = request.get("totalPrice") != null 
            ? ((Number) request.get("totalPrice")).doubleValue() 
            : null;
        
        log.info("Changing plan for organization: {} to plan ID: {} with {} custom modules, totalPrice: {}", 
                organizationUuid, newPlanId, customModules.size(), totalPrice);
        ApiResponse<String> response = subscriptionManagementService.changePlan(organizationUuid, newPlanId, customModules, totalPrice);
        return ResponseEntity.ok(response);
    }

    /**
     * Get available billing plans
     * GET /api/subscription/plans
     */

    @GetMapping("/plans")
    public ResponseEntity<List<BillingPlanDTO>> getActivePlans() {
        return ResponseEntity.ok(billingPlanService.getActivePlans());
    }

    /**
     * Activate subscription with trial for APPROVED_PENDING_PAYMENT organizations
     * POST /api/subscription/activate/{organizationUuid}
     */
    @PostMapping("/activate/{organizationUuid}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> activateSubscription(
            @PathVariable String organizationUuid) {
        log.info("Activating subscription with trial for organization: {}", organizationUuid);
        ApiResponse<Map<String, Object>> response = subscriptionManagementService.activateSubscriptionWithTrial(organizationUuid);
        return ResponseEntity.ok(response);
    }

    /**
     * Get organization billing information for payment gateway
     * GET /api/subscription/billing-info/{organizationUuid}
     */
    @GetMapping("/billing-info/{organizationUuid}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrganizationBillingInfo(
            @PathVariable String organizationUuid) {
        log.info("Getting billing info for organization: {}", organizationUuid);
        ApiResponse<Map<String, Object>> response = subscriptionManagementService.getOrganizationBillingInfo(organizationUuid);
        return ResponseEntity.ok(response);
    }
}
