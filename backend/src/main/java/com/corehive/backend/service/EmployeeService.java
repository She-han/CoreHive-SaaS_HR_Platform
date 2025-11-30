package com.corehive.backend.service;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.model.AllowanceItem;
import com.corehive.backend.model.DeductionItem;
import com.corehive.backend.model.Employee;
import com.corehive.backend.repository.AllowanceItemRepository;
import com.corehive.backend.repository.DeductionItemRepository;
import com.corehive.backend.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final AllowanceItemRepository allowanceItemRepository;
    private final DeductionItemRepository deductionItemRepository;


    public EmployeeService(EmployeeRepository employeeRepository, AllowanceItemRepository allowanceItemRepository, DeductionItemRepository deductionItemRepository) {
        this.employeeRepository = employeeRepository;
        this.allowanceItemRepository = allowanceItemRepository;
        this.deductionItemRepository = deductionItemRepository;
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

    // === PATCH: Update only salary fields ===
    public Employee updateSalaryFields(Long id, Map<String, Object> fields) {

        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (fields.containsKey("basicSalary")) {
            emp.setBasicSalary(new BigDecimal(fields.get("basicSalary").toString()));
        }

        if (fields.containsKey("allowances")) {
            emp.setAllowances(new BigDecimal(fields.get("allowances").toString()));
        }

        if (fields.containsKey("deductions")) {
            emp.setDeductions(new BigDecimal(fields.get("deductions").toString()));
        }

        return employeeRepository.save(emp);
    }

//    @Transactional
//    public void updateSalaryBreakdown(Long empId, Map<String, Object> fields) {
//        // Save basic salary
//        if (fields.containsKey("basicSalary")) {
//            Employee emp = employeeRepository.findById(empId)
//                    .orElseThrow(() -> new RuntimeException("Employee not found"));
//            emp.setBasicSalary(new BigDecimal(fields.get("basicSalary").toString()));
//            employeeRepository.save(emp);
//        }
//
//        // Allowances list
//        if (fields.containsKey("allowances")) {
//
//            List<Map<String, Object>> allowances =
//                    (List<Map<String, Object>>) fields.get("allowances");
//
//            allowanceItemRepository.deleteByEmployeeId(empId); // Clear old values
//
//            allowances.forEach(a -> {
//                AllowanceItem item = new AllowanceItem();
//                item.setEmployeeId(empId);
//                item.setType(a.get("type").toString());
//                item.setAmount(new BigDecimal(a.get("amount").toString()));
//                allowanceItemRepository.save(item);
//            });
//        }
//
//        // Deductions list
//        if (fields.containsKey("deductions")) {
//
//            List<Map<String, Object>> deductions =
//                    (List<Map<String, Object>>) fields.get("deductions");
//
//            deductionItemRepository.deleteByEmployeeId(empId);
//
//            deductions.forEach(d -> {
//                DeductionItem item = new DeductionItem();
//                item.setEmployeeId(empId);
//                item.setType(d.get("type").toString());
//                item.setAmount(new BigDecimal(d.get("amount").toString()));
//                deductionItemRepository.save(item);
//            });
//        }
//    }

    public Map<String, Object> getSalaryBreakdown(Long empId) {

        Employee emp = employeeRepository.findById(empId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        List<AllowanceItem> allowances = allowanceItemRepository.findByEmployeeId(empId);
        List<DeductionItem> deductions = deductionItemRepository.findByEmployeeId(empId);

        Map<String, Object> map = new HashMap<>();
        map.put("basicSalary", emp.getBasicSalary());
        map.put("allowances", allowances);
        map.put("deductions", deductions);

        return map;
    }


    @Transactional
    public void updateSalaryBreakdown(Long empId, Map<String, Object> fields) {

        Employee emp = employeeRepository.findById(empId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Update basic salary
        if (fields.containsKey("basicSalary")) {
            emp.setBasicSalary(new BigDecimal(fields.get("basicSalary").toString()));
            employeeRepository.save(emp);
        }

        // Allowances
        if (fields.containsKey("allowances")) {
            allowanceItemRepository.deleteByEmployeeId(empId);

            List<Map<String, Object>> allowances =
                    (List<Map<String, Object>>) fields.get("allowances");

            for (Map<String, Object> a : allowances) {
                AllowanceItem item = new AllowanceItem();
                item.setEmployeeId(empId);
                item.setType(a.get("type").toString());
                item.setAmount(new BigDecimal(a.get("amount").toString()));
                allowanceItemRepository.save(item);
            }
        }

        // Deductions
        if (fields.containsKey("deductions")) {
            deductionItemRepository.deleteByEmployeeId(empId);

            List<Map<String, Object>> deductions =
                    (List<Map<String, Object>>) fields.get("deductions");

            for (Map<String, Object> d : deductions) {
                DeductionItem item = new DeductionItem();
                item.setEmployeeId(empId);
                item.setType(d.get("type").toString());
                item.setAmount(new BigDecimal(d.get("amount").toString()));
                deductionItemRepository.save(item);
            }
        }
    }


}
