package com.corehive.backend.service;

import com.corehive.backend.dto.request.JobPostingRequestDTO;
import com.corehive.backend.dto.paginated.PaginatedResponseItemDTO;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.dto.response.JobPostingResponseDTO;
import com.corehive.backend.exception.departmentException.DepartmentNotFoundException;
import com.corehive.backend.exception.employeeCustomException.EmployeeNotFoundException;
import com.corehive.backend.exception.employeeCustomException.OrganizationNotFoundException;
import com.corehive.backend.exception.jobPostingCustomException.InvalidJobPostingException;
import com.corehive.backend.exception.jobPostingCustomException.JobPostingCreationException;
import com.corehive.backend.exception.jobPostingCustomException.JobPostingNotFoundException;
import com.corehive.backend.model.Department;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.JobPosting;
import com.corehive.backend.repository.DepartmentRepository;
import com.corehive.backend.repository.JobPostingRepository;
import com.corehive.backend.util.mappers.JobPostingMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class JobPostingService {
    private final JobPostingRepository jobPostingRepository;
    private final JobPostingMapper jobPostingMapper;
    private final DepartmentRepository departmentRepository;

    public JobPostingService(JobPostingRepository jobPostingRepository, JobPostingMapper jobPostingMapper, DepartmentRepository departmentRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.jobPostingMapper = jobPostingMapper;
        this.departmentRepository = departmentRepository;
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
                jobPostingMapper.toDtos(jobPostingPage.getContent());

        // 6. Build paginated response
        PaginatedResponseItemDTO paginatedResponse = new PaginatedResponseItemDTO();
        paginatedResponse.setItems(jobPostingDTOs);
        paginatedResponse.setPage(page);
        paginatedResponse.setSize(size);
        paginatedResponse.setTotalItems(jobPostingPage.getTotalElements());
        paginatedResponse.setTotalPages(jobPostingPage.getTotalPages());

        return paginatedResponse;
    }

    //************************************************//
    // CREATE A JOB POSTING
//************************************************//
    public JobPostingResponseDTO createJobPosting(
            String organizationUuid,
            JobPostingRequestDTO req,
            Long userId
    ) {

        // 1) Validate organization
        if (organizationUuid == null || organizationUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID is missing");
        }

        // 2) Validate request
        if (req == null) {
            throw new InvalidJobPostingException("Job posting request cannot be null");
        }

        // 3) Fetch & validate department
        Department department = departmentRepository
                .findById(req.getDepartmentId())
                .orElseThrow(() -> new DepartmentNotFoundException(
                        "Department with id " + req.getDepartmentId() + " not found"
                ));

        // (Optional but recommended)
        if (!department.getOrganizationUuid().equals(organizationUuid)) {
            throw new InvalidJobPostingException(
                    "Department does not belong to this organization"
            );
        }

        // 4) Map DTO → Entity (simple fields only)
        JobPosting jobPosting = jobPostingMapper.toEntity(req);

        // 5) Set relationships & system-controlled fields
        jobPosting.setDepartment(department);
        jobPosting.setOrganizationUuid(organizationUuid);
        jobPosting.setPostedBy(userId);
        jobPosting.setCreatedAt(LocalDateTime.now());

        // 6) Save
        JobPosting saved = jobPostingRepository.save(jobPosting);

        // 7) Return response
        return jobPostingMapper.toDto(saved);
    }


    //************************************************//
    //GET ONE JOB-POSTING//
    //************************************************//
    public JobPostingResponseDTO getJobPostingById(String organizationUuid, Long id) {
        // 1️) Validate organization
        if (organizationUuid == null || organizationUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID is missing");
        }

        // 2️) Validate ID
        if (id == null) {
            throw new InvalidJobPostingException("Job posting ID cannot be null");
        }

        // 3) Fetch job posting safely
        JobPosting jobPosting = jobPostingRepository
                .findByIdAndOrganizationUuid(id, organizationUuid)
                .orElseThrow(() ->
                        new JobPostingNotFoundException(
                                "Job posting with id " + id + " not found in this organization"
                        )
                );

        // 4️) Map Entity → DTO
        return jobPostingMapper.toDto(jobPosting);
    }

    //************************************************//
    // UPDATE A JOB POSTING
//************************************************//
    public JobPostingResponseDTO updateJobPostingById(
            String organizationUuid,
            Long id,
            JobPostingRequestDTO req,
            Long userId
    ) {

        // 1) Validate organization
        if (organizationUuid == null || organizationUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID is missing");
        }

        // 2) Validate request
        if (req == null) {
            throw new InvalidJobPostingException("Job posting request cannot be null");
        }

        // 3) Fetch existing job posting
        JobPosting existing = jobPostingRepository
                .findByIdAndOrganizationUuid(id, organizationUuid)
                .orElseThrow(() -> new JobPostingNotFoundException(
                        "Job posting with id " + id + " not found in this organization"
                ));

        // 4) Fetch & validate department
        Department department = departmentRepository
                .findById(req.getDepartmentId())
                .orElseThrow(() -> new DepartmentNotFoundException(
                        "Department with id " + req.getDepartmentId() + " not found"
                ));

        // 5) Map updatable fields
        jobPostingMapper.updateEntityFromDto(req, existing);


        // 6) Set relationship & system-controlled fields
        existing.setOrganizationUuid(organizationUuid);
        existing.setDepartment(department);
        existing.setPostedBy(Long.valueOf(userId));

        // 7) Save & return
        JobPosting saved = jobPostingRepository.save(existing);
        return jobPostingMapper.toDto(saved);
    }

    //************************************************//
    //DELETE A JOB-POSTING//
    //************************************************//
    public void deleteJobPostingById(String organizationUuid, Long id) {
        if (organizationUuid == null || organizationUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID is missing");
        }

        if (id == null) {
            throw new InvalidJobPostingException("Job posting ID cannot be null");
        }

        JobPosting jobPosting = jobPostingRepository
                .findByIdAndOrganizationUuid(id, organizationUuid)
                .orElseThrow(() -> new JobPostingNotFoundException(
                        "Job posting with id " + id + " not found in this organization"
                ));

        jobPostingRepository.delete(jobPosting);
    }
}
