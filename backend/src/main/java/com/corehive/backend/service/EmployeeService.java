package com.corehive.backend.service;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.model.Employee;
import com.corehive.backend.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;


    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
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
            emp.setOrganizationUuid(req.getOrganizationUuid()); // Use from request
            emp.setEmployeeCode(req.getEmployeeCode());
            emp.setDepartmentId(req.getDepartment());
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
