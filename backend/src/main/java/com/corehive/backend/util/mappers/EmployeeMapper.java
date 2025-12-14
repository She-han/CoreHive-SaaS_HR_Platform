package com.corehive.backend.util.mappers;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.model.Department;
import com.corehive.backend.model.Employee;
import org.mapstruct.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EmployeeMapper {

    // ENTITY → DTO
    EmployeeResponseDTO toDto(Employee employee);
    List<EmployeeResponseDTO> EntityToDtos(List<Employee> employees);

    // DTO → ENTITY
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organizationUuid", ignore = true)
    @Mapping(target = "appUserId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "department", source = "department", qualifiedByName = "toDepartment") // map Long → Department
    @Mapping(target = "departmentId", source = "department") // map Long → departmentId
    @Mapping(target = "basicSalary", source = "basicSalary", qualifiedByName = "toBigDecimal")
    @Mapping(target = "dateOfJoining", source = "dateJoined", qualifiedByName = "toLocalDate")
    @Mapping(target = "salaryType", source = "salaryType", qualifiedByName = "toSalaryType")
    @Mapping(target = "isActive", source = "status", qualifiedByName = "toActiveStatus")
    Employee toEntity(EmployeeRequestDTO dto);

    // UPDATE existing entity
    @Mapping(target = "department", source = "department", qualifiedByName = "toDepartment")
    @Mapping(target = "departmentId", source = "department")
    void updateEmployeeFromDto(EmployeeRequestDTO dto, @MappingTarget Employee employee);

    // =========================
    // CUSTOM CONVERTERS
    // =========================
    @Named("toBigDecimal")
    default BigDecimal toBigDecimal(String value) {
        if (value == null) return null;
        return new BigDecimal(value);
    }

    @Named("toLocalDate")
    default LocalDate toLocalDate(String value) {
        if (value == null) return null;
        return LocalDate.parse(value);
    }

    @Named("toSalaryType")
    default Employee.SalaryType toSalaryType(String value) {
        if (value == null) return Employee.SalaryType.MONTHLY;
        return Employee.SalaryType.valueOf(value.toUpperCase());
    }

    @Named("toActiveStatus")
    default Boolean toActiveStatus(String value) {
        return value != null && value.equalsIgnoreCase("Active");
    }

    // Custom method to convert Long → Department
    @Named("toDepartment")  // ✅ THIS FIXES THE QUALIFIER ERROR
    default Department toDepartment(Long id) {
        if (id == null) return null;
        Department dept = new Department();
        dept.setId(id); // Only set ID; no need to fetch full entity
        return dept;
    }
}
