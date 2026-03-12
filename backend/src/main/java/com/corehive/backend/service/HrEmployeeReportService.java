package com.corehive.backend.service;

import com.corehive.backend.model.Employee;
import com.corehive.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HrEmployeeReportService {

    private final EmployeeRepository employeeRepository;
    private final OrganizationService organizationService;

    public Map<String, Object> getEmployeeExcelData(String orgUuid) {

        List<Employee> employees =
                employeeRepository.findAllByOrganizationUuid(orgUuid);

        long total = employeeRepository.countByOrganizationUuid(orgUuid);
        long active = employeeRepository.countByOrganizationUuidAndIsActiveTrue(orgUuid);
        long inactive = employeeRepository.countByOrganizationUuidAndIsActiveFalse(orgUuid);

        String orgName = organizationService.getOrganizationName(orgUuid);

        Map<String, Object> data = new HashMap<>();
        data.put("organizationName", orgName);
        data.put("employees", employees);
        data.put("total", total);
        data.put("active", active);
        data.put("inactive", inactive);

        return data;
    }
}

