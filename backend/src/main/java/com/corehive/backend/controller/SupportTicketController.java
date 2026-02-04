package com.corehive.backend.controller;

import com.corehive.backend.dto.request.CreateSupportTicketDTO;
import com.corehive.backend.model.AppUser;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.Organization;
import com.corehive.backend.model.SupportTicket;
import com.corehive.backend.repository.AppUserRepository;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.repository.OrganizationRepository;
import com.corehive.backend.service.SupportTicketService;
import com.corehive.backend.util.StandardResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/support-tickets")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SupportTicketController {

    private final SupportTicketService supportTicketService;
    private final AppUserRepository appUserRepository;
    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;

    /**
     * Create a new support ticket (All authenticated users)
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StandardResponse> createTicket(
            HttpServletRequest request,
            @RequestBody CreateSupportTicketDTO dto
    ) {
        Long userId = (Long) request.getAttribute("userId");
        String userEmail = (String) request.getAttribute("userEmail");
        String userRole = (String) request.getAttribute("userRole");
        String organizationUuid = (String) request.getAttribute("organizationUuid");

        // Fetch user details
        String userName = userEmail; // Default to email
        String organizationName = "Unknown Organization";

        // Try to get name from AppUser/Employee
        Optional<AppUser> appUserOpt = appUserRepository.findById(userId);
        if (appUserOpt.isPresent()) {
            AppUser appUser = appUserOpt.get();
            
            // If user has linked employee, get employee name
            if (appUser.getLinkedEmployeeId() != null) {
                Optional<Employee> employeeOpt = employeeRepository.findById(appUser.getLinkedEmployeeId());
                if (employeeOpt.isPresent()) {
                    Employee employee = employeeOpt.get();
                    userName = employee.getFirstName() + " " + employee.getLastName();
                }
            }
        }

        // Get organization name
        if (organizationUuid != null) {
            Optional<Organization> orgOpt = organizationRepository.findByOrganizationUuid(organizationUuid);
            if (orgOpt.isPresent()) {
                organizationName = orgOpt.get().getName();
            }
        }

        return new ResponseEntity<>(
                new StandardResponse(
                        201,
                        "Support ticket created successfully",
                        supportTicketService.createTicket(dto, userId, userName, userEmail, userRole, organizationUuid, organizationName)
                ),
                HttpStatus.CREATED
        );
    }

    /**
     * Get all tickets with pagination (System Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<StandardResponse> getAllTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return new ResponseEntity<>(
                new StandardResponse(
                        200,
                        "Tickets fetched successfully",
                        supportTicketService.getAllTickets(page, size)
                ),
                HttpStatus.OK
        );
    }

    /**
     * Get tickets by type (System Admin only)
     */
    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<StandardResponse> getTicketsByType(
            @PathVariable SupportTicket.TicketType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return new ResponseEntity<>(
                new StandardResponse(
                        200,
                        "Tickets fetched successfully",
                        supportTicketService.getTicketsByType(type, page, size)
                ),
                HttpStatus.OK
        );
    }

    /**
     * Get tickets by status (System Admin only)
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<StandardResponse> getTicketsByStatus(
            @PathVariable SupportTicket.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return new ResponseEntity<>(
                new StandardResponse(
                        200,
                        "Tickets fetched successfully",
                        supportTicketService.getTicketsByStatus(status, page, size)
                ),
                HttpStatus.OK
        );
    }

    /**
     * Get user's own tickets
     */
    @GetMapping("/my-tickets")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StandardResponse> getUserTickets(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        
        return new ResponseEntity<>(
                new StandardResponse(
                        200,
                        "Your tickets fetched successfully",
                        supportTicketService.getUserTickets(userId)
                ),
                HttpStatus.OK
        );
    }

    /**
     * Search tickets (System Admin only)
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<StandardResponse> searchTickets(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return new ResponseEntity<>(
                new StandardResponse(
                        200,
                        "Search results",
                        supportTicketService.searchTickets(query, page, size)
                ),
                HttpStatus.OK
        );
    }

    /**
     * Get ticket by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<StandardResponse> getTicketById(@PathVariable Long id) {
        return new ResponseEntity<>(
                new StandardResponse(
                        200,
                        "Ticket fetched successfully",
                        supportTicketService.getTicketById(id)
                ),
                HttpStatus.OK
        );
    }

    /**
     * Mark ticket as read (System Admin only)
     */
    @PutMapping("/{id}/mark-read")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<StandardResponse> markAsRead(@PathVariable Long id) {
        return new ResponseEntity<>(
                new StandardResponse(
                        200,
                        "Ticket marked as read",
                        supportTicketService.markAsRead(id)
                ),
                HttpStatus.OK
        );
    }

    /**
     * Reply to ticket (System Admin only)
     */
    @PutMapping("/{id}/reply")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<StandardResponse> replyToTicket(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        Long adminId = (Long) request.getAttribute("userId");
        String reply = body.get("reply");

        return new ResponseEntity<>(
                new StandardResponse(
                        200,
                        "Reply submitted successfully",
                        supportTicketService.replyToTicket(id, reply, adminId)
                ),
                HttpStatus.OK
        );
    }

    /**
     * Update ticket status (System Admin only)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<StandardResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        SupportTicket.Status status = SupportTicket.Status.valueOf(body.get("status"));

        return new ResponseEntity<>(
                new StandardResponse(
                        200,
                        "Ticket status updated",
                        supportTicketService.updateTicketStatus(id, status)
                ),
                HttpStatus.OK
        );
    }

    /**
     * Get unread count (System Admin only)
     */
    @GetMapping("/unread-count")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<StandardResponse> getUnreadCount() {
        return new ResponseEntity<>(
                new StandardResponse(
                        200,
                        "Unread count",
                        supportTicketService.getUnreadCount()
                ),
                HttpStatus.OK
        );
    }

    /**
     * Delete ticket (System Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<StandardResponse> deleteTicket(@PathVariable Long id) {
        supportTicketService.deleteTicket(id);
        return new ResponseEntity<>(
                new StandardResponse(
                        200,
                        "Ticket deleted successfully",
                        null
                ),
                HttpStatus.OK
        );
    }
}
