package com.corehive.backend.scheduler;

import com.corehive.backend.service.AttendanceService;
import com.corehive.backend.model.Organization;
import com.corehive.backend.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AttendanceScheduler {

    private final AttendanceService attendanceService;
    private final OrganizationRepository organizationRepository;

    /**
     * Scheduled job that runs daily at 11:59 PM to mark absent employees
     * This marks employees as ABSENT if they haven't checked in before the absent threshold
     */
    @Scheduled(cron = "0 59 23 * * *") // Runs at 11:59 PM every day
    public void markAbsentEmployeesDaily() {
        log.info("Starting daily absent marking job at {}", LocalDate.now());
        
        try {
            // Get all active organizations
            List<Organization> organizations = organizationRepository.findAll();
            
            int totalMarked = 0;
            for (Organization org : organizations) {
                try {
                    int marked = attendanceService.markAbsentEmployees(org.getOrganizationUuid(), LocalDate.now());
                    totalMarked += marked;
                    log.info("Marked {} employees as absent for organization: {}", marked, org.getName());
                } catch (Exception e) {
                    log.error("Error marking absent employees for organization {}: {}", org.getName(), e.getMessage());
                }
            }
            
            log.info("Completed daily absent marking job. Total employees marked: {}", totalMarked);
        } catch (Exception e) {
            log.error("Error in daily absent marking job: {}", e.getMessage(), e);
        }
    }

    /**
     * Optional: Run at specific time (e.g., after office hours)
     * This can be configured in application.properties
     */
    @Scheduled(cron = "${attendance.absent.mark.cron:0 0 19 * * *}") // Default: 7:00 PM
    public void markAbsentEmployeesAfterWorkHours() {
        log.info("Starting after-hours absent marking job at {}", LocalDate.now());
        
        try {
            List<Organization> organizations = organizationRepository.findAll();
            
            int totalMarked = 0;
            for (Organization org : organizations) {
                try {
                    int marked = attendanceService.markAbsentEmployees(org.getOrganizationUuid(), LocalDate.now());
                    if (marked > 0) {
                        totalMarked += marked;
                        log.info("Marked {} employees as absent for organization: {}", marked, org.getName());
                    }
                } catch (Exception e) {
                    log.error("Error marking absent employees for organization {}: {}", org.getName(), e.getMessage());
                }
            }
            
            if (totalMarked > 0) {
                log.info("Completed after-hours absent marking job. Total employees marked: {}", totalMarked);
            }
        } catch (Exception e) {
            log.error("Error in after-hours absent marking job: {}", e.getMessage(), e);
        }
    }
}
