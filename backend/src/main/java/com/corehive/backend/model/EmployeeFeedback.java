package com.corehive.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "employee_feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer rating;

    @Enumerated(EnumType.STRING)
    @Column(name = "feedback_type", length = 50)
    private FeedbackType feedbackType;

    @Column(length = 1000)
    private String message;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
}
