package com.corehive.backend.service;

import com.corehive.backend.dto.AttendanceRowDto;
import com.corehive.backend.dto.DailyMonitorDto;
import com.corehive.backend.model.Attendance;
import com.corehive.backend.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

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

            // BUILD ROW
            rows.add(new AttendanceRowDto(
                    r.getEmployeeId(),
                    "Employee " + r.getEmployeeId(),  // replace with join if employee table exists
                    "Department",                     // placeholder
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
}
