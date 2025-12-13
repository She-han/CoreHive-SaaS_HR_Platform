package com.corehive.backend.util.mappers;

import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.dto.response.JobPostingResponseDTO;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.JobPosting;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface JobPostingMapper {
    // Map single entity to DTO
    JobPostingResponseDTO entityToDto(JobPosting jobPosting);

    //JobPosting entity to jobPostingResponseDTO
    List<JobPostingResponseDTO> EntityToDtos(List<JobPosting> jobPostings);
}
