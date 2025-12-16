package com.corehive.backend.util.mappers;

import com.corehive.backend.dto.DepartmentDTO;
import com.corehive.backend.dto.request.CreateDepartmentRequest;
import com.corehive.backend.model.Department;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DepartmentMapper {
    DepartmentDTO toDto(Department department);

    List<DepartmentDTO> toDtos(List<Department> departments);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organizationUuid", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "employees", ignore = true)
    @Mapping(target = "jobPostings", ignore = true)
    Department toEntity(CreateDepartmentRequest dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organizationUuid", ignore = true)
    @Mapping(target = "employees", ignore = true)
    @Mapping(target = "jobPostings", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateDepartmentFromDto(CreateDepartmentRequest dto, @MappingTarget Department department);
}
