package com.corehive.backend.service;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.paginated.PaginatedResponseItemDTO;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.exception.employeeCustomException.EmployeeAlreadyInactiveException;
import com.corehive.backend.exception.employeeCustomException.EmployeeNotFoundException;
import com.corehive.backend.exception.employeeCustomException.InvalidEmployeeDataException;
import com.corehive.backend.exception.employeeCustomException.OrganizationNotFoundException;
import com.corehive.backend.model.Department;
import com.corehive.backend.model.Employee;
import com.corehive.backend.repository.DepartmentRepository;
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
    private final DepartmentRepository departmentRepository;


    public EmployeeService(EmployeeRepository employeeRepository, EmployeeMapper employeeMapper, DepartmentRepository departmentRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeMapper = employeeMapper;
        this.departmentRepository = departmentRepository;
    }

    //************************************************//
    //GET ALL EMPLOYEES//
    //************************************************//
    public PaginatedResponseItemDTO getAllEmployeesWithPaginated(String orgUuid, int page, int size) {
        // 1. Validate the orgUuid first
        if (orgUuid == null || orgUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID cannot be null or empty");
        }

        // 2️. Validate pagination parameters
        if (page < 0) {
            throw new IllegalArgumentException("Page number must be 0 or greater");
        }

        if (size <= 0) {
            throw new IllegalArgumentException("Page size must be greater than 0");
        }

        // 3. Create Pageable object
        Pageable pageable = PageRequest.of(page, size);

        // 4. Fetch employees
        Page<Employee> employeePage = employeeRepository.findByOrganizationUuid(orgUuid, pageable);

        // 5. Map entities to DTOs
        List<EmployeeResponseDTO> employeeDTOs = employeeMapper.toDtos(employeePage.getContent());

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

    //************************************************//
    //GET ONE EMPLOYEE//
    //************************************************//
    public EmployeeResponseDTO getEmployeeById(String organizationUuid, Long id) {
        // 1️) Validate organization
        if (organizationUuid == null || organizationUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID is missing");
        }


        // 2️) Fetch employee safely
        Employee employee = employeeRepository
                .findByIdAndOrganizationUuid(id, organizationUuid)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee with id " + id + " not found in this organization"
                        )
                );

        // 3) Map entity → DTO
        return employeeMapper.toDto(employee);

    }

    //************************************************//
    //CREATE AN EMPLOYEE//
    //************************************************//
    public EmployeeResponseDTO createEmployee(String organizationUuid, EmployeeRequestDTO req) {

        // 1️) Validate org UUID
        if (organizationUuid == null || organizationUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID is missing");
        }

        // 2️) Basic request validation
        if (req.getFirstName() == null || req.getLastName() == null) {
            throw new InvalidEmployeeDataException("First name and last name are required");
        }

        try {
            Employee employee = employeeMapper.toEntity(req);

            employee.setOrganizationUuid(organizationUuid);

            // Department
            if (req.getDepartmentId() != null) {
                Department department = departmentRepository
                        .findById(req.getDepartmentId())
                        .orElseThrow(() ->
                                new InvalidEmployeeDataException("Invalid department ID"));
                employee.setDepartment(department);
            }

        if (req.getDepartmentId() != null) {
            Department department = departmentRepository
                    .findById(req.getDepartmentId())
                    .orElseThrow(() ->
                            new InvalidEmployeeDataException("Invalid department ID"));

            employee.setDepartment(department);
        }

            // Salary Type
            if (req.getSalaryType() != null) {
                employee.setSalaryType(
                        Employee.SalaryType.valueOf(req.getSalaryType().toUpperCase())
                );
            }

            // Salary
            if (req.getBasicSalary() != null) {
                employee.setBasicSalary(new BigDecimal(req.getBasicSalary()));
            }

            // Date Joined
            if (req.getDateJoined() != null) {
                employee.setDateOfJoining(LocalDate.parse(req.getDateJoined()));
            }

            // Status
            if (req.getStatus() != null) {
                employee.setIsActive(req.getStatus().equalsIgnoreCase("ACTIVE"));
            }

            Employee saved = employeeRepository.save(employee);
            return employeeMapper.toDto(saved);

        } catch (IllegalArgumentException ex) {
            throw new InvalidEmployeeDataException("Invalid enum or data format");
        }
    }

    //************************************************//
    // UPDATE EMPLOYEE
    //************************************************//
    public EmployeeResponseDTO updateEmployee(String orgUuid, Long id, EmployeeRequestDTO req) {

        if (orgUuid == null || orgUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID is missing");
        }

        Employee employee = employeeRepository
                .findByIdAndOrganizationUuid(id, orgUuid)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee with id " + id + " not found"
                        )
                );

        try {
            employeeMapper.updateEmployeeFromDto(req, employee);

            // Department
            if (req.getDepartmentId() != null) {
                Department department = departmentRepository
                        .findById(req.getDepartmentId())
                        .orElseThrow(() ->
                                new InvalidEmployeeDataException("Invalid department ID"));
                employee.setDepartment(department);
            }

            // Salary Type
            if (req.getSalaryType() != null) {
                employee.setSalaryType(
                        Employee.SalaryType.valueOf(req.getSalaryType().toUpperCase())
                );
            }

            // Salary
            if (req.getBasicSalary() != null) {
                employee.setBasicSalary(new BigDecimal(req.getBasicSalary()));
            }

            // Date Joined
            if (req.getDateJoined() != null) {
                employee.setDateOfJoining(LocalDate.parse(req.getDateJoined()));
            }

            // Status
            if (req.getStatus() != null) {
                employee.setIsActive(req.getStatus().equalsIgnoreCase("ACTIVE"));
            }

            employee.setOrganizationUuid(orgUuid);

            Employee updated = employeeRepository.save(employee);
            return employeeMapper.toDto(updated);

        } catch (IllegalArgumentException ex) {
            throw new InvalidEmployeeDataException("Invalid enum or data format");
        }
    }


}
