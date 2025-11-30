package com.corehive.backend.dto;

import com.corehive.backend.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.security.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PayrollRecordDTO {
    private Long id;
    private  Long employeeId;
    private String employeeName;
    private int periodYear;
    private int periodMonth;
    private BigDecimal basicSalary;
    private BigDecimal allowances;
    private BigDecimal deductions;
    private BigDecimal netSalary;
    private PaymentStatus paymentStatus;
    private Timestamp createdAt;
}

