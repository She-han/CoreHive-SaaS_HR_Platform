package com.corehive.backend.service.impl;

import com.corehive.backend.dto.request.EmployeeFeedbackRequest;
import com.corehive.backend.dto.response.EmployeeFeedbackResponseDTO;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.EmployeeFeedback;
import com.corehive.backend.repository.EmployeeFeedbackRepository;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.service.EmployeeFeedbackService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeFeedbackServiceImpl implements EmployeeFeedbackService {

    private final EmployeeFeedbackRepository feedbackRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeFeedbackServiceImpl(EmployeeFeedbackRepository feedbackRepository,
                                       EmployeeRepository employeeRepository) {
        this.feedbackRepository = feedbackRepository;
        this.employeeRepository = employeeRepository;
    }

    // ---------------- CREATE ----------------
    @Override
    public EmployeeFeedbackResponseDTO saveFeedback(EmployeeFeedbackRequest request) {

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        EmployeeFeedback feedback = new EmployeeFeedback();
        feedback.setEmployee(employee);
        feedback.setRating(request.getRating());
        feedback.setFeedbackType(request.getFeedbackType());
        feedback.setMessage(request.getMessage());
        feedback.setCreatedAt(LocalDateTime.now());

        return mapToDTO(feedbackRepository.save(feedback));
    }


    // ---------------- GET ALL ----------------
    @Override
    public List<EmployeeFeedbackResponseDTO> getAllFeedbacks() {
        return feedbackRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ---------------- GET BY EMPLOYEE ----------------
    @Override
    public List<EmployeeFeedbackResponseDTO> getFeedbacksByEmployee(Long employeeId) {
        return feedbackRepository.findByEmployeeId(employeeId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ---------------- MAPPER ----------------
    private EmployeeFeedbackResponseDTO mapToDTO(EmployeeFeedback feedback) {
        EmployeeFeedbackResponseDTO dto = new EmployeeFeedbackResponseDTO();
        dto.setId(feedback.getId());
        dto.setRating(feedback.getRating());
        dto.setFeedbackType(feedback.getFeedbackType());
        dto.setMessage(feedback.getMessage());
        dto.setCreatedAt(feedback.getCreatedAt());
        return dto;
    }
}
