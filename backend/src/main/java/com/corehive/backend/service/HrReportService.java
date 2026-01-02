package com.corehive.backend.service;

import com.corehive.backend.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class HrReportService {

    @Autowired
    private  EmployeeRepository employeeRepository;

    public Map<String , Object> getHeadcountReport(String orgUuid){

        Map<String, Object> report = new HashMap<>();

        report.put("totalEmployees" ,
                employeeRepository.countByOrganizationUuidAndIsActiveTrue(orgUuid));

        report.put("byDepartment" ,
                employeeRepository.countByDepartment(orgUuid));

        report.put("byDesignation" ,
                employeeRepository.countByDesignation(orgUuid));

        return report;


    }

}
