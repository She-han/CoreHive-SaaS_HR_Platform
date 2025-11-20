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
}
