package com.corehive.backend.repository;

import com.corehive.backend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByAttendanceDate(LocalDate date);

}
