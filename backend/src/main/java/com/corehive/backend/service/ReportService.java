package com.corehive.backend.service;

import com.corehive.backend.dto.response.ModuleUsageReportDTO;
import com.corehive.backend.dto.response.OrganizationsReportDTO;
import com.corehive.backend.dto.response.RevenueReportDTO;
import com.corehive.backend.model.*;
import com.corehive.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Report Service
 * Generates system-wide reports with actual database data for System Admin
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final OrganizationRepository organizationRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrganizationModuleRepository organizationModuleRepository;
    private final ExtendedModuleRepository extendedModuleRepository;
    private final AppUserRepository appUserRepository;
    private final BillingPlanRepository billingPlanRepository;

    /**
     * Generate Organizations Report
     * Filters organizations based on date range, billing plan, and extended modules
     */
    public OrganizationsReportDTO getOrganizationsReport(
            LocalDate startDate,
            LocalDate endDate,
            String billingPlan,
            List<String> extendedModules) {

        log.info("Generating organizations report - Start: {}, End: {}, Plan: {}, Modules: {}",
                startDate, endDate, billingPlan, extendedModules);

        // Get all organizations
        List<Organization> allOrgs = organizationRepository.findAll();

        // Apply filters
        List<Organization> filteredOrgs = allOrgs.stream()
                .filter(org -> {
                    // Date filter (createdAt)
                    if (startDate != null && endDate != null) {
                        LocalDate orgDate = org.getCreatedAt().toLocalDate();
                        if (orgDate.isBefore(startDate) || orgDate.isAfter(endDate)) {
                            return false;
                        }
                    }

                    // Billing plan filter
                    if (billingPlan != null && !billingPlan.isEmpty() && !billingPlan.equals("ALL")) {
                        if (org.getBillingPlan() == null || !org.getBillingPlan().equalsIgnoreCase(billingPlan)) {
                            return false;
                        }
                    }

                    // Extended modules filter
                    if (extendedModules != null && !extendedModules.isEmpty()) {
                        List<OrganizationModule> orgModules = organizationModuleRepository.findEnabledByOrganizationUuid(org.getOrganizationUuid());
                        Set<String> orgModuleNames = orgModules.stream()
                                .map(om -> om.getExtendedModule().getName())
                                .collect(Collectors.toSet());

                        // Check if organization has ALL specified modules
                        for (String requiredModule : extendedModules) {
                            if (!orgModuleNames.contains(requiredModule)) {
                                return false;
                            }
                        }
                    }

                    return true;
                })
                .collect(Collectors.toList());

        // Map to DTOs with subscription data
        List<OrganizationsReportDTO.OrganizationData> organizationDataList = filteredOrgs.stream()
                .map(org -> {
                    OrganizationsReportDTO.OrganizationData data = new OrganizationsReportDTO.OrganizationData();
                    data.setOrganizationName(org.getName());
                    data.setEmail(org.getEmail());
                    data.setBillingPlan(org.getBillingPlan() != null ? org.getBillingPlan() : "N/A");
                    data.setStatus(org.getStatus().toString());
                    data.setCreatedAt(org.getCreatedAt());

                    // Count active users from app_user table
                    long activeUserCount = appUserRepository.countByOrganizationUuidAndIsActiveTrue(org.getOrganizationUuid());
                    data.setActiveUsers((int) activeUserCount);

                    // Get plan price from billing_plans table or subscription
                    BigDecimal planPrice = BigDecimal.ZERO;
                    String billingCycle = "N/A";
                    
                    Optional<Subscription> subOpt = subscriptionRepository.findByOrganizationUuid(org.getOrganizationUuid());
                    if (subOpt.isPresent()) {
                        Subscription sub = subOpt.get();
                        planPrice = sub.getPlanPrice();
                        billingCycle = sub.getBillingCycle().toString();
                    } else if (org.getBillingPlan() != null) {
                        // Try to get price from billing_plans table
                        Optional<BillingPlan> planOpt = billingPlanRepository.findByName(org.getBillingPlan());
                        if (planOpt.isPresent()) {
                            try {
                                planPrice = new BigDecimal(planOpt.get().getPrice());
                            } catch (NumberFormatException e) {
                                log.warn("Invalid price format for plan: {}", org.getBillingPlan());
                            }
                        }
                    }

                    data.setPlanPrice(planPrice);
                    data.setBillingCycle(billingCycle);
                    
                    // Calculate monthly revenue: plan_price * active_users
                    BigDecimal monthlyRevenue = planPrice.multiply(BigDecimal.valueOf(activeUserCount));
                    data.setMonthlyRevenue(monthlyRevenue);

                    // Get extended modules
                    List<OrganizationModule> orgModules = organizationModuleRepository.findEnabledByOrganizationUuid(org.getOrganizationUuid());
                    List<String> moduleNames = orgModules.stream()
                            .map(om -> om.getExtendedModule().getName())
                            .collect(Collectors.toList());
                    data.setExtendedModules(moduleNames);

                    return data;
                })
                .collect(Collectors.toList());

        // Calculate summary statistics
        int totalOrganizations = organizationDataList.size();
        BigDecimal totalMonthlyRevenue = organizationDataList.stream()
                .map(OrganizationsReportDTO.OrganizationData::getMonthlyRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Count by billing plan
        Map<String, Long> planDistribution = organizationDataList.stream()
                .collect(Collectors.groupingBy(
                        OrganizationsReportDTO.OrganizationData::getBillingPlan,
                        Collectors.counting()
                ));

        // Count by status
        Map<String, Long> statusDistribution = organizationDataList.stream()
                .collect(Collectors.groupingBy(
                        OrganizationsReportDTO.OrganizationData::getStatus,
                        Collectors.counting()
                ));

        OrganizationsReportDTO report = new OrganizationsReportDTO();
        report.setOrganizations(organizationDataList);
        report.setTotalOrganizations(totalOrganizations);
        report.setTotalMonthlyRevenue(totalMonthlyRevenue);
        report.setPlanDistribution(planDistribution);
        report.setStatusDistribution(statusDistribution);
        report.setGeneratedAt(LocalDateTime.now());

        log.info("Organizations report generated - Total: {}, Revenue: {}",
                totalOrganizations, totalMonthlyRevenue);

        return report;
    }

    /**
     * Generate Revenue Report
     * Calculates actual revenue from PaymentTransaction table
     */
    public RevenueReportDTO getRevenueReport(String timePeriod) {

        log.info("Generating revenue report - Time Period: {}", timePeriod);

        // Calculate date range based on time period
        final LocalDateTime startDate;
        final LocalDateTime endDate;

        switch (timePeriod.toUpperCase()) {
            case "THIS_MONTH":
                startDate = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                endDate = LocalDateTime.now();
                break;
            case "LAST_MONTH":
                startDate = LocalDateTime.now().minusMonths(1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                endDate = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).minusSeconds(1);
                break;
            case "LAST_3_MONTHS":
                startDate = LocalDateTime.now().minusMonths(3);
                endDate = LocalDateTime.now();
                break;
            case "LAST_6_MONTHS":
                startDate = LocalDateTime.now().minusMonths(6);
                endDate = LocalDateTime.now();
                break;
            case "THIS_YEAR":
                startDate = LocalDateTime.now().withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
                endDate = LocalDateTime.now();
                break;
            default:
                startDate = LocalDateTime.now().minusMonths(1);
                endDate = LocalDateTime.now();
        }

        // Get all SUCCESS payment transactions in date range
        List<PaymentTransaction> allTransactions = paymentTransactionRepository.findAll();
        List<PaymentTransaction> transactions = allTransactions.stream()
                .filter(tx -> tx.getStatus() == PaymentStatus.SUCCESS)
                .filter(tx -> tx.getTransactionDate().isAfter(startDate) && tx.getTransactionDate().isBefore(endDate))
                .collect(Collectors.toList());

        // Calculate total revenue
        BigDecimal totalRevenue = transactions.stream()
                .map(PaymentTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Group by organization and calculate revenue per organization
        Map<String, List<PaymentTransaction>> txByOrg = transactions.stream()
                .collect(Collectors.groupingBy(PaymentTransaction::getOrganizationUuid));

        List<RevenueReportDTO.OrganizationRevenue> organizationRevenueList = new ArrayList<>();
        Map<String, BigDecimal> revenueByPlan = new HashMap<>();

        for (Map.Entry<String, List<PaymentTransaction>> entry : txByOrg.entrySet()) {
            String orgUuid = entry.getKey();
            List<PaymentTransaction> orgTransactions = entry.getValue();

            BigDecimal orgRevenue = orgTransactions.stream()
                    .map(PaymentTransaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Get organization details
            Optional<Organization> orgOpt = organizationRepository.findByOrganizationUuid(orgUuid);
            if (orgOpt.isPresent()) {
                Organization org = orgOpt.get();
                Optional<Subscription> subOpt = subscriptionRepository.findByOrganizationUuid(orgUuid);

                RevenueReportDTO.OrganizationRevenue orgRev = new RevenueReportDTO.OrganizationRevenue();
                orgRev.setOrganizationName(org.getName());
                orgRev.setOrganizationUuid(orgUuid);
                orgRev.setRevenue(orgRevenue);
                orgRev.setTransactionCount(orgTransactions.size());

                if (subOpt.isPresent()) {
                    Subscription sub = subOpt.get();
                    orgRev.setBillingPlan(sub.getPlanName());
                    orgRev.setActiveUsers(sub.getActiveUserCount());
                    orgRev.setBillingCycle(sub.getBillingCycle().toString());

                    // Aggregate revenue by plan
                    revenueByPlan.merge(sub.getPlanName(), orgRevenue, BigDecimal::add);
                } else {
                    orgRev.setBillingPlan("N/A");
                    orgRev.setActiveUsers(0);
                    orgRev.setBillingCycle("N/A");
                }

                organizationRevenueList.add(orgRev);
            }
        }

        // Sort by revenue descending
        organizationRevenueList.sort((a, b) -> b.getRevenue().compareTo(a.getRevenue()));

        RevenueReportDTO report = new RevenueReportDTO();
        report.setTotalRevenue(totalRevenue);
        report.setTotalTransactions(transactions.size());
        report.setTimePeriod(timePeriod);
        report.setStartDate(startDate);
        report.setEndDate(endDate);
        report.setOrganizationRevenues(organizationRevenueList);
        report.setRevenueByPlan(revenueByPlan);
        report.setGeneratedAt(LocalDateTime.now());

        log.info("Revenue report generated - Total Revenue: {}, Transactions: {}",
                totalRevenue, transactions.size());

        return report;
    }

    /**
     * Generate Module Usage Report
     * Shows actual extended module adoption from OrganizationModule table
     */
    public ModuleUsageReportDTO getModuleUsageReport(String timePeriod) {

        log.info("Generating module usage report - Time Period: {}", timePeriod);

        // Get all extended modules
        List<ExtendedModule> allModules = extendedModuleRepository.findAll();

        // Get all organizations
        List<Organization> allOrgs = organizationRepository.findAll();
        long totalOrganizations = allOrgs.size();

        // Calculate date filter for organizations
        LocalDateTime startDate = calculateStartDate(timePeriod);

        List<Organization> filteredOrgs = allOrgs.stream()
                .filter(org -> org.getCreatedAt().isAfter(startDate))
                .collect(Collectors.toList());

        long relevantOrganizations = filteredOrgs.isEmpty() ? totalOrganizations : filteredOrgs.size();

        List<ModuleUsageReportDTO.ModuleUsage> moduleUsageList = new ArrayList<>();

        for (ExtendedModule module : allModules) {
            // Get all organizations that have this module enabled
            List<OrganizationModule> orgModules = organizationModuleRepository.findAll().stream()
                    .filter(om -> om.getExtendedModule().getModuleId().equals(module.getModuleId()))
                    .filter(om -> Boolean.TRUE.equals(om.getIsEnabled()))
                    .collect(Collectors.toList());

            // Filter by date if time period specified
            long activeCount;
            if (!filteredOrgs.isEmpty()) {
                Set<String> filteredOrgUuids = filteredOrgs.stream()
                        .map(Organization::getOrganizationUuid)
                        .collect(Collectors.toSet());

                activeCount = orgModules.stream()
                        .filter(om -> filteredOrgUuids.contains(om.getOrganization().getOrganizationUuid()))
                        .count();
            } else {
                activeCount = orgModules.size();
            }

            double adoptionRate = relevantOrganizations > 0
                    ? (activeCount * 100.0) / relevantOrganizations
                    : 0.0;

            ModuleUsageReportDTO.ModuleUsage usage = new ModuleUsageReportDTO.ModuleUsage();
            usage.setModuleName(module.getName());
            usage.setModuleDescription(module.getDescription());
            usage.setActiveOrganizations((int) activeCount);
            usage.setAdoptionRate(adoptionRate);

            moduleUsageList.add(usage);
        }

        // Sort by active organizations descending
        moduleUsageList.sort((a, b) -> Integer.compare(b.getActiveOrganizations(), a.getActiveOrganizations()));

        // Calculate total active modules across all organizations
        long totalActiveModuleSubscriptions = organizationModuleRepository.findAll().stream()
                .filter(om -> Boolean.TRUE.equals(om.getIsEnabled()))
                .count();

        ModuleUsageReportDTO report = new ModuleUsageReportDTO();
        report.setModuleUsages(moduleUsageList);
        report.setTotalOrganizations((int) relevantOrganizations);
        report.setTotalActiveModuleSubscriptions((int) totalActiveModuleSubscriptions);
        report.setTimePeriod(timePeriod);
        report.setGeneratedAt(LocalDateTime.now());

        log.info("Module usage report generated - Total Modules: {}, Total Subscriptions: {}",
                moduleUsageList.size(), totalActiveModuleSubscriptions);

        return report;
    }

    /**
     * Helper method to calculate start date based on time period
     */
    private LocalDateTime calculateStartDate(String timePeriod) {
        if (timePeriod == null || timePeriod.equals("ALL")) {
            return LocalDateTime.of(2000, 1, 1, 0, 0); // Far past
        }

        switch (timePeriod.toUpperCase()) {
            case "THIS_MONTH":
                return LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            case "LAST_MONTH":
                return LocalDateTime.now().minusMonths(1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            case "LAST_3_MONTHS":
                return LocalDateTime.now().minusMonths(3);
            case "LAST_6_MONTHS":
                return LocalDateTime.now().minusMonths(6);
            case "THIS_YEAR":
                return LocalDateTime.now().withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
            default:
                return LocalDateTime.now().minusMonths(1);
        }
    }
}
