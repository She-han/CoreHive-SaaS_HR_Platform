package com.corehive.backend.repository;

import com.corehive.backend.model.Organization;
import com.corehive.backend.model.OrganizationModule;
import com.corehive.backend.model.ExtendedModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Organization Module Repository
 * Database access for organization-module relationships
 */
@Repository
public interface OrganizationModuleRepository extends JpaRepository<OrganizationModule, Long> {

    /**
     * Find all modules for an organization
     */
    List<OrganizationModule> findByOrganization(Organization organization);

    /**
     * Find all modules for an organization by organization UUID
     */
    @Query("SELECT om FROM OrganizationModule om WHERE om.organization.organizationUuid = :orgUuid")
    List<OrganizationModule> findByOrganizationUuid(@Param("orgUuid") String orgUuid);

    /**
     * Find enabled modules for an organization
     */
    @Query("SELECT om FROM OrganizationModule om WHERE om.organization.organizationUuid = :orgUuid AND om.isEnabled = true")
    List<OrganizationModule> findEnabledByOrganizationUuid(@Param("orgUuid") String orgUuid);

    /**
     * Find specific organization-module relationship
     */
    Optional<OrganizationModule> findByOrganizationAndExtendedModule(Organization organization, ExtendedModule extendedModule);

    /**
     * Find by organization UUID and module ID
     */
    @Query("SELECT om FROM OrganizationModule om WHERE om.organization.organizationUuid = :orgUuid AND om.extendedModule.moduleId = :moduleId")
    Optional<OrganizationModule> findByOrganizationUuidAndModuleId(@Param("orgUuid") String orgUuid, @Param("moduleId") Long moduleId);

    /**
     * Check if organization has specific module
     */
    @Query("SELECT COUNT(om) > 0 FROM OrganizationModule om WHERE om.organization.organizationUuid = :orgUuid AND om.extendedModule.moduleId = :moduleId AND om.isEnabled = true")
    boolean existsByOrganizationUuidAndModuleIdAndEnabled(@Param("orgUuid") String orgUuid, @Param("moduleId") Long moduleId);

    /**
     * Delete all modules for an organization
     */
    void deleteByOrganization(Organization organization);

    /**
     * Delete specific organization-module relationship
     */
    void deleteByOrganizationAndExtendedModule(Organization organization, ExtendedModule extendedModule);

    /**
     * Count enabled modules for organization
     */
    @Query("SELECT COUNT(om) FROM OrganizationModule om WHERE om.organization.organizationUuid = :orgUuid AND om.isEnabled = true")
    long countEnabledByOrganizationUuid(@Param("orgUuid") String orgUuid);

    /**
     * Find all organizations using a specific module
     */
    List<OrganizationModule> findByExtendedModule(ExtendedModule extendedModule);

    /**
     * Find all organizations using a specific module by module ID
     */
    @Query("SELECT om FROM OrganizationModule om WHERE om.extendedModule.moduleId = :moduleId AND om.isEnabled = true")
    List<OrganizationModule> findByExtendedModuleIdAndEnabled(@Param("moduleId") Long moduleId);
}
