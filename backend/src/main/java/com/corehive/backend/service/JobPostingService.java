package com.corehive.backend.service;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.JobPostingRequestDTO;
import com.corehive.backend.dto.paginated.PaginatedResponseItemDTO;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.dto.response.JobPostingResponseDTO;
import com.corehive.backend.exception.employeeCustomException.OrganizationNotFoundException;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.JobPosting;
import com.corehive.backend.repository.JobPostingRepository;
import com.corehive.backend.util.mappers.JobPostingMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class JobPostingService {
    private final JobPostingRepository jobPostingRepository;
    private final JobPostingMapper jobPostingMapper;

    public JobPostingService(JobPostingRepository jobPostingRepository, JobPostingMapper jobPostingMapper) {
        this.jobPostingRepository = jobPostingRepository;
        this.jobPostingMapper = jobPostingMapper;
    }

    //************************************************//
    //GET ALL JOB-POSTINGS//
    //************************************************//
    public PaginatedResponseItemDTO getAllJobPostingsWithPaginated(String orgUuid, int page, int size) {
        // 1. Validate the orgUuid first
        if (orgUuid == null || orgUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID cannot be null or empty");
        }

        // 2️. Validate pagination parameters
        if (page < 0) {
            throw new IllegalArgumentException("Page number must be 0 or greater");
        }

        if (size <= 0) {
            throw new IllegalArgumentException("Page size must be greater than 0");
        }

        // 3. Create Pageable object
        Pageable pageable = PageRequest.of(page, size);


        // 4. Map entities to DTOs
        Page<JobPosting> jobPostingPage;
        try {
            jobPostingPage = jobPostingRepository.findByOrganizationUuid(orgUuid, pageable);
        } catch (Exception ex) {
            // Covers database or repository errors
            throw new RuntimeException("Failed to fetch job postings", ex);
        }

        // 5️ Map entities to DTOs
        List<JobPostingResponseDTO> jobPostingDTOs =
                jobPostingMapper.EntityToDtos(jobPostingPage.getContent());

        // 6. Build paginated response
        PaginatedResponseItemDTO paginatedResponse = new PaginatedResponseItemDTO();
        paginatedResponse.setItems(jobPostingDTOs);
        paginatedResponse.setPage(page);
        paginatedResponse.setSize(size);
        paginatedResponse.setTotalItems(jobPostingPage.getTotalElements());
        paginatedResponse.setTotalPages(jobPostingPage.getTotalPages());

        return paginatedResponse;
    }

    //CREATE
    public JobPosting createJobPosting(JobPostingRequestDTO req) {

        JobPosting job = new JobPosting();

        job.setOrganizationUuid(
                req.getOrganizationUuid() != null ? req.getOrganizationUuid() : "ORG-0001"
        );

        job.setTitle(req.getTitle());
        job.setDescription(req.getDescription());
        job.setDepartment(req.getDepartment());

        job.setEmploymentType(JobPosting.EmploymentType.valueOf(req.getEmploymentType().toUpperCase()));
        job.setStatus(JobPosting.Status.valueOf(req.getStatus().toUpperCase()));

        if (req.getPostedDate() != null) {
            job.setPostedDate(LocalDate.parse(req.getPostedDate()));
        }

        if (req.getClosingDate() != null) {
            job.setClosingDate(LocalDate.parse(req.getClosingDate()));
        }

        job.setAvailableVacancies(req.getAvailableVacancies());
        job.setPostedBy(1L); // TEMP FIX - Replace with logged user later

        job.setCreatedAt(LocalDateTime.now());

        return jobPostingRepository.save(job);
    }




    //READ-by ID
    public Optional<JobPosting> getJobPostingById(Long id){
        return jobPostingRepository.findById(id);
    }

    //UPDATE
    public JobPosting updateJobPosting(Long id, JobPostingRequestDTO req) {

        Optional<JobPosting> optional = jobPostingRepository.findById(id);
        if (optional.isEmpty()) {
            return null;  // Employee not found
        }

        JobPosting job = optional.get();

        // Update fields
        job.setTitle(req.getTitle());
        job.setDescription(req.getDescription());
        job.setDepartment(req.getDepartment());
        job.setPostedDate(LocalDate.parse(req.getPostedDate()));
        job.setClosingDate(LocalDate.parse(req.getClosingDate()));
        job.setAvailableVacancies(req.getAvailableVacancies());

        // Employee Type ENUM
        job.setEmploymentType(JobPosting.EmploymentType.valueOf(req.getEmploymentType().toUpperCase()));

        // Status Type ENUM
        job.setStatus(JobPosting.Status.valueOf(req.getStatus().toUpperCase()));

        return jobPostingRepository.save(job);
  }


    // DELETE
    public void deleteJobPosting(Long id) {
        if (!jobPostingRepository.existsById(id)) {
            throw new RuntimeException("Job posting not found with id " + id);
        }
        jobPostingRepository.deleteById(id);
    }


}
