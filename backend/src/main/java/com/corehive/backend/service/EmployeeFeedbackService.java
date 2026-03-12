package com.corehive.backend.service;

import com.corehive.backend.dto.request.EmployeeFeedbackRequest;
import com.corehive.backend.dto.response.EmployeeFeedbackResponseDTO;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.EmployeeFeedback;
import com.corehive.backend.repository.EmployeeFeedbackRepository;
import com.corehive.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmployeeFeedbackService {

    private final EmployeeFeedbackRepository feedbackRepository;
    private final EmployeeRepository employeeRepository;
    
    private static final int MAX_FEEDBACKS_PER_MONTH = 3;

    // ---------------- CREATE ----------------
    @Transactional
    public EmployeeFeedbackResponseDTO saveFeedback(EmployeeFeedbackRequest request, Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        // Check monthly limit
        LocalDateTime now = LocalDateTime.now();
        Long count = feedbackRepository.countByEmployeeIdAndMonthAndYear(
            employeeId, 
            now.getMonthValue(), 
            now.getYear()
        );
        
        if (count >= MAX_FEEDBACKS_PER_MONTH) {
            throw new RuntimeException("You have reached the maximum limit of " + MAX_FEEDBACKS_PER_MONTH + " feedbacks per month");
        }

        EmployeeFeedback feedback = new EmployeeFeedback();
        feedback.setEmployee(employee);
        feedback.setRating(request.getRating());
        feedback.setFeedbackType(request.getFeedbackType());
        feedback.setMessage(request.getMessage());
        feedback.setMarkedAsRead(false);
        feedback.setCreatedAt(LocalDateTime.now());

        return mapToDTO(feedbackRepository.save(feedback));
    }


    // ---------------- GET ALL BY ORGANIZATION ----------------
    public List<EmployeeFeedbackResponseDTO> getAllFeedbacksByOrganization(String orgUuid) {
        return feedbackRepository.findByOrganizationUuid(orgUuid)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ---------------- GET BY EMPLOYEE ----------------
    public List<EmployeeFeedbackResponseDTO> getFeedbacksByEmployee(Long employeeId) {
        return feedbackRepository.findByEmployeeId(employeeId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    // ---------------- MARK AS READ ----------------
    @Transactional
    public EmployeeFeedbackResponseDTO markAsRead(Long feedbackId, String orgUuid) {
        EmployeeFeedback feedback = feedbackRepository.findById(feedbackId)
            .orElseThrow(() -> new RuntimeException("Feedback not found"));
        
        // Verify organization
        if (!feedback.getEmployee().getOrganizationUuid().equals(orgUuid)) {
            throw new RuntimeException("Unauthorized access to feedback");
        }
        
        feedback.setMarkedAsRead(true);
        return mapToDTO(feedbackRepository.save(feedback));
    }
    
    // ---------------- REPLY TO FEEDBACK ----------------
    @Transactional
    public EmployeeFeedbackResponseDTO replyToFeedback(Long feedbackId, String reply, Long repliedBy, String orgUuid) {
        EmployeeFeedback feedback = feedbackRepository.findById(feedbackId)
            .orElseThrow(() -> new RuntimeException("Feedback not found"));
        
        // Verify organization
        if (!feedback.getEmployee().getOrganizationUuid().equals(orgUuid)) {
            throw new RuntimeException("Unauthorized access to feedback");
        }
        
        feedback.setReply(reply);
        feedback.setRepliedBy(repliedBy);
        feedback.setRepliedAt(LocalDateTime.now());
        feedback.setMarkedAsRead(true); // Auto-mark as read when replying
        
        return mapToDTO(feedbackRepository.save(feedback));
    }

    // ---------------- MAPPER ----------------
    private EmployeeFeedbackResponseDTO mapToDTO(EmployeeFeedback feedback) {
        Employee employee = feedback.getEmployee();
        
        String repliedByName = feedback.getRepliedBy() != null ? "Admin" : null;
        
        return EmployeeFeedbackResponseDTO.builder()
            .id(feedback.getId())
            .employeeId(employee.getId())
            .employeeName(employee.getFirstName() + " " + employee.getLastName())
            .employeeCode(employee.getEmployeeCode())
            .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
            .feedbackType(feedback.getFeedbackType())
            .rating(feedback.getRating())
            .message(feedback.getMessage())
            .markedAsRead(feedback.getMarkedAsRead())
            .reply(feedback.getReply())
            .repliedByName(repliedByName)
            .repliedAt(feedback.getRepliedAt())
            .createdAt(feedback.getCreatedAt())
            .build();
    }
}
