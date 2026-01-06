package com.corehive.backend.service;



import com.corehive.backend.dto.BillingPlanDTO;
import com.corehive.backend.model.BillingPlan;
import com.corehive.backend.repository.BillingPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BillingPlanService {

    private final BillingPlanRepository billingPlanRepository;

    public List<BillingPlanDTO> getAllPlans() {
        return billingPlanRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BillingPlanDTO> getActivePlans() {
        return billingPlanRepository.findByActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BillingPlanDTO> getPopularPlans() {
        return billingPlanRepository.findByPopularTrueAndActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BillingPlanDTO getPlanById(Long id) {
        BillingPlan plan = billingPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with ID: " + id));
        return convertToDTO(plan);
    }

    public BillingPlanDTO createPlan(BillingPlanDTO planDTO) {
        if (billingPlanRepository.findByName(planDTO.getName()).isPresent()) {
            throw new RuntimeException("Plan with name '" + planDTO.getName() + "' already exists");
        }

        BillingPlan plan = convertToEntity(planDTO);
        BillingPlan savedPlan = billingPlanRepository.save(plan);
        return convertToDTO(savedPlan);
    }

    public BillingPlanDTO updatePlan(Long id, BillingPlanDTO planDTO) {
        BillingPlan plan = billingPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with ID: " + id));

        plan.setName(planDTO.getName());
        plan.setPrice(planDTO.getPrice());
        plan.setPeriod(planDTO.getPeriod());
        plan.setDescription(planDTO.getDescription());
        plan.setEmployees(planDTO.getEmployees());
        plan.setFeatures(planDTO.getFeatures());
        plan.setPopular(planDTO.isPopular());
        plan.setActive(planDTO.isActive());

        BillingPlan updatedPlan = billingPlanRepository.save(plan);
        return convertToDTO(updatedPlan);
    }

    public void deletePlan(Long id) {
        BillingPlan plan = billingPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with ID: " + id));
        billingPlanRepository.delete(plan);
    }

    public void deactivatePlan(Long id) {
        BillingPlan plan = billingPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with ID: " + id));
        plan.setActive(false);
        billingPlanRepository.save(plan);
    }

    private BillingPlanDTO convertToDTO(BillingPlan plan) {
        return new BillingPlanDTO(
                plan.getId(),
                plan.getName(),
                plan.getPrice(),
                plan.getPeriod(),
                plan.getDescription(),
                plan.getEmployees(),
                plan.getFeatures(),
                plan.isPopular(),
                plan.isActive()
        );
    }

    private BillingPlan convertToEntity(BillingPlanDTO dto) {
        BillingPlan plan = new BillingPlan();
        plan.setName(dto.getName());
        plan.setPrice(dto.getPrice());
        plan.setPeriod(dto.getPeriod());
        plan.setDescription(dto.getDescription());
        plan.setEmployees(dto.getEmployees());
        plan.setFeatures(dto.getFeatures());
        plan.setPopular(dto.isPopular());
        plan.setActive(dto.isActive());
        return plan;
    }
}