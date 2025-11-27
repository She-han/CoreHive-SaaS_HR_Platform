package com.corehive.backend.controller;

import com.corehive.backend.model.LeaveRequest;
import com.corehive.backend.service.LeaveService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "http://localhost:3000")
public class LeaveController {
    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    //HR can view all leave requests
    @GetMapping
    public List<LeaveRequest> getAllLeaves() {
        return leaveService.getAllLeaves();
    }

    // HR can view all leaves of a specific employee
    @GetMapping("/employee/{employeeId}")
    public List<LeaveRequest> getLeavesByEmployee(@PathVariable Long employeeId) {
        return leaveService.getLeavesByEmployee(employeeId);
    }

    //HR can view leaves by status (PENDING, APPROVED, REJECTED)
    @GetMapping("/status/{status}")
    public List<LeaveRequest> getLeavesByStatus(@PathVariable LeaveRequest.LeaveStatus status) {
        return leaveService.getLeavesByStatus(status);
    }

    // HR approves a leave request
    @PutMapping("/{id}/approve")
    public LeaveRequest approveLeave(@PathVariable Long id, @RequestBody Map<String, Long> approver) {
        return leaveService.approveLeave(id, approver.get("approvedBy"));
    }

    // HR rejects a leave request
    @PutMapping("/{id}/reject")
    public LeaveRequest rejectLeave(@PathVariable Long id, @RequestBody Map<String, String> reason) {
        return leaveService.rejectLeave(id, reason.get("reason"));
    }

    // HR deletes a leave record
    @DeleteMapping("/{id}")
    public void deleteLeave(@PathVariable Long id) {
        leaveService.deleteLeave(id);
    }
}
