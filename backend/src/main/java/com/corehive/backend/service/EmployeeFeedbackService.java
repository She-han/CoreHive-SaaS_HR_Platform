package com.corehive.backend.service;

import com.corehive.backend.dto.request.EmployeeFeedbackRequest;
import com.corehive.backend.dto.response.EmployeeFeedbackResponseDTO;

import java.util.List;

public interface EmployeeFeedbackService {

    EmployeeFeedbackResponseDTO saveFeedback(EmployeeFeedbackRequest request);

    List<EmployeeFeedbackResponseDTO> getAllFeedbacks();

    List<EmployeeFeedbackResponseDTO> getFeedbacksByEmployee(Long employeeId);
}
