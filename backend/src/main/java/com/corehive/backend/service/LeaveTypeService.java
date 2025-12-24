package com.corehive.backend.service;

import com.corehive.backend.dto.LeaveTypeDTO;
import com.corehive.backend.exception.leaveException.LeaveTypeNotFoundException;
import com.corehive.backend.model.LeaveType;
import com.corehive.backend.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveTypeService {
    private final LeaveTypeRepository leaveTypeRepo;

//    ////////////////////////////////////
//     Fetch active leave types
//    ////////////////////////////////////

    public List<LeaveTypeDTO> getLeaveTypes(String orgUuid) {

        if (orgUuid == null || orgUuid.isBlank()) {
            throw new IllegalArgumentException("Organization UUID must not be null or empty");
        }

        List<LeaveType> leaveTypes =
                leaveTypeRepo.findByOrganizationUuidAndIsActiveTrue(orgUuid);

        if (leaveTypes.isEmpty()) {
            throw new LeaveTypeNotFoundException(
                    "No active leave types found for organization: " + orgUuid
            );
        }

        return leaveTypes.stream()
                .map(type -> {
                    LeaveTypeDTO dto = new LeaveTypeDTO();
                    dto.setId(type.getId());
                    dto.setName(type.getName());
                    dto.setCode(type.getCode());
                    dto.setDefaultDaysPerYear(type.getDefaultDaysPerYear());
                    dto.setRequiresApproval(type.getRequiresApproval());
                    dto.setIsActive(type.getIsActive());
                    return dto;
                })
                .toList();
    }



}
