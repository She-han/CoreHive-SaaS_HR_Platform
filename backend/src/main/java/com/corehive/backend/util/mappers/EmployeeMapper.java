package com.corehive.backend.util.mappers;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.response.DepartmentDTO;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.model.Employee;
import org.mapstruct.*;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface EmployeeMapper {

    // =========================
    // ENTITY → RESPONSE DTO
    // =========================
    @Mapping(source = "departmentId", target = "departmentId")
    @Mapping(source = "department", target = "departmentDTO")
    EmployeeResponseDTO toDto(Employee employee);

    List<EmployeeResponseDTO> toDtos(List<Employee> employees);

    // =========================
    // REQUEST DTO → ENTITY
    // =========================
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organizationUuid", ignore = true)
    @Mapping(target = "department", ignore = true)   // VERY IMPORTANT
    @Mapping(source = "department", target = "departmentId")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "salaryType", expression = "java(Employee.SalaryType.valueOf(dto.getSalaryType()))")
    @Mapping(target = "isActive", expression = "java(\"Active\".equalsIgnoreCase(dto.getStatus()))")
    Employee toEntity(EmployeeRequestDTO dto);

    // =========================
    // UPDATE EXISTING ENTITY
    // =========================
    @Mapping(target = "department", ignore = true)
    @Mapping(source = "department", target = "departmentId")
    @Mapping(target = "salaryType", expression = "java(Employee.SalaryType.valueOf(dto.getSalaryType()))")
    @Mapping(target = "isActive", expression = "java(\"Active\".equalsIgnoreCase(dto.getStatus()))")
    void updateEmployeeFromDto(EmployeeRequestDTO dto, @MappingTarget Employee employee);

    // =========================
    // DEPARTMENT → DEPARTMENT DTO
    // (SAFE, NO LAZY COLLECTIONS)
    // =========================
    default DepartmentDTO mapDepartmentToDTO(com.corehive.backend.model.Department department) {
        if (department == null) {
            return null;
        }

        return new DepartmentDTO(
                department.getId(),
                department.getOrganizationUuid(),
                department.getName(),
                department.getCode(),
                department.getManagerId(),
                department.getIsActive(),
                department.getCreatedAt()
        );
    }
}
