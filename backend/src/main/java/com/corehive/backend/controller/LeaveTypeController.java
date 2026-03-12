package com.corehive.backend.controller;

import com.corehive.backend.model.LeaveType;
import com.corehive.backend.service.LeaveTypeService;
import com.corehive.backend.util.StandardResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leave-types")
@RequiredArgsConstructor
public class LeaveTypeController {
    private final LeaveTypeService leaveTypeService;

    @GetMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getLeaveTypes(HttpServletRequest request) {

        String orgUuid = (String) request.getAttribute("organizationUuid");

        return ResponseEntity.ok(
                new StandardResponse(
                        200,
                        "Leave types loaded",
                        leaveTypeService.getLeaveTypes(orgUuid)
                )
        );
    }
    
    @GetMapping("/active")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getActiveLeaveTypes(HttpServletRequest request) {

        String orgUuid = (String) request.getAttribute("organizationUuid");

        return ResponseEntity.ok(
                new StandardResponse(
                        200,
                        "Active leave types loaded",
                        leaveTypeService.getActiveLeaveTypes(orgUuid)
                )
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<StandardResponse> createLeaveType(
            @RequestBody LeaveType leaveType,
            HttpServletRequest request) {

        String orgUuid = (String) request.getAttribute("organizationUuid");

        return ResponseEntity.ok(
                new StandardResponse(
                        201,
                        "Leave type created successfully",
                        leaveTypeService.createLeaveType(leaveType, orgUuid)
                )
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<StandardResponse> updateLeaveType(
            @PathVariable Long id,
            @RequestBody LeaveType leaveType,
            HttpServletRequest request) {

        String orgUuid = (String) request.getAttribute("organizationUuid");

        return ResponseEntity.ok(
                new StandardResponse(
                        200,
                        "Leave type updated successfully",
                        leaveTypeService.updateLeaveType(id, leaveType, orgUuid)
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<StandardResponse> deleteLeaveType(
            @PathVariable Long id,
            HttpServletRequest request) {

        String orgUuid = (String) request.getAttribute("organizationUuid");
        leaveTypeService.deleteLeaveType(id, orgUuid);

        return ResponseEntity.ok(
                new StandardResponse(
                        200,
                        "Leave type deleted successfully",
                        null
                )
        );
    }
}
