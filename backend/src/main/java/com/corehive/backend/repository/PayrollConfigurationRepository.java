package com.corehive.backend.repository;

import com.corehive.backend.model.PayrollConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PayrollConfigurationRepository extends JpaRepository<PayrollConfiguration, Long> {
    
    Optional<PayrollConfiguration> findByOrganizationUuid(String organizationUuid);
    
    Optional<PayrollConfiguration> findByOrganizationUuidAndIsActiveTrue(String organizationUuid);
}
