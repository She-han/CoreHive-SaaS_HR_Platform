package com.corehive.backend.repository;

import com.corehive.backend.model.ExtendedModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Extended Module Repository
 * Database access for extended modules management
 */
@Repository
public interface ExtendedModuleRepository extends JpaRepository<ExtendedModule, Long> {

    /**
     * Find all active modules
     * Only active modules can be selected by organizations
     */
    List<ExtendedModule> findByIsActiveTrue();

    /**
     * Find all modules ordered by name
     */
    List<ExtendedModule> findAllByOrderByNameAsc();

    /**
     * Find module by name
     */
    Optional<ExtendedModule> findByName(String name);

    /**
     * Find module by module key
     */
    Optional<ExtendedModule> findByModuleKey(String moduleKey);

    /**
     * Check if module exists by name
     */
    boolean existsByName(String name);

    /**
     * Check if module exists by module key
     */
    boolean existsByModuleKey(String moduleKey);

    /**
     * Count active modules
     */
    long countByIsActiveTrue();

    /**
     * Find modules by category
     */
    List<ExtendedModule> findByCategory(String category);

    /**
     * Find active modules by category
     */
    List<ExtendedModule> findByIsActiveTrueAndCategory(String category);
}
