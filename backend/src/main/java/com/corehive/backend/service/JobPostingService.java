package com.corehive.backend.service;

import com.corehive.backend.dto.JobPostingRequestDTO;
import com.corehive.backend.model.JobPosting;
import com.corehive.backend.repository.JobPostingRepository;
import org.springframework.stereotype.Service;

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
    public JobPosting updateJobPosting(Long id, JobPosting updatedJob) {
        JobPosting existing = jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found with id " + id));

        existing.setTitle(updatedJob.getTitle());
        existing.setDescription(updatedJob.getDescription());
        existing.setDepartment(updatedJob.getDepartment());
        existing.setEmploymentType(updatedJob.getEmploymentType());
        existing.setStatus(updatedJob.getStatus());
        existing.setPostedDate(updatedJob.getPostedDate());
        existing.setClosingDate(updatedJob.getClosingDate());
        existing.setPostedBy(updatedJob.getPostedBy());
        existing.setAvailableVacancies(updatedJob.getAvailableVacancies());
        existing.setOrganizationUuid(updatedJob.getOrganizationUuid());

//        if (updatedJob.getAvatarUrl() != null && !updatedJob.getAvatarUrl().isEmpty()) {
//            existing.setAvatarUrl(updatedJob.getAvatarUrl());
//        }

        return jobPostingRepository.save(existing);
    }


    // DELETE
    public void deleteJobPosting(Long id) {
        if (!jobPostingRepository.existsById(id)) {
            throw new RuntimeException("Job posting not found with id " + id);
        }
        jobPostingRepository.deleteById(id);
    }
}
