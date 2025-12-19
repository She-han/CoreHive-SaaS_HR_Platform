package com.corehive.backend.util.mappers;


import com.corehive.backend.dto.request.CreateDepartmentRequest;
import com.corehive.backend.dto.response.DepartmentDTO;
import com.corehive.backend.model.Department;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DepartmentMapper {
    /**
     * Maps Department entity to DepartmentDTO.
     * Used when sending department data to frontend.
     */
    DepartmentDTO toDto(Department department);

    /**
     * Maps list of Department entities to DTOs.
     */
    List<DepartmentDTO> toDtos(List<Department> departments);

    /**
     * Maps CreateDepartmentRequest to Department entity.
     * Sensitive/system-managed fields are ignored and set in service layer.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organizationUuid", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "employees", ignore = true)
    @Mapping(target = "jobPostings", ignore = true)
    Department toEntity(CreateDepartmentRequest dto);

    /**
     * Updates an existing Department entity from request DTO.
     * Preserves ID, organization, relationships, and audit fields.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organizationUuid", ignore = true)
    @Mapping(target = "employees", ignore = true)
    @Mapping(target = "jobPostings", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateDepartmentFromDto(CreateDepartmentRequest dto,
                                 @MappingTarget Department department);

}
