package com.corehive.backend.service;

import com.corehive.backend.model.LeaveType;
import com.corehive.backend.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveTypeService {

    private final LeaveTypeRepository leaveTypeRepository;

    public List<LeaveType> getActiveLeaveTypes(String organizationUuid) {
        return leaveTypeRepository.findByOrganizationUuidAndIsActiveTrue(organizationUuid);
    }

    public List<LeaveType> getLeaveTypes(String organizationUuid) {
        return leaveTypeRepository.findByOrganizationUuidAndIsActiveTrue(organizationUuid);
    }

    public LeaveType findById(Long id) {
        return leaveTypeRepository.findById(id).orElse(null);
    }

    @Transactional
    public LeaveType createLeaveType(LeaveType leaveType, String organizationUuid) {
        leaveType.setOrganizationUuid(organizationUuid);
        leaveType.setIsActive(true);
        leaveType.setCreatedAt(LocalDateTime.now());
        return leaveTypeRepository.save(leaveType);
    }

    @Transactional
    public LeaveType updateLeaveType(Long id, LeaveType leaveType, String organizationUuid) {
        LeaveType existing = leaveTypeRepository.findById(id)
                .filter(lt -> lt.getOrganizationUuid().equals(organizationUuid))
                .orElseThrow(() -> new RuntimeException("Leave type not found"));

        existing.setName(leaveType.getName());
        existing.setCode(leaveType.getCode());
        existing.setDefaultDaysPerYear(leaveType.getDefaultDaysPerYear());
        existing.setRequiresApproval(leaveType.getRequiresApproval());

        return leaveTypeRepository.save(existing);
    }

    @Transactional
    public void deleteLeaveType(Long id, String organizationUuid) {
        LeaveType leaveType = leaveTypeRepository.findById(id)
                .filter(lt -> lt.getOrganizationUuid().equals(organizationUuid))
                .orElseThrow(() -> new RuntimeException("Leave type not found"));

        leaveType.setIsActive(false);
        leaveTypeRepository.save(leaveType);
    }
}
