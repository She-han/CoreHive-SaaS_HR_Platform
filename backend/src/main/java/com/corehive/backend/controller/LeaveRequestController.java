package com.corehive.backend.controller;

import com.corehive.backend.dto.request.CreateLeaveRequestDTO;
import com.corehive.backend.service.LeaveRequestService;
import com.corehive.backend.util.StandardResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leave-requests")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    // /////////////////////////////////////////////
    // CREATE LEAVE REQUEST
    // ////////////////////////////////////////////
    @PostMapping
//    @PreAuthorize("hasRole('EMPLOYEE')")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')") //For the development
    public ResponseEntity<StandardResponse> createLeave(
            HttpServletRequest request,
            @RequestBody CreateLeaveRequestDTO dto
    ) {
        String orgUuid = (String) request.getAttribute("organizationUuid");

        leaveRequestService.createLeaveRequest(orgUuid, dto);

        return ResponseEntity.ok(
                new StandardResponse(200, "Leave request submitted", null)
        );
    }

    // /////////////////////////////////////////////
    // GET ALL LEAVE REQUESTS
    // ////////////////////////////////////////////
    @GetMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getAllLeaves(HttpServletRequest request) {

        String orgUuid = (String) request.getAttribute("organizationUuid");

        return ResponseEntity.ok(
                new StandardResponse(
                        200,
                        "Leave requests loaded",
                        leaveRequestService.getAllRequests(orgUuid)
                )
        );
    }

    // /////////////////////////////////////////////
    // APPROVE LEAVE REQUEST
    // ////////////////////////////////////////////
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> approveLeave(
            @PathVariable Long id,
            @RequestParam boolean approve,
            HttpServletRequest request
    ) {
        Long approverId = (Long) request.getAttribute("userId");
        leaveRequestService.approveLeave(id, approverId, approve);

        return ResponseEntity.ok(
                new StandardResponse(200, "Leave request updated", null)
        );
    }
}
