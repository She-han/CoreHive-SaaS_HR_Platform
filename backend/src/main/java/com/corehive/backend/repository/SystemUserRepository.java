package com.corehive.backend.repository;

import com.corehive.backend.model.SystemUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * SystemUser Repository
 * System admin users database access
 */
@Repository
public interface SystemUserRepository extends JpaRepository<SystemUser, Long> {

    /**
     * System user find by Email address   
     * Use when Login
     */
    Optional<SystemUser> findByEmail(String email);

    /**
     * Email address existence check
     * Registration validation
     */
    boolean existsByEmail(String email);

    /**
     * Active system users count
     * for Statistics 
     */
    long countByIsActiveTrue();
}