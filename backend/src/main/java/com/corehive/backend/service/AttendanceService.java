package com.corehive.backend.service;

import com.corehive.backend.dto.AttendanceRowDto;
import com.corehive.backend.dto.DailyMonitorDto;
import com.corehive.backend.dto.DailySummaryCountDTO;
import com.corehive.backend.model.Attendance;
import com.corehive.backend.repository.AttendanceRepository;
import com.corehive.backend.repository.DepartmentRepository;
import com.corehive.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public DailyMonitorDto getAttendance(LocalDate date) {

        List<Attendance> records = attendanceRepository.findByAttendanceDate(date);

        List<AttendanceRowDto> rows = new ArrayList<>();

        int present = 0, absent = 0, leave = 0, holiday = 0;

        for (Attendance r : records) {

            String checkIn = (r.getCheckInTime() != null) ? r.getCheckInTime().toString() : null;
            String checkOut = (r.getCheckOutTime() != null) ? r.getCheckOutTime().toString() : null;

            Integer workingMinutes = null;
            if (r.getCheckInTime() != null && r.getCheckOutTime() != null) {
                workingMinutes = (int) Duration.between(r.getCheckInTime(), r.getCheckOutTime()).toMinutes();
            }

            // COUNT SUMMARY
            switch (r.getStatus()) {
                case PRESENT -> present++;
                case ABSENT -> absent++;
                case LEAVE -> leave++;
                case HOLIDAY -> holiday++;
            }

            // FETCH EMPLOYEE
            var emp = employeeRepository.findById(r.getEmployeeId()).orElse(null);

            String empName = "Unknown";
            String deptName = "Unknown";

            if (emp != null) {
                empName = emp.getFirstName() + " " + emp.getLastName();

                if (emp.getDepartmentId() != null) {
                    var dept = departmentRepository.findById(emp.getDepartmentId()).orElse(null);
                    if (dept != null) deptName = dept.getName();
                }
            }

            // BUILD ROW
            rows.add(new AttendanceRowDto(
                    r.getEmployeeId(),
                    empName,
                    deptName,                     // placeholder
                    checkIn,
                    checkOut,
                    workingMinutes,
                    r.getStatus().name()
            ));
        }

        Map<String, Integer> summary = new HashMap<>();
        summary.put("present", present);
        summary.put("absent", absent);
        summary.put("late", 0);
        summary.put("onLeave", leave);

        return new DailyMonitorDto(date.toString(), summary, rows);
    }

    public DailySummaryCountDTO getTodaySummary(LocalDate date) {

        List<AttendanceRowDto> list = getAttendance(date).getData();

        int present = 0;
        int late = 0;
        int leave = 0;
        int absent = 0;

        for (AttendanceRowDto row : list) {
            switch (row.getStatus().toLowerCase()) {
                case "present":
                    present++;
                    break;
                case "late":
                    late++;
                    break;
                case "leave":
                    leave++;
                    break;
                case "absent":
                    absent++;
                    break;
            }
        }

        return new DailySummaryCountDTO(present, late, leave, absent);
    }

}
