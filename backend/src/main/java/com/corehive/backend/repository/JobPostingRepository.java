package com.corehive.backend.repository;

import com.corehive.backend.model.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting , Long> {
    Page<JobPosting> findByOrganizationUuid(String orgUuid, Pageable pageable);
}
