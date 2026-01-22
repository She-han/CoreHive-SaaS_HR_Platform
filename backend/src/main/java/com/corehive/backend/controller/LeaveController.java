package com.corehive.backend.controller;

import com.corehive.backend.dto.request.LeaveRequestDTO;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.LeaveRequestResponseDTO;
import com.corehive.backend.dto.response.LeaveTypeResponseDTO;
import com.corehive.backend.model.LeaveRequest;
import com.corehive.backend.service.AuthService;
import com.corehive.backend.service.LeaveService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class LeaveController {
    private final LeaveService leaveService;
    private final AuthService authService;

    // ==================== EMPLOYEE ENDPOINTS ====================

    /**
     * Employee submits a leave request
     */
    @PostMapping("/employee/leave-requests")
    public ResponseEntity<ApiResponse<LeaveRequestResponseDTO>> submitLeaveRequest(
            @RequestBody LeaveRequestDTO requestDTO) {
        ApiResponse<LeaveRequestResponseDTO> response = leaveService.submitLeaveRequest(requestDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * Employee gets their leave request history
     */
    @GetMapping("/employee/leave-requests/{employeeId}")
    public ResponseEntity<ApiResponse<List<LeaveRequestResponseDTO>>> getEmployeeLeaveRequests(
            @PathVariable Long employeeId) {
        ApiResponse<List<LeaveRequestResponseDTO>> response = leaveService.getEmployeeLeaveRequests(employeeId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get leave types for organization
     */
    @GetMapping("/employee/leave-types")
    public ResponseEntity<ApiResponse<List<LeaveTypeResponseDTO>>> getLeaveTypes(HttpServletRequest request) {
        String organizationUuid = authService.getOrganizationUuidFromRequest(request);
        ApiResponse<List<LeaveTypeResponseDTO>> response = leaveService.getLeaveTypes(organizationUuid);
        return ResponseEntity.ok(response);
    }

    // ==================== HR/ADMIN ENDPOINTS ====================

    //HR can view all leave requests
    @GetMapping("/leaves")
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
