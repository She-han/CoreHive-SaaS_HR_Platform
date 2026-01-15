package com.corehive.backend.controller;



import com.corehive.backend.auditlogs.AuditActivitiEvent;
import com.corehive.backend.dto.BillingPlanDTO;
import com.corehive.backend.service.BillingPlanService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
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
    private final ApplicationEventPublisher eventPublisher;

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
    public ResponseEntity<BillingPlanDTO> createPlan(@RequestBody BillingPlanDTO planDTO, HttpServletRequest request) {
        BillingPlanDTO createdPlan = billingPlanService.createPlan(planDTO);

        // 2. Event එක Trigger කිරීම (Plan එක සාර්ථකව හැදූ පසු)
        eventPublisher.publishEvent(new AuditActivitiEvent(
                this,
                "admin@corehive.com", // මෙතනට දැනට ලොග් වී සිටින user ගේ email එක ලැබිය යුතුයි
                "System Admin",
                "Billing Plan Created",
                createdPlan.getName(),
                "New billing plan '" + createdPlan.getName() + "' was created.",
                "Success",
                request.getRemoteAddr() // User ගේ IP එක ලබා ගැනීම
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(createdPlan);
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