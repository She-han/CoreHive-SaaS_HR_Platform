package com.corehive.backend.service;

import com.corehive.backend.model.LeaveType;
import com.corehive.backend.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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
}
