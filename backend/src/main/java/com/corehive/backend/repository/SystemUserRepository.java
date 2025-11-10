package com.corehive.backend.repository;

import com.corehive.backend.model.SystemUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * SystemUser Repository
 * System admin users database access සඳහා
 */
@Repository
public interface SystemUserRepository extends JpaRepository<SystemUser, Long> {

    /**
     * Email address එකෙන් system user find කරන්න
     * Login වෙලාවේ use වෙනවා
     */
    Optional<SystemUser> findByEmail(String email);

    /**
     * Email address එක exist කරනවාද check කරන්න
     * Registration validation සඳහා
     */
    boolean existsByEmail(String email);

    /**
     * Active system users count
     * Statistics සඳහා
     */
    long countByIsActiveTrue();
}