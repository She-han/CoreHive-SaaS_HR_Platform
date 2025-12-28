package com.corehive.backend.controller;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.paginated.PaginatedResponseItemDTO;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.model.Employee;
import com.corehive.backend.service.EmployeeService;
import com.corehive.backend.util.StandardResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@CrossOrigin(origins = "http://localhost:3000")
@RestController

@Slf4j
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }


    //************************************************//
    //GET ALL EMPLOYEE//
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
    //Toggle status(active and deactivate)//
    //************************************************//
    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> toggleEmployeeStatus(
            HttpServletRequest httpRequest,
            @PathVariable Long id) {
        String orgUuid = (String) httpRequest.getAttribute("organizationUuid");
        Employee updatedEmployee = employeeService.toggleEmployeeStatus(orgUuid, id);
        return new ResponseEntity<>(
                new StandardResponse(200, "Employee status updated successfully", updatedEmployee),
                HttpStatus.OK
        );
    }


    /**
     * Create new employee
     */
    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponseDTO>> createEmployee(
            HttpServletRequest request,
            @Valid @RequestBody EmployeeRequestDTO employeeRequest) {

        String organizationUuid = (String) request.getAttribute("organizationUuid");

        if (organizationUuid == null || organizationUuid.isEmpty()) {
            log.warn("Organization UUID not found in request");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Organization not found in request"));
        }

        log.info("Creating employee for organization: {}", organizationUuid);
        ApiResponse<EmployeeResponseDTO> response = employeeService.createEmployee(organizationUuid, employeeRequest);

        return ResponseEntity.ok(response);
    }
    /**
     * Update employee
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponseDTO>> updateEmployee(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequestDTO employeeRequest) {

        String organizationUuid = (String) request.getAttribute("organizationUuid");

        if (organizationUuid == null || organizationUuid.isEmpty()) {
            log.warn("Organization UUID not found in request");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Organization not found in request"));
        }

        log.info("Updating employee {} for organization: {}", id, organizationUuid);
        ApiResponse<EmployeeResponseDTO> response = employeeService.updateEmployee(organizationUuid, id, employeeRequest);

        return ResponseEntity.ok(response);
    }


    /**
     * Get next auto-generated employee code (READ-ONLY)
     * Example: EMP-001, EMP-002
     */
    @GetMapping("/next-code")
    public ResponseEntity<ApiResponse<String>> getNextEmployeeCode(HttpServletRequest request) {
        String organizationUuid = (String) request.getAttribute("organizationUuid");
        try {
            String code = employeeService.generateEmployeeCode(organizationUuid);
            return ResponseEntity.ok(ApiResponse.success("Next employee code generated successfully", code));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Unable to generate employee code"));
        }
    }


    //************************************************//
    //get count of total employees//
    //************************************************//
    @GetMapping("/total-count")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getTotalEmployeeCount(HttpServletRequest httpRequest) {
        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        int totalEmployee = employeeService.getTotalEmployees(organizationUuid);
        return new ResponseEntity<>(
                new StandardResponse(200, "Get total employees count successfully", totalEmployee),
                HttpStatus.OK
        );
    }

    //************************************************//
    //get count of total active employees//
    //************************************************//
    @GetMapping("/total-active-count")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getTotalActiveEmployeeCount(HttpServletRequest httpRequest) {
        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        int activeTotalEmployee = employeeService.getTotalActiveEmployees(organizationUuid);
        return new ResponseEntity<>(
                new StandardResponse(200, "Get total Active employees count successfully", activeTotalEmployee),
                HttpStatus.OK
        );
    }

}
