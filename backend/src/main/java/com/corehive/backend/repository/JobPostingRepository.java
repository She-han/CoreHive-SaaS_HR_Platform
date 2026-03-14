package com.corehive.backend.repository;

import com.corehive.backend.model.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting , Long> {
    Page<JobPosting> findByOrganizationUuid(String orgUuid, Pageable pageable);

    Optional<JobPosting> findByIdAndOrganizationUuid(Long id, String organizationUuid);

    @Query("""
        SELECT jp
        FROM JobPosting jp
        JOIN Organization o ON jp.organizationUuid = o.organizationUuid
        WHERE jp.status = 'OPEN' AND jp.postedDate IS NOT NULL
    """)
    Page<JobPosting> findAllPublicOpenJobs(Pageable pageable);
}
