package com.corehive.backend.service;

import com.corehive.backend.dto.AttendanceRowDto;
import com.corehive.backend.dto.DailyMonitorDto;
import com.corehive.backend.dto.DailySummaryCountDTO;
import com.corehive.backend.model.Attendance;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.Department;
import com.corehive.backend.repository.AttendanceRepository;
import com.corehive.backend.repository.DepartmentRepository;
import com.corehive.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    //************************************************//
    // GET DAILY ATTENDANCE
    //************************************************//
    public DailyMonitorDto getAttendance(LocalDate date) {

        List<Attendance> records = attendanceRepository.findByAttendanceDate(date);
        List<AttendanceRowDto> rows = new ArrayList<>();

        int present = 0, absent = 0, leave = 0, holiday = 0;

        for (Attendance r : records) {

            // Convert times to string
            String checkIn = r.getCheckInTime() != null ? r.getCheckInTime().toString() : null;
            String checkOut = r.getCheckOutTime() != null ? r.getCheckOutTime().toString() : null;

            // Calculate working minutes
            Integer workingMinutes = null;
            if (r.getCheckInTime() != null && r.getCheckOutTime() != null) {
                workingMinutes = (int) Duration.between(r.getCheckInTime(), r.getCheckOutTime()).toMinutes();
            }

            // Update summary counts
            switch (r.getStatus()) {
                case PRESENT -> present++;
                case ABSENT -> absent++;
                case LEAVE -> leave++;
                case HOLIDAY -> holiday++;
            }

            // Fetch employee
            Employee emp = employeeRepository.findById(r.getEmployeeId()).orElse(null);

            String empName = "Unknown";
            String deptName = "Unknown";

            if (emp != null) {
                empName = emp.getFirstName() + " " + emp.getLastName();

                if (emp.getDepartment() != null) {
                    Department dept = emp.getDepartment();
                    deptName = dept.getName();
                }
            }

            // Build row
            rows.add(new AttendanceRowDto(
                    r.getEmployeeId(),
                    empName,
                    deptName,
                    checkIn,
                    checkOut,
                    workingMinutes,
                    r.getStatus().name()
            ));
        }

        Map<String, Integer> summary = new HashMap<>();
        summary.put("present", present);
        summary.put("absent", absent);
        summary.put("late", 0); // Currently static, can calculate later
        summary.put("onLeave", leave);
        summary.put("holiday", holiday);

        return new DailyMonitorDto(date.toString(), summary, rows);
    }

    //************************************************//
    // GET TODAY SUMMARY
    //************************************************//
    public DailySummaryCountDTO getTodaySummary(LocalDate date) {

        List<AttendanceRowDto> list = getAttendance(date).getData();

        int present = 0, late = 0, leave = 0, absent = 0;

        for (AttendanceRowDto row : list) {
            switch (row.getStatus().toLowerCase()) {
                case "present" -> present++;
                case "late" -> late++;
                case "leave" -> leave++;
                case "absent" -> absent++;
            }
        }

        return new DailySummaryCountDTO(present, late, leave, absent);
    }

}
