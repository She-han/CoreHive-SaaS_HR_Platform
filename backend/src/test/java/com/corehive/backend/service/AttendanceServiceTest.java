package com.corehive.backend.service;

import com.corehive.backend.model.Attendance.AttendanceStatus;
import com.corehive.backend.repository.AttendanceRepository;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.repository.LeaveRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;
    
    @Mock
    private EmployeeRepository employeeRepository;
    
    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @Mock
    private AttendanceConfigurationService attendanceConfigurationService;

    @InjectMocks
    private AttendanceService attendanceService;

    private final String ORG_UUID = "test-org-uuid";
    private LocalDate testDate;

    @BeforeEach
    void setUp() {
        testDate = LocalDate.of(2026, 3, 16);
    }

    @Test
    void testGetTodaySummary_Success() {
        // Arrange
        // Simulate DB returning exact count formats for PRESENT (5), LATE (2), ON_LEAVE (1)
        List<Object[]> mockDbResults = new ArrayList<>();
        mockDbResults.add(new Object[]{AttendanceStatus.PRESENT, 5L});
        mockDbResults.add(new Object[]{AttendanceStatus.LATE, 2L});
        mockDbResults.add(new Object[]{AttendanceStatus.ON_LEAVE, 1L});
        
        when(attendanceRepository.countByStatus(ORG_UUID, testDate))
                .thenReturn(mockDbResults);

        // Act
        Map<String, Long> summary = attendanceService.getTodaySummary(ORG_UUID, testDate);

        // Assert
        assertNotNull(summary, "Summary should not be null");
        assertEquals(5L, summary.get("PRESENT"), "PRESENT count should be 5");
        assertEquals(2L, summary.get("LATE"), "LATE count should be 2");
        assertEquals(1L, summary.get("ON_LEAVE"), "ON_LEAVE count should be 1");
        
        // Assert that unprovided statuses are defaulted to 0L
        assertEquals(0L, summary.get("ABSENT"), "Unprovided counts should default to 0");
        assertEquals(0L, summary.get("HALF_DAY"), "Unprovided counts should default to 0");
        
        // Verify mock interaction
        verify(attendanceRepository, times(1)).countByStatus(ORG_UUID, testDate);
    }

    @Test
    void testGetTodaySummary_EmptyResults() {
        // Arrange
        // Simulate a day where no one has marked attendance yet
        when(attendanceRepository.countByStatus(ORG_UUID, testDate))
                .thenReturn(new ArrayList<>());

        // Act
        Map<String, Long> summary = attendanceService.getTodaySummary(ORG_UUID, testDate);

        // Assert
        assertNotNull(summary);
        assertEquals(0L, summary.get("PRESENT"), "Must be 0 when no records");
        assertEquals(0L, summary.get("ABSENT"), "Must be 0 when no records");
        assertEquals(0L, summary.get("LATE"), "Must be 0 when no records");
        
        verify(attendanceRepository, times(1)).countByStatus(ORG_UUID, testDate);
    }
}
