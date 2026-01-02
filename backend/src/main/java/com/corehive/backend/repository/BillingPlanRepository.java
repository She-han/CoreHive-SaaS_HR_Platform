package com.corehive.backend.repository;



import com.corehive.backend.model.BillingPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingPlanRepository extends JpaRepository<BillingPlan, Long> {

    Optional<BillingPlan> findByName(String name);

    List<BillingPlan> findByActiveTrue();

    List<BillingPlan> findByPopularTrueAndActiveTrue();
}
