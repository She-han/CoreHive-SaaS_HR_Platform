package com.corehive.backend.util.mappers;

import com.corehive.backend.dto.request.JobPostingRequestDTO;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.dto.response.JobPostingResponseDTO;
import com.corehive.backend.model.Department;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.JobPosting;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface JobPostingMapper {

    // =========================
    // REQUEST DTO → ENTITY
    // =========================
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    JobPosting toEntity(JobPostingRequestDTO dto);

    // =========================
    // ENTITY → RESPONSE DTO
    // =========================
    @Mapping(source = "department.id", target = "department")
    JobPostingResponseDTO toDto(JobPosting entity);

    // =========================
    // LIST MAPPING
    // =========================
    List<JobPostingResponseDTO> toDtos(List<JobPosting> entities);

    // =========================
    // UPDATE EXISTING ENTITY
    // =========================
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDto(
            JobPostingRequestDTO dto,
            @MappingTarget JobPosting entity
    );
}
