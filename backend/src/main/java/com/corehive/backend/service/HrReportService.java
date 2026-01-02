package com.corehive.backend.service;

import com.corehive.backend.repository.AttendanceRepository;
import com.corehive.backend.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class HrReportService {

    @Autowired
    private  EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    //Get head-count report department , designation and overall wisely
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

    //Get monthly employee attendance report
    public Map<String , Object> getMonthlyEmployeeReports(
            String orgUuid, int month, int year
    )
    {
        Map<String, Object> report = new HashMap<>();

        report.put("attendance",
                attendanceRepository.monthlyAttendanceStats(orgUuid, month, year));

        report.put("newHires",
                employeeRepository.countNewHires(orgUuid, month, year));

        return report;
    }

    //Get annually employee growth
    public Map<Integer , Long> getYearlyEmployeeGrowth(
            String orgUuid , int year
    ){
        List<Object[]> rawData = employeeRepository.yearlyEmployeeGrowth(orgUuid , year);

        // Month → Count mapping (1–12)
        Map<Integer, Long> growthMap = new LinkedHashMap<>();

        //Initialize all months with 0
        for (int i = 1; i <= 12; i++) {
            growthMap.put(i, 0L);
        }

        //Fill real values
        for(Object[] row : rawData){
            Integer month = (Integer) row[0];
            Long count = (Long) row[1];
            growthMap.put(month,count);
        }

        return growthMap;
    }

}
