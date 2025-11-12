package com.corehive.backend.service;

import com.corehive.backend.model.JobPosting;
import com.corehive.backend.repository.JobPostingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobPostingService {
    private final JobPostingRepository jobPostingRepository;

    public JobPostingService(JobPostingRepository jobPostingRepository) {
        this.jobPostingRepository = jobPostingRepository;
    }

    //CREATE
    public JobPosting CreateJobPosting(JobPosting jobPosting){
        return jobPostingRepository.save(jobPosting);
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

        if (updatedJob.getAvatarUrl() != null && !updatedJob.getAvatarUrl().isEmpty()) {
            existing.setAvatarUrl(updatedJob.getAvatarUrl());
        }

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
