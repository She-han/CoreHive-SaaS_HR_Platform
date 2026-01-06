package com.corehive.backend.repository;

import com.corehive.backend.model.EmployeeFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeFeedbackRepository
        extends JpaRepository<EmployeeFeedback, Long> {

    List<EmployeeFeedback> findByEmployeeId(Long employeeId);
}

