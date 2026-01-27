package com.corehive.backend.service;

import com.corehive.backend.dto.TenantGrowthDTO;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
public class TenantGrowth {
    @Autowired
    private OrganizationRepository orgRepo;

    @Autowired
    private EmployeeRepository empRepo;

    public List<TenantGrowthDTO> getTenantGrowthData() {
        List<TenantGrowthDTO> growthData = new ArrayList<>();

        // මාස වල නම් පෙන්වීමට array එකක්
        String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

        LocalDate today = LocalDate.now();
        // අන්තිම මාස 6 සඳහා loop එකක් ක්‍රියාත්මක කිරීම
        for (int i = 5; i >= 0; i--) {
            // අදාළ මාසය ලබා ගැනීම (උදා: අද ජනවාරි නම්, i=5 දී පසුගිය අගෝස්තු මාසය)
            LocalDate targetMonth = today.minusMonths(i);

            // එම මාසයේ අවසාන දවස සහ වෙලාව ලබා ගැනීම (උදා: 2023-08-31 23:59:59)
            LocalDateTime endOfMonth = targetMonth.with(TemporalAdjusters.lastDayOfMonth())
                    .atTime(23, 59, 59);

            // Repository එකෙන් දත්ත ගණන් කිරීම (Step 2 හි ලියූ Queries)
            long totalTenants = orgRepo.countTotalTenantsBefore(endOfMonth);
            long totalUsers = empRepo.countTotalUsersBefore(endOfMonth);

            // DTO එකක් සාදා List එකට එකතු කිරීම (Step 1 හි ලියූ DTO එක)
            String monthName = monthNames[targetMonth.getMonthValue() - 1];
            growthData.add(new TenantGrowthDTO(monthName, totalUsers, totalTenants));
        }

        return growthData;
    }
}
