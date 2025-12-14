package com.corehive.backend.controller;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.paginated.PaginatedResponseItemDTO;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.model.Employee;
import com.corehive.backend.service.EmployeeService;
import com.corehive.backend.util.StandardResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;


@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/orgs/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    //************************************************//
    //GET ALL EMPLOYEES//
    //************************************************//
    @GetMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getAll(
            HttpServletRequest httpRequest,
            @RequestParam(value = "page") int page ,
            @RequestParam(value = "size") int size) {

        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        String userEmail = (String) httpRequest.getAttribute("userEmail");

        PaginatedResponseItemDTO paginatedResponseItemDTO = employeeService.getAllEmployeesWithPaginated(organizationUuid , page , size);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200, "All employee fetched Successfully", paginatedResponseItemDTO), HttpStatus.OK
        );
    }

    //************************************************//
    //GET ONE EMPLOYEE//
    //************************************************//
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getById(HttpServletRequest httpRequest, @PathVariable Long id) {
        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        String userEmail = (String) httpRequest.getAttribute("userEmail");
        EmployeeResponseDTO employee = employeeService.getEmployeeById(organizationUuid ,id);
        return new ResponseEntity<>(
                new StandardResponse(200, "One employee fetched Successfully", employee),
                HttpStatus.OK
        );
    }

//    public Employee getById(@PathVariable Long id) {
//        return employeeService.getEmployeeById(id).orElse(null);
//    }

    //************************************************//
    //MAKE DEACTIVATE EMPLOYEE//
    //************************************************//
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> deactivateEmployee(HttpServletRequest httpRequest,
                                                               @PathVariable Long id) {
        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        String userEmail = (String) httpRequest.getAttribute("userEmail");
        employeeService.deactivateEmployee(organizationUuid , id);
        return new ResponseEntity<>(
                new StandardResponse(200, "Employee marked as inactive", null),
                HttpStatus.OK
        );
    }

    //************************************************//
    //MAKE AN EMPLOYEE//
    //************************************************//
    @PostMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> createEmployee(
            HttpServletRequest httpRequest,
            @RequestBody EmployeeRequestDTO req
    ) {
        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        String userEmail = (String) httpRequest.getAttribute("userEmail");
        Employee employee = employeeService.createEmployee(organizationUuid , req);
        return new ResponseEntity<>(
                new StandardResponse(200, "Employee created Successfully", null),
                HttpStatus.OK
        );
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
