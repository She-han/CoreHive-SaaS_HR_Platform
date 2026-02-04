package com.corehive.backend.service;

import com.corehive.backend.dto.paginated.PaginatedResponseItemDTO;
import com.corehive.backend.dto.response.PublicJobPostingResponseDTO;
import com.corehive.backend.model.JobPosting;
import com.corehive.backend.model.Organization;
import com.corehive.backend.repository.JobPostingRepository;
import com.corehive.backend.repository.OrganizationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PublicJobPostingService {

    private final JobPostingRepository jobPostingRepository;
    private final OrganizationRepository organizationRepository;

    public PublicJobPostingService(JobPostingRepository jobPostingRepository,
                                   OrganizationRepository organizationRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.organizationRepository = organizationRepository;
    }

    public PaginatedResponseItemDTO getPublicJobs(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<JobPosting> jobs = jobPostingRepository.findAllPublicOpenJobs(pageable);

        List<PublicJobPostingResponseDTO> results = jobs.getContent().stream().map(job -> {

            Organization org = organizationRepository
                    .findByOrganizationUuid(job.getOrganizationUuid())
                    .orElseThrow();

            PublicJobPostingResponseDTO dto = new PublicJobPostingResponseDTO();
            dto.setJobId(job.getId());
            dto.setTitle(job.getTitle());
            dto.setDescription(job.getDescription());
            dto.setEmploymentType(job.getEmploymentType().name());
            dto.setPostedDate(job.getPostedDate());
            dto.setClosingDate(job.getClosingDate());
            dto.setAvailableVacancies(job.getAvailableVacancies());
            dto.setContactEmail(job.getContactEmail());

            dto.setOrganizationName(org.getName());
            dto.setOrganizationEmail(org.getEmail());
            dto.setEmployeeCountRange(org.getEmployeeCountRange());

            return dto;
        }).toList();

        return new PaginatedResponseItemDTO(
                results,
                page,
                size,
                jobs.getTotalElements(),
                jobs.getTotalPages()
        );
    }
}

