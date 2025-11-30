package com.corehive.backend.service;

import com.corehive.backend.dto.PayrollRecordDTO;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.PaymentStatus;
import com.corehive.backend.model.PayrollRecord;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.repository.PayrollRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final EmployeeRepository employeeRepo;
    private final PayrollRecordRepository payrollRepo;

    // -------------------------------------------------------
    //  RUN MONTHLY PAYROLL
    // -------------------------------------------------------
    @Transactional
    public void runMonthlyPayroll(int year, int month) {

        // Load existing payrolls for the month
        List<PayrollRecord> existing = payrollRepo.findByPeriodYearAndPeriodMonth(year, month);

        Map<Long, PayrollRecord> existingMap = existing.stream()
                .collect(Collectors.toMap(PayrollRecord::getEmployeeId, r -> r));

        List<Employee> employees = employeeRepo.findAll();

        for (Employee emp : employees) {

            PayrollRecord record = existingMap.get(emp.getId());

            // If no payroll → create one
            if (record == null) {
                record = new PayrollRecord();
                record.setPaymentStatus(PaymentStatus.PENDING);
            }

            BigDecimal basic = emp.getBasicSalary() != null ? emp.getBasicSalary() : BigDecimal.ZERO;
            BigDecimal allowance = emp.getAllowances() != null ? emp.getAllowances() : BigDecimal.ZERO;
            BigDecimal deduction = emp.getDeductions() != null ? emp.getDeductions() : BigDecimal.ZERO;

            BigDecimal net = basic.add(allowance).subtract(deduction);

            record.setOrganizationUuid(emp.getOrganizationUuid());
            record.setEmployeeId(emp.getId());
            record.setPeriodYear(year);
            record.setPeriodMonth(month);
            record.setBasicSalary(basic);
            record.setAllowances(allowance);
            record.setDeductions(deduction);
            record.setNetSalary(net);

            payrollRepo.save(record);
        }
    }


    // -------------------------------------------------------
    //  GET PAYSLIPS FOR A MONTH
    // -------------------------------------------------------
    public List<PayrollRecordDTO> getPayslips(int year, int month) {

        //loads all payroll entries created for that specific month.
        List<PayrollRecord> records =
                payrollRepo.findByPeriodYearAndPeriodMonth(year, month);

        // Find employees by IDs used in payroll
        Map<Long, Employee> empMap = employeeRepo.findAllById(
                records.stream()//Turns the list of employees into a stream so we can process each employee one by one.
                        .map(PayrollRecord::getEmployeeId)
                        .collect(Collectors.toSet()) //A Set contains unique values (no duplicates) and Order is not guaranteed
        ).stream().collect(Collectors.toMap(Employee::getId, e -> e)); //Use the entire Employee object as the value

        //convert the stream into a Map , Map means key → value pairs

        return records.stream().map(r -> {

            Employee e = empMap.get(r.getEmployeeId()); //Find the employee object for this payroll record using employeeId.

            PayrollRecordDTO dto = new PayrollRecordDTO();
            dto.setId(r.getId());
            dto.setEmployeeId(r.getEmployeeId());

            if (e != null) {
                dto.setEmployeeName(e.getFirstName() + " " + e.getLastName());
            } else {
                dto.setEmployeeName("Unknown Employee");
            }

            dto.setPeriodYear(r.getPeriodYear());
            dto.setPeriodMonth(r.getPeriodMonth());
            dto.setBasicSalary(r.getBasicSalary());
            dto.setAllowances(r.getAllowances());
            dto.setDeductions(r.getDeductions());
            dto.setNetSalary(r.getNetSalary());
            dto.setPaymentStatus(r.getPaymentStatus());
            dto.setCreatedAt(r.getCreatedAt());

            return dto;

        }).collect(Collectors.toList()); //Convert all DTOs into a List and return it.
    }

    // -------------------------------------------------------
    //  returns every payroll record in the database,
    //  for all employees and all months.
    // -------------------------------------------------------
    public List<PayrollRecordDTO> allPayslips() {

        List<PayrollRecord> records = payrollRepo.findAll(); //Get every row from payroll_records table

        Map<Long, Employee> empMap = employeeRepo.findAllById(
                records.stream()
                        .map(PayrollRecord::getEmployeeId) // Long ✔
                        .collect(Collectors.toSet())//Take all employeeIds from payroll, remove duplicates.
        ).stream().collect(Collectors.toMap(Employee::getId, e -> e));

//        Get all Employee objects for the employeeIds.
//        Put them into a Map for fast lookup.

        //Map will look like:
//        {
//                5: Employee(id=5, firstName="John"),
//                7: Employee(id=7, firstName="Sara"),
//                10: Employee(id=10, firstName="Nimal")
//        }


        //Take each payroll record and turn it into a DTO (data for frontend).
        return records.stream().map(r -> {

            Employee e = empMap.get(r.getEmployeeId());

            PayrollRecordDTO dto = new PayrollRecordDTO();
            dto.setId(r.getId());
            dto.setEmployeeId(r.getEmployeeId());
            dto.setEmployeeName(
                    e != null ? (e.getFirstName() + " " + e.getLastName()) : "Unknown"
            );
            dto.setPeriodYear(r.getPeriodYear());
            dto.setPeriodMonth(r.getPeriodMonth());
            dto.setBasicSalary(r.getBasicSalary());
            dto.setAllowances(r.getAllowances());
            dto.setDeductions(r.getDeductions());
            dto.setNetSalary(r.getNetSalary());
            dto.setPaymentStatus(r.getPaymentStatus());
            dto.setCreatedAt(r.getCreatedAt());
            return dto;

        }).collect(Collectors.toList());
    }

    // -------------------------------------------------------
    //  MARK AS PAID
    // -------------------------------------------------------
    @Transactional
    public void markAsPaid(Long payrollId, Integer processedBy) {
        payrollRepo.findById(payrollId).ifPresent(r -> {
            r.setPaymentStatus(PaymentStatus.PAID);
            r.setProcessedBy(processedBy);
            payrollRepo.save(r);
        });
    }

//    payrollId → which payroll record to update
//    processedBy → which admin/HR user updated it
}
