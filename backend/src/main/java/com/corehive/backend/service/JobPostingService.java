package com.corehive.backend.service;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.JobPostingRequestDTO;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.JobPosting;
import com.corehive.backend.repository.JobPostingRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class JobPostingService {
    private final JobPostingRepository jobPostingRepository;

    public JobPostingService(JobPostingRepository jobPostingRepository) {
        this.jobPostingRepository = jobPostingRepository;
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


    //READ-All
    public List<JobPosting> getAllJobPostings(){
        return jobPostingRepository.findAll();
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
