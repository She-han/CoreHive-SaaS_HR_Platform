package com.corehive.backend.controller;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.model.Employee;
import com.corehive.backend.service.EmployeeService;
import com.corehive.backend.util.StandardResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/orgs/{orgUuid}/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    //************************************************//
    //GET ALL EMPLOYEES//
    //************************************************//
    @GetMapping
    public ResponseEntity<StandardResponse> getAll(@PathVariable String orgUuid) {
        List<EmployeeResponseDTO> allEmployees = employeeService.getAllEmployees(orgUuid);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200 , "Success" , allEmployees) , HttpStatus.OK
        );
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



}
