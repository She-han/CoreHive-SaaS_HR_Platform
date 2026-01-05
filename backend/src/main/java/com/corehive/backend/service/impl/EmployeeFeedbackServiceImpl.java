package com.corehive.backend.service.impl;

import com.corehive.backend.dto.request.EmployeeFeedbackRequest;
import com.corehive.backend.dto.response.EmployeeFeedbackResponseDTO;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.EmployeeFeedback;
import com.corehive.backend.repository.EmployeeFeedbackRepository;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.service.EmployeeFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeFeedbackServiceImp implements EmployeeFeedbackService {

    private final EmployeeFeedbackRepository feedbackRepo;
    private final EmployeeRepository employeeRepo;

    @Override
    public EmployeeFeedbackResponseDTO createFeedback(EmployeeFeedbackRequest dto) {

        Employee employee = employeeRepo.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        EmployeeFeedback feedback = new EmployeeFeedback();
        feedback.setEmployee(employee);
        feedback.setRating(dto.getRating());
        feedback.setFeedbackType(dto.getFeedbackType());
        feedback.setMessage(dto.getMessage());

        EmployeeFeedback saved = feedbackRepo.save(feedback);

        return mapToResponse(saved);
    }

    @Override
    public List<EmployeeFeedbackResponseDTO> getFeedbacksByEmployee(Long employeeId) {
        return feedbackRepo.findByEmployeeId(employeeId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<EmployeeFeedbackResponseDTO> getAllFeedbacks() {
        return feedbackRepo.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private EmployeeFeedbackResponseDTO mapToResponse(EmployeeFeedback feedback) {
        EmployeeFeedbackResponseDTO res = new EmployeeFeedbackResponseDTO();
        res.setId(feedback.getId());
        res.setEmployeeId(feedback.getEmployee().getId());
        res.setRating(feedback.getRating());
        res.setFeedbackType(feedback.getFeedbackType());
        res.setMessage(feedback.getMessage());
        res.setCreatedAt(feedback.getCreatedAt());
        return res;
    }
}
