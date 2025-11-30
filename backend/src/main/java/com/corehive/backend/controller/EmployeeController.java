package com.corehive.backend.controller;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.model.Employee;
import com.corehive.backend.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@CrossOrigin(origins = "http://localhost:3001")
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public List<Employee> getAll() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/{id}")
    public Employee getById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id).orElse(null);
    }

    @DeleteMapping("/{id}")
    public String deleteEmployee(@PathVariable Long id) {
        boolean deleted = employeeService.deleteEmployee(id);
        if (deleted) {
            return "Employee deleted"; // 204 No Content
        } else {
            return "Employee can't deleted"; // 404 Not Found
        }
    }

    @PostMapping
    public Employee createEmployee(@RequestBody EmployeeRequestDTO req) {
        return employeeService.createEmployee(req);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody EmployeeRequestDTO req) {

        Employee updated = employeeService.updateEmployee(id, req);

        if (updated == null) {
            return ResponseEntity.badRequest().body("Employee not found");
        }

        return ResponseEntity.ok(updated);
    }

    // === PATCH — Salary Only (basic, allowances, deductions) ===
    @PatchMapping("/{id}/salary")
    public ResponseEntity<?> updateSalary(
            @PathVariable Long id,
            @RequestBody Map<String, Object> fields) {

        try {
            Employee updated = employeeService.updateSalaryFields(id, fields);
            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Update failed: " + e.getMessage());
        }
    }

//    @PatchMapping("/{id}/salary-breakdown")
//    public ResponseEntity<?> updateSalaryBreakdown(
//            @PathVariable Long id,
//            @RequestBody Map<String, Object> fields) {
//
//        try {
//            employeeService.updateSalaryBreakdown(id, fields);
//            return ResponseEntity.ok("Updated successfully");
//
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//    }


    @GetMapping("/{id}/salary-breakdown")
    public ResponseEntity<?> getSalaryBreakdown(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(employeeService.getSalaryBreakdown(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PatchMapping("/{id}/salary-breakdown")
    public ResponseEntity<?> updateSalaryBreakdown(
            @PathVariable Long id,
            @RequestBody Map<String, Object> fields) {

        try {
            employeeService.updateSalaryBreakdown(id, fields);
            return ResponseEntity.ok("Updated successfully");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



}
