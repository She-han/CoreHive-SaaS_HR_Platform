
package com.corehive.backend.controller;

import com.corehive.backend.dto.request.InitiatePaymentRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.PaymentInitResponse;
import com.corehive.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Initiate subscription payment
     * POST /api/payment/initiate
     */
    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<PaymentInitResponse>> initiatePayment(
            @Valid @RequestBody InitiatePaymentRequest request) {

        log.info("Payment initiation request for org: {}", request.getOrganizationUuid());

        ApiResponse<PaymentInitResponse> response = paymentService
                .initiateSubscriptionPayment(
                        request.getOrganizationUuid(),
                        request.getUserEmail()
                );

        return ResponseEntity.ok(response);
    }

    /**
     * PayHere payment notification webhook
     * POST /api/payment/notify
     */
    @PostMapping("/notify")
    public ResponseEntity<ApiResponse<String>> paymentNotification(
            @RequestParam Map<String, String> params) {

        log.info("Payment notification received");

        ApiResponse<String> response = paymentService.handlePaymentNotification(params);

        return ResponseEntity.ok(response);
    }

    /**
     * Get subscription status
     * GET /api/payment/subscription/status/{organizationUuid}
     */
    @GetMapping("/subscription/status/{organizationUuid}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSubscriptionStatus(
            @PathVariable String organizationUuid) {

        log.info("Checking subscription status for org: {}", organizationUuid);

        ApiResponse<Map<String, Object>> response = paymentService
                .getSubscriptionStatus(organizationUuid);

        return ResponseEntity.ok(response);
    }
}