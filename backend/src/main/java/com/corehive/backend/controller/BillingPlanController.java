package com.corehive.backend.controller;



import com.corehive.backend.dto.BillingPlanDTO;
import com.corehive.backend.service.BillingPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing-plans")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class BillingPlanController {

    private final BillingPlanService billingPlanService;

    @GetMapping
    public ResponseEntity<List<BillingPlanDTO>> getAllPlans() {
        return ResponseEntity.ok(billingPlanService.getAllPlans());
    }

    @GetMapping("/active")
    public ResponseEntity<List<BillingPlanDTO>> getActivePlans() {
        return ResponseEntity.ok(billingPlanService.getActivePlans());
    }

    @GetMapping("/popular")
    public ResponseEntity<List<BillingPlanDTO>> getPopularPlans() {
        return ResponseEntity.ok(billingPlanService.getPopularPlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillingPlanDTO> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(billingPlanService.getPlanById(id));
    }

    @PostMapping
    public ResponseEntity<BillingPlanDTO> createPlan(@RequestBody BillingPlanDTO planDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(billingPlanService.createPlan(planDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillingPlanDTO> updatePlan(
            @PathVariable Long id,
            @RequestBody BillingPlanDTO planDTO) {
        return ResponseEntity.ok(billingPlanService.updatePlan(id, planDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        billingPlanService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<BillingPlanDTO> deactivatePlan(@PathVariable Long id) {
        billingPlanService.deactivatePlan(id);
        return ResponseEntity.ok(billingPlanService.getPlanById(id));
    }
}