package com.corehive.backend.util.mappers;

import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.model.Employee;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {
    //Employee entity to employeeResponseDTO
    List<EmployeeResponseDTO> EntityToDtos(List<Employee> employees);
}
