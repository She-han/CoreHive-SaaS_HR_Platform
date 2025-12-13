package com.corehive.backend.service;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.paginated.PaginatedResponseItemDTO;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.exception.employeeCustomException.EmployeeAlreadyInactiveException;
import com.corehive.backend.exception.employeeCustomException.EmployeeNotFoundException;
import com.corehive.backend.exception.employeeCustomException.InvalidEmployeeDataException;
import com.corehive.backend.exception.employeeCustomException.OrganizationNotFoundException;
import com.corehive.backend.model.Employee;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.util.mappers.EmployeeMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private EmployeeMapper employeeMapper;

    public EmployeeService(EmployeeRepository employeeRepository, EmployeeMapper employeeMapper) {
        this.employeeRepository = employeeRepository;
        this.employeeMapper = employeeMapper;
    }

    //************************************************//
    //GET ALL EMPLOYEES//
    //************************************************//
    public PaginatedResponseItemDTO getAllEmployeesWithPaginated(String orgUuid ,  int page, int size) {
        // 1. Validate the orgUuid first
        if (orgUuid == null || orgUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID cannot be null or empty");
        }

        // 2. Create Pageable object
        Pageable pageable = PageRequest.of(page, size);

        // 3. Fetch employees
        Page<Employee> employeePage = employeeRepository.findByOrganizationUuid(orgUuid, pageable);

        // 5. Map entities to DTOs
        List<EmployeeResponseDTO> employeeDTOs = employeeMapper.EntityToDtos(employeePage.getContent());

        // 6. Build paginated response
        PaginatedResponseItemDTO paginatedResponse = new PaginatedResponseItemDTO();
        paginatedResponse.setItems(employeeDTOs);
        paginatedResponse.setPage(page);
        paginatedResponse.setSize(size);
        paginatedResponse.setTotalItems(employeePage.getTotalElements());
        paginatedResponse.setTotalPages(employeePage.getTotalPages());

        return paginatedResponse;


    }

    //************************************************//
    //MAKE DEACTIVATE EMPLOYEE//
    //************************************************//
    public void deactivateEmployee(String orgUuid, Long id) {
        // Step 1: Find the employee
        Optional<Employee> optionalEmployee = employeeRepository.findByIdAndOrganizationUuid(id, orgUuid);

        // Step 2: Check if employee exists
        if (optionalEmployee.isPresent()) {
            Employee employee = optionalEmployee.get();

            // Throw exception if already inactive
            if (!employee.getIsActive()) {
                throw new EmployeeAlreadyInactiveException(
                        "Employee with id " + id + " is already inactive."
                );
            }

            // Deactivate employee
            employee.setIsActive(false);
            employeeRepository.save(employee);

        } else {
            // Throw exception if employee not found
            throw new EmployeeNotFoundException(
                    "Employee with id " + id + " not found in organization " + orgUuid
            );
        }
    }


    public Optional<Employee> getEmployeeById(Long id) {
        return employeeRepository.findById(id);
    }


    public Employee saveEmployee(Employee employee){
        return employeeRepository.save(employee);
    }

    public Employee createEmployee(String organizationUuid, EmployeeRequestDTO req) {

        // 1️) Validate org UUID
        if (organizationUuid == null || organizationUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID is missing");
        }

        // 2️) Basic request validation
        if (req.getFirstName() == null || req.getLastName() == null) {
            throw new InvalidEmployeeDataException("First name and last name are required");
        }

        try {
            // 3️) Map DTO → Entity
            Employee employee = employeeMapper.toEntity(req);

            // 4️) Set fields NOT coming from DTO
            employee.setOrganizationUuid(organizationUuid);

            // 5️) Save
            return employeeRepository.save(employee);

        } catch (IllegalArgumentException ex) {
            // Thrown from MapStruct converters
            throw new InvalidEmployeeDataException(ex.getMessage());
        }


//        Employee emp = new Employee();
//        emp.setOrganizationUuid(organizationUuid);
//        emp.setEmployeeCode(req.getEmployeeCode());
//        emp.setDepartmentId(req.getDepartment());  // your entity field is departmentId
//        emp.setEmail(req.getEmail());
//        emp.setPhone(req.getPhone());
//        emp.setFirstName(req.getFirstName());
//        emp.setLastName(req.getLastName());
//        emp.setDesignation(req.getDesignation());
//
//
//        // ENUM - convert string to enum
//        emp.setSalaryType(Employee.SalaryType.valueOf(req.getSalaryType().toUpperCase()));
//
//        // Convert string to number
//        emp.setBasicSalary(new BigDecimal(req.getBasicSalary()));
//
//        emp.setLeaveCount(req.getLeaveCount());
//
//        // Convert string to LocalDate
//        emp.setDateOfJoining(LocalDate.parse(req.getDateJoined()));
//
//        // Convert status to boolean
//        emp.setIsActive(req.getStatus().equalsIgnoreCase("Active"));
//
//        return employeeRepository.save(emp);
    }

    public Employee updateEmployee(Long id, EmployeeRequestDTO req) {

        Optional<Employee> optional = employeeRepository.findById(id);
        if (optional.isEmpty()) {
            return null;  // Employee not found
        }

        Employee emp = optional.get();

        // Update fields
        emp.setEmployeeCode(req.getEmployeeCode());
        emp.setFirstName(req.getFirstName());
        emp.setLastName(req.getLastName());
        emp.setDesignation(req.getDesignation());
        emp.setEmail(req.getEmail());
        emp.setPhone(req.getPhone());
        emp.setDepartmentId(req.getDepartment());
        emp.setLeaveCount(req.getLeaveCount());

        // Salary Type ENUM
        emp.setSalaryType(Employee.SalaryType.valueOf(req.getSalaryType().toUpperCase()));

        // Salary (BigDecimal)
        emp.setBasicSalary(new BigDecimal(req.getBasicSalary()));

        // Date Joined
        emp.setDateOfJoining(LocalDate.parse(req.getDateJoined()));

        // Active / NonActive
        emp.setIsActive(req.getStatus().equalsIgnoreCase("Active"));

        // Organization UUID should remain same for existing employees

        return employeeRepository.save(emp);
    }


}
