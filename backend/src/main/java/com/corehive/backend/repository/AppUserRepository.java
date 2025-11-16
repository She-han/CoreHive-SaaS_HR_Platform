package com.corehive.backend.repository;

import com.corehive.backend.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * AppUser Repository
 * Organization users database access 
 */
@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    /**
     * App user find by Email address
     * Use when login
     */
    Optional<AppUser> findByEmail(String email);

    /**
     * Find by Organization UUID & email 
     * Can find specific user in Multi-tenant environment
     */
    Optional<AppUser> findByOrganizationUuidAndEmail(String organizationUuid, String email);

    /**
     * Find  all Organization users
     * for User management
     */
    List<AppUser> findByOrganizationUuid(String organizationUuid);

    /**
     * Organization's specific role users
     * Role-based filtering
     */
    @Query("SELECT u FROM AppUser u WHERE u.organizationUuid = :orgUuid AND CAST(u.role AS string) = :role")
    List<AppUser> findByOrganizationUuidAndRole(@Param("orgUuid") String organizationUuid, @Param("role") String role);

    /**
     * Organization's active users count
     */
    long countByOrganizationUuidAndIsActiveTrue(String organizationUuid);

    /**
     * Email already exists in organization
     */
    boolean existsByOrganizationUuidAndEmail(String organizationUuid, String email);
}