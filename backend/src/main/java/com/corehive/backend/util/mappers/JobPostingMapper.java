package com.corehive.backend.util.mappers;

import com.corehive.backend.dto.request.JobPostingRequestDTO;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.dto.response.JobPostingResponseDTO;
import com.corehive.backend.model.Department;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.JobPosting;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface JobPostingMapper {
    // Map single entity to DTO
    JobPostingResponseDTO entityToDto(JobPosting jobPosting);

    //JobPosting entity to jobPostingResponseDTO
    List<JobPostingResponseDTO> EntityToDtos(List<JobPosting> jobPostings);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organizationUuid", ignore = true)
    @Mapping(target = "postedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "postedDate", ignore = true)
    @Mapping(target = "closingDate", ignore = true)
    @Mapping(target = "department", source = "department")
    JobPosting toEntity(JobPostingRequestDTO dto);

    // Fix for "Long → Department" mapping
    //MapStruct cannot convert Long → Department automatically, so we need a custom mapper.
    default Department map(Long departmentId) {
        if (departmentId == null) return null;
        Department department = new Department();
        department.setId(departmentId);
        return department;
    }
}
