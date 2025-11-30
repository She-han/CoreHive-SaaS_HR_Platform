package com.corehive.backend.controller;

import com.corehive.backend.dto.PayrollRecordDTO;
import com.corehive.backend.dto.RunPayrollDTO;
import com.corehive.backend.model.PayrollRecord;
import com.corehive.backend.repository.PayrollRecordRepository;
import com.corehive.backend.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PayrollController {
    private final PayrollService payrollService;
    private final PayrollRecordRepository payrollRepo;

    //runs payroll for selected year and month.
    @PostMapping("/run")
    public ResponseEntity<?> runPayroll(@RequestBody RunPayrollDTO dto) {
        payrollService.runMonthlyPayroll(dto.getYear(), dto.getMonth());
        return ResponseEntity.ok(Map.of("message", "Payroll generated"));
    }

    //returns all payslips for one month
    @GetMapping("/payslips")
    public ResponseEntity<List<PayrollRecordDTO>> payslips(
            @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(payrollService.getPayslips(year, month));
    }

    @GetMapping("/all")
    public ResponseEntity<List<PayrollRecord>> all() {
        return ResponseEntity.ok(payrollRepo.findAll());
    }

    //Marks a payslip as PAID for one employee
    @PostMapping("/{id}/pay")
    public ResponseEntity<?> markPaid(@PathVariable Long id, @RequestParam(required = false) Integer processedBy) {
        payrollService.markAsPaid(id, processedBy);
        return ResponseEntity.ok(Map.of("message", "Marked as PAID"));
    }
}

