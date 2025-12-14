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

    //  Single entity → DTO
    JobPostingResponseDTO toDto(JobPosting entity);

    // ✅ List mapping (MapStruct will reuse toDto automatically)
    List<JobPostingResponseDTO> toDtos(List<JobPosting> jobPostings);

    // ✅ DTO → Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organizationUuid", ignore = true)
    @Mapping(target = "postedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "postedDate", ignore = true)
    @Mapping(target = "closingDate", ignore = true)
    @Mapping(target = "department", source = "department")
    JobPosting toEntity(JobPostingRequestDTO dto);

    // ✅ Custom mapper: Long → Department
    default Department map(Long departmentId) {
        if (departmentId == null) return null;
        Department department = new Department();
        department.setId(departmentId);
        return department;
    }
}
