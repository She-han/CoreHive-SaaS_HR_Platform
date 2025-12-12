package com.corehive.backend.service;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.exception.EmployeeNotFoundException;
import com.corehive.backend.exception.OrganizationNotFoundException;
import com.corehive.backend.model.Employee;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.util.mappers.EmployeeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
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
    public List<EmployeeResponseDTO> getAllEmployees(String orgUuid) {
        // 1. Validate the orgUuid first
        if (orgUuid == null || orgUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID cannot be null or empty");
        }

        // 2. Fetch employees
        List<Employee> employees = employeeRepository.findAllByorganizationUuidEquals(orgUuid);

        // 3. Check if employees exist
        if (employees.isEmpty()) {
            throw new EmployeeNotFoundException("No employees found for organization: " + orgUuid);
        }

        // 4. Map entities to DTOs and return
        return employeeMapper.EntityToDtos(employees);


    }

    public Optional<Employee> getEmployeeById(Long id) {
        return employeeRepository.findById(id);
    }

    public boolean deleteEmployee(Long id) {
        if (employeeRepository.existsById(id)) {
            employeeRepository.deleteById(id);
            return true;  // deleted successfully
        }
        return false;  // not found
    }

    public Employee saveEmployee(Employee employee){
        return employeeRepository.save(employee);
    }

    public Employee createEmployee(EmployeeRequestDTO req) {
        Employee emp = new Employee();
        emp.setOrganizationUuid("ORG-0001"); // TEMP FIX
        emp.setEmployeeCode(req.getEmployeeCode());
        emp.setDepartmentId(req.getDepartment());  // your entity field is departmentId
        emp.setEmail(req.getEmail());
        emp.setPhone(req.getPhone());
        emp.setFirstName(req.getFirstName());
        emp.setLastName(req.getLastName());
        emp.setDesignation(req.getDesignation());


        // ENUM - convert string to enum
        emp.setSalaryType(Employee.SalaryType.valueOf(req.getSalaryType().toUpperCase()));

        // Convert string to number
        emp.setBasicSalary(new BigDecimal(req.getBasicSalary()));

        emp.setLeaveCount(req.getLeaveCount());

        // Convert string to LocalDate
        emp.setDateOfJoining(LocalDate.parse(req.getDateJoined()));

        // Convert status to boolean
        emp.setIsActive(req.getStatus().equalsIgnoreCase("Active"));

        return employeeRepository.save(emp);
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
