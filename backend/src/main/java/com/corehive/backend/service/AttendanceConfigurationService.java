package com.corehive.backend.service;

import com.corehive.backend.model.AttendanceConfiguration;
import com.corehive.backend.model.Employee;
import com.corehive.backend.repository.AttendanceConfigurationRepository;
import com.corehive.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceConfigurationService {

    private final AttendanceConfigurationRepository configRepository;
    private final EmployeeRepository employeeRepository;

    public List<AttendanceConfiguration> getAllConfigurations(String organizationUuid) {
        return configRepository.findByOrganizationUuidAndIsActiveTrue(organizationUuid);
    }

    public AttendanceConfiguration getConfigurationById(Long id, String organizationUuid) {
        return configRepository.findById(id)
                .filter(config -> config.getOrganizationUuid().equals(organizationUuid))
                .orElseThrow(() -> new RuntimeException("Configuration not found"));
    }

    @Transactional
    public AttendanceConfiguration createConfiguration(AttendanceConfiguration config, String organizationUuid) {
        config.setOrganizationUuid(organizationUuid);
        config.setIsActive(true);
        config.setCreatedAt(LocalDateTime.now());
        config.setUpdatedAt(LocalDateTime.now());
        
        return configRepository.save(config);
    }

    @Transactional
    public AttendanceConfiguration updateConfiguration(Long id, AttendanceConfiguration config, String organizationUuid) {
        AttendanceConfiguration existing = getConfigurationById(id, organizationUuid);
        
        existing.setName(config.getName());
        existing.setWorkStartTime(config.getWorkStartTime());
        existing.setWorkEndTime(config.getWorkEndTime());
        existing.setLateThreshold(config.getLateThreshold());
        existing.setEveningHalfDayThreshold(config.getEveningHalfDayThreshold());
        existing.setAbsentThreshold(config.getAbsentThreshold());
        existing.setMorningHalfDayThreshold(config.getMorningHalfDayThreshold());
        existing.setOtStartTime(config.getOtStartTime());
        existing.setLeaveDeductionAmount(config.getLeaveDeductionAmount());
        existing.setApplicationType(config.getApplicationType());
        existing.setDepartmentId(config.getDepartmentId());
        existing.setDesignation(config.getDesignation());
        existing.setEmployeeId(config.getEmployeeId());
        existing.setUpdatedAt(LocalDateTime.now());
        
        return configRepository.save(existing);
    }

    @Transactional
    public void deleteConfiguration(Long id, String organizationUuid) {
        AttendanceConfiguration config = getConfigurationById(id, organizationUuid);
        config.setIsActive(false);
        config.setUpdatedAt(LocalDateTime.now());
        configRepository.save(config);
    }

    /**
     * Find the most specific applicable configuration for an employee
     * Priority: Employee-specific > Designation > Department > Organization-wide
     */
    public Optional<AttendanceConfiguration> getApplicableConfiguration(Long employeeId, String organizationUuid) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        List<AttendanceConfiguration> configs = configRepository.findApplicableConfigurations(
                organizationUuid,
                employeeId,
                employee.getDepartmentId(),
                employee.getDesignation()
        );

        return configs.isEmpty() ? Optional.empty() : Optional.of(configs.get(0));
    }
}
