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
            @RequestBody Map<String, Long> request) {
        Long newPlanId = request.get("planId");
        log.info("Changing plan for organization: {} to plan ID: {}", organizationUuid, newPlanId);
        ApiResponse<String> response = subscriptionManagementService.changePlan(organizationUuid, newPlanId);
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
}
