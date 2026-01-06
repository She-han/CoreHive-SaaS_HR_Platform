package com.corehive.backend.controller;

import com.corehive.backend.service.LeaveTypeService;
import com.corehive.backend.util.StandardResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
