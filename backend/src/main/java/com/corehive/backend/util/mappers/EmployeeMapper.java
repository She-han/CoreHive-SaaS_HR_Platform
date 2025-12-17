package com.corehive.backend.util.mappers;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.model.Department;
import com.corehive.backend.model.Employee;
import org.mapstruct.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE ,
        uses = { DepartmentMapper.class }
)
public interface EmployeeMapper {


    @Mapping(source = "department.id", target = "departmentId")
    @Mapping(source = "department", target = "department")
    EmployeeResponseDTO toDto(Employee employee);


    List<EmployeeResponseDTO> toDtos(List<Employee> employees);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "organizationUuid", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Employee toEntity(EmployeeRequestDTO dto);

    @Mapping(target = "department", ignore = true)
    void updateEmployeeFromDto(EmployeeRequestDTO dto, @MappingTarget Employee employee);
}
