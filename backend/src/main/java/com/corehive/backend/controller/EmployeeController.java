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
            @RequestParam(value = "page") int page,
            @RequestParam(value = "size") int size) {

        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        String userEmail = (String) httpRequest.getAttribute("userEmail");

        PaginatedResponseItemDTO paginatedResponseItemDTO = employeeService.getAllEmployeesWithPaginated(organizationUuid, page, size);
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
        EmployeeResponseDTO employee = employeeService.getEmployeeById(organizationUuid, id);
        return new ResponseEntity<>(
                new StandardResponse(200, "One employee fetched Successfully", employee),
                HttpStatus.OK
        );
    }

    //************************************************//
    //MAKE DEACTIVATE EMPLOYEE//
    //************************************************//
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> deactivateEmployee(HttpServletRequest httpRequest,
                                                               @PathVariable Long id) {
        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        String userEmail = (String) httpRequest.getAttribute("userEmail");
        employeeService.deactivateEmployee(organizationUuid, id);
        return new ResponseEntity<>(
                new StandardResponse(200, "Employee marked as inactive", null),
                HttpStatus.OK
        );
    }

    //************************************************//
    //CREATE AN EMPLOYEE//
    //************************************************//
    @PostMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> createEmployee(
            HttpServletRequest httpRequest,
            @RequestBody EmployeeRequestDTO req
    ) {
        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        String userEmail = (String) httpRequest.getAttribute("userEmail");
        EmployeeResponseDTO employee = employeeService.createEmployee(organizationUuid, req);
        return new ResponseEntity<>(
                new StandardResponse(200, "Employee created Successfully", employee),
                HttpStatus.OK
        );
    }

    //************************************************//
    //UPDATE AN EMPLOYEE//
    //************************************************//
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> updateEmployee(
            HttpServletRequest httpRequest,
            @PathVariable Long id,
            @RequestBody EmployeeRequestDTO req) {
        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        String userEmail = (String) httpRequest.getAttribute("userEmail");

        EmployeeResponseDTO updatedEmployee = employeeService.updateEmployee(organizationUuid, id, req);

        return new ResponseEntity<>(
                new StandardResponse(200, "Updated employee Successfully", updatedEmployee),
                HttpStatus.OK
        );
    }


}
