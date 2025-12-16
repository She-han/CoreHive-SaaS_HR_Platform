package com.corehive.backend.service;

import com.corehive.backend.dto.request.CreateHRStaffRequest;
import com.corehive.backend.dto.request.UpdateHRStaffRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.CreateHRStaffResponse;
import com.corehive.backend.dto.response.HRStaffResponse;
import com.corehive.backend.model.AppUser;
import com.corehive.backend.model.AppUserRole;
import com.corehive.backend.model.Department;
import com.corehive.backend.model.Employee;
import com.corehive.backend.repository.AppUserRepository;
import com.corehive.backend.repository.DepartmentRepository;
import com.corehive.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for managing HR staff operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HRStaffService {

    private final EmployeeRepository employeeRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final DepartmentService departmentService;
    private final DepartmentRepository departmentRepository;

    /**
     * Get all HR staff members for an organization with pagination
     */
    public ApiResponse<Page<HRStaffResponse>> getAllHRStaff(String organizationUuid, Pageable pageable) {
        try {
            log.info("Fetching HR staff for organization: {}", organizationUuid);

            Page<Employee> hrStaffPage = employeeRepository.findHRStaffByOrganizationUuid(organizationUuid, pageable);
            
            List<HRStaffResponse> hrStaffResponses = hrStaffPage.getContent().stream()
                    .map(this::convertToHRStaffResponse)
                    .collect(Collectors.toList());

            Page<HRStaffResponse> responsePage = new PageImpl<>(
                hrStaffResponses, 
                pageable, 
                hrStaffPage.getTotalElements()
            );

            log.info("Found {} HR staff members for organization: {}", hrStaffResponses.size(), organizationUuid);
            return ApiResponse.success("HR staff retrieved successfully", responsePage);

        } catch (Exception e) {
            log.error("Error fetching HR staff for organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to retrieve HR staff");
        }
    }

    /**
     * Get all HR staff members for an organization without pagination
     */
    public ApiResponse<List<HRStaffResponse>> getAllHRStaff(String organizationUuid) {
        try {
            log.info("Fetching all HR staff for organization: {}", organizationUuid);

            List<Employee> hrStaffList = employeeRepository.findHRStaffByOrganizationUuid(organizationUuid);
            
            List<HRStaffResponse> hrStaffResponses = hrStaffList.stream()
                    .map(this::convertToHRStaffResponse)
                    .collect(Collectors.toList());

            log.info("Found {} HR staff members for organization: {}", hrStaffResponses.size(), organizationUuid);
            return ApiResponse.success("HR staff retrieved successfully", hrStaffResponses);

        } catch (Exception e) {
            log.error("Error fetching HR staff for organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to retrieve HR staff");
        }
    }

    /**
     * Get HR staff member by ID
     */
    public ApiResponse<HRStaffResponse> getHRStaffById(String organizationUuid, Long hrStaffId) {
        try {
            log.info("Fetching HR staff with ID: {} for organization: {}", hrStaffId, organizationUuid);

            Optional<Employee> employeeOpt = employeeRepository.findById(hrStaffId);
            
            if (employeeOpt.isEmpty()) {
                log.warn("HR staff not found with ID: {}", hrStaffId);
                return ApiResponse.error("HR staff not found");
            }

            Employee employee = employeeOpt.get();

            // Verify it's from the correct organization and is HR staff
            if (!employee.getOrganizationUuid().equals(organizationUuid)) {
                log.warn("HR staff {} does not belong to organization: {}", hrStaffId, organizationUuid);
                return ApiResponse.error("HR staff not found");
            }

            // Verify it's an HR staff member
            if (employee.getAppUserId() != null) {
                Optional<AppUser> userOpt = appUserRepository.findById(employee.getAppUserId());
                if (userOpt.isEmpty() || !userOpt.get().getRole().equals(AppUserRole.HR_STAFF)) {
                    log.warn("Employee {} is not an HR staff member", hrStaffId);
                    return ApiResponse.error("Not an HR staff member");
                }
            }

            HRStaffResponse response = convertToHRStaffResponse(employee);

            log.info("HR staff retrieved successfully: {}", hrStaffId);
            return ApiResponse.success("HR staff retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error fetching HR staff with ID: {}", hrStaffId, e);
            return ApiResponse.error("Failed to retrieve HR staff");
        }
    }

    /**
     * Create new HR staff member
     */
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<CreateHRStaffResponse> createHRStaff(String organizationUuid, CreateHRStaffRequest request) {

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid department ID"));

        log.info("Creating HR staff for organization: {} with email: {}", organizationUuid, request.getEmail());
        
        // Validate organization UUID
        if (organizationUuid == null || organizationUuid.trim().isEmpty()) {
            log.error("Organization UUID is null or empty");
            return ApiResponse.error("Invalid organization");
        }

        // Validate department ID and ensure departments exist
        departmentService.ensureDefaultDepartments(organizationUuid);
        
        if (!departmentService.validateDepartment(request.getDepartmentId(), organizationUuid)) {
            log.warn("Invalid department ID {} for organization: {}", request.getDepartmentId(), organizationUuid);
            return ApiResponse.error("Invalid department ID. Please select a valid department.");
        }

        // Validate basic salary
        if (request.getBasicSalary() == null || request.getBasicSalary().compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Invalid basic salary provided: {}", request.getBasicSalary());
            return ApiResponse.error("Basic salary must be greater than zero");
        }

        // Check if email already exists in organization
        if (employeeRepository.existsByEmailAndOrganizationUuid(request.getEmail(), organizationUuid)) {
            log.warn("Email {} already exists in organization: {}", request.getEmail(), organizationUuid);
            return ApiResponse.error("Email already exists in this organization");
        }

        // Check if email exists as an app user
        Optional<AppUser> existingUser = appUserRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent() && existingUser.get().getOrganizationUuid().equals(organizationUuid)) {
            log.warn("User with email {} already exists in organization: {}", request.getEmail(), organizationUuid);
            return ApiResponse.error("User with this email already exists");
        }

        try {
            // Generate temporary password
            String temporaryPassword = generateTemporaryPassword();

            // Create AppUser first
            AppUser appUser = AppUser.builder()
                    .organizationUuid(organizationUuid)
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode(temporaryPassword))
                    .role(AppUserRole.HR_STAFF)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            AppUser savedUser = appUserRepository.save(appUser);
            log.info("AppUser created with ID: {}", savedUser.getId());

            // Generate employee code with better error handling
            String employeeCode = generateEmployeeCodeSafe(organizationUuid);
            log.info("Generated employee code: {}", employeeCode);

            // Create Employee
            Employee employee = new Employee();
            employee.setOrganizationUuid(organizationUuid);
            employee.setAppUserId(savedUser.getId());
            employee.setEmployeeCode(employeeCode);
            employee.setFirstName(request.getFirstName());
            employee.setLastName(request.getLastName());
            employee.setEmail(request.getEmail());
            employee.setPhone(request.getPhone());
            employee.setDesignation(request.getDesignation());
            employee.setDepartment(department);
            employee.setBasicSalary(request.getBasicSalary());
            employee.setDateOfJoining(request.getDateOfJoining());
            employee.setSalaryType(Employee.SalaryType.valueOf(request.getSalaryType()));
            employee.setIsActive(true);
            employee.setCreatedAt(LocalDateTime.now());
            employee.setUpdatedAt(LocalDateTime.now());

            Employee savedEmployee = employeeRepository.save(employee);
            log.info("Employee created with ID: {} and code: {}", savedEmployee.getId(), employeeCode);

            // Update AppUser with linked employee ID
            savedUser.setLinkedEmployeeId(savedEmployee.getId());
            appUserRepository.save(savedUser);
            log.info("AppUser updated with linked employee ID: {}", savedEmployee.getId());

            CreateHRStaffResponse response = CreateHRStaffResponse.success(
                savedEmployee.getId(),
                employeeCode,
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                temporaryPassword
            );

            log.info("HR staff created successfully with ID: {}", savedEmployee.getId());
            return ApiResponse.success("HR staff created successfully", response);

        } catch (Exception e) {
            log.error("Error creating HR staff for organization: {} - {}", organizationUuid, e.getMessage(), e);
            // Since this is inside a @Transactional method, the rollback will happen automatically
            throw new RuntimeException("Failed to create HR staff: " + e.getMessage(), e);
        }
    }

    /**
     * Update HR staff member
     */
    @Transactional
    public ApiResponse<HRStaffResponse> updateHRStaff(String organizationUuid, UpdateHRStaffRequest request) {

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid department ID"));

        try {
            log.info("Updating HR staff with ID: {} for organization: {}", request.getId(), organizationUuid);

            Optional<Employee> employeeOpt = employeeRepository.findById(request.getId());
            
            if (employeeOpt.isEmpty()) {
                log.warn("HR staff not found with ID: {}", request.getId());
                return ApiResponse.error("HR staff not found");
            }

            Employee employee = employeeOpt.get();

            // Verify it's from the correct organization
            if (!employee.getOrganizationUuid().equals(organizationUuid)) {
                log.warn("HR staff {} does not belong to organization: {}", request.getId(), organizationUuid);
                return ApiResponse.error("HR staff not found");
            }

            // Check if email is being changed and if it conflicts
            if (!employee.getEmail().equals(request.getEmail()) &&
                employeeRepository.existsByEmailAndOrganizationUuid(request.getEmail(), organizationUuid)) {
                log.warn("Email {} already exists in organization: {}", request.getEmail(), organizationUuid);
                return ApiResponse.error("Email already exists in this organization");
            }

            // Update Employee
            employee.setFirstName(request.getFirstName());
            employee.setLastName(request.getLastName());
            employee.setEmail(request.getEmail());
            employee.setPhone(request.getPhone());
            employee.setDesignation(request.getDesignation());
            employee.setDepartment(department);
            employee.setBasicSalary(request.getBasicSalary());
            employee.setDateOfJoining(request.getDateOfJoining());
            employee.setSalaryType(Employee.SalaryType.valueOf(request.getSalaryType()));
            
            if (request.getIsActive() != null) {
                employee.setIsActive(request.getIsActive());
            }
            
            employee.setUpdatedAt(LocalDateTime.now());

            Employee savedEmployee = employeeRepository.save(employee);

            // Update AppUser if linked
            if (savedEmployee.getAppUserId() != null) {
                Optional<AppUser> userOpt = appUserRepository.findById(savedEmployee.getAppUserId());
                if (userOpt.isPresent()) {
                    AppUser user = userOpt.get();
                    user.setEmail(request.getEmail());
                    if (request.getIsActive() != null) {
                        user.setIsActive(request.getIsActive());
                    }
                    user.setUpdatedAt(LocalDateTime.now());
                    appUserRepository.save(user);
                }
            }

            HRStaffResponse response = convertToHRStaffResponse(savedEmployee);

            log.info("HR staff updated successfully with ID: {}", request.getId());
            return ApiResponse.success("HR staff updated successfully", response);

        } catch (Exception e) {
            log.error("Error updating HR staff with ID: {}", request.getId(), e);
            return ApiResponse.error("Failed to update HR staff: " + e.getMessage());
        }
    }

    /**
     * Delete HR staff member
     */
    @Transactional
    public ApiResponse<String> deleteHRStaff(String organizationUuid, Long hrStaffId) {
        try {
            log.info("Deleting HR staff with ID: {} for organization: {}", hrStaffId, organizationUuid);

            Optional<Employee> employeeOpt = employeeRepository.findById(hrStaffId);
            
            if (employeeOpt.isEmpty()) {
                log.warn("HR staff not found with ID: {}", hrStaffId);
                return ApiResponse.error("HR staff not found");
            }

            Employee employee = employeeOpt.get();

            // Verify it's from the correct organization
            if (!employee.getOrganizationUuid().equals(organizationUuid)) {
                log.warn("HR staff {} does not belong to organization: {}", hrStaffId, organizationUuid);
                return ApiResponse.error("HR staff not found");
            }

            // Delete linked AppUser if exists
            if (employee.getAppUserId() != null) {
                Optional<AppUser> userOpt = appUserRepository.findById(employee.getAppUserId());
                if (userOpt.isPresent()) {
                    appUserRepository.delete(userOpt.get());
                    log.info("Deleted linked AppUser with ID: {}", employee.getAppUserId());
                }
            }

            // Delete Employee
            employeeRepository.delete(employee);

            log.info("HR staff deleted successfully with ID: {}", hrStaffId);
            return ApiResponse.success("HR staff deleted successfully", null);

        } catch (Exception e) {
            log.error("Error deleting HR staff with ID: {}", hrStaffId, e);
            return ApiResponse.error("Failed to delete HR staff: " + e.getMessage());
        }
    }

    /**
     * Search HR staff members
     */
    public ApiResponse<Page<HRStaffResponse>> searchHRStaff(String organizationUuid, String searchTerm, Pageable pageable) {
        try {
            log.info("Searching HR staff for organization: {} with term: {}", organizationUuid, searchTerm);

            Page<Employee> hrStaffPage = employeeRepository.searchHRStaff(organizationUuid, searchTerm, pageable);
            
            List<HRStaffResponse> hrStaffResponses = hrStaffPage.getContent().stream()
                    .map(this::convertToHRStaffResponse)
                    .collect(Collectors.toList());

            Page<HRStaffResponse> responsePage = new PageImpl<>(
                hrStaffResponses, 
                pageable, 
                hrStaffPage.getTotalElements()
            );

            log.info("Found {} HR staff members matching search term: {}", hrStaffResponses.size(), searchTerm);
            return ApiResponse.success("HR staff search completed", responsePage);

        } catch (Exception e) {
            log.error("Error searching HR staff for organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to search HR staff");
        }
    }

    /**
     * Get HR staff count for organization
     */
    public ApiResponse<Long> getHRStaffCount(String organizationUuid) {
        try {
            log.info("Getting HR staff count for organization: {}", organizationUuid);

            Long count = employeeRepository.countHRStaffByOrganizationUuid(organizationUuid);

            log.info("HR staff count for organization {}: {}", organizationUuid, count);
            return ApiResponse.success("HR staff count retrieved successfully", count);

        } catch (Exception e) {
            log.error("Error getting HR staff count for organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to get HR staff count");
        }
    }

    /**
     * Convert Employee to HRStaffResponse
     */
    private HRStaffResponse convertToHRStaffResponse(Employee employee) {
        return HRStaffResponse.builder()
                .id(employee.getId())
                .appUserId(employee.getAppUserId())
                .employeeCode(employee.getEmployeeCode())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .designation(employee.getDesignation())
//                .departmentId(employee.getDepartmentId())
//                .departmentName(getDepartmentName(employee.getDepartmentId())) // TODO: Implement department lookup
                .basicSalary(employee.getBasicSalary())
                .dateOfJoining(employee.getDateOfJoining())
                .salaryType(employee.getSalaryType().toString())
                .isActive(employee.getIsActive())
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }

    /**
     * Generate employee code with proper error handling
     */
    private String generateEmployeeCodeSafe(String organizationUuid) {
        try {
            Integer nextNumber = employeeRepository.findNextEmployeeNumber(organizationUuid);
            if (nextNumber == null) {
                nextNumber = 1;
            }
            return String.format("EMP%03d", nextNumber);
        } catch (Exception e) {
            log.error("Error generating employee code for organization: {}", organizationUuid, e);
            // Fallback to timestamp-based code if query fails
            return "EMP" + System.currentTimeMillis() % 10000;
        }
    }

    /**
     * Generate temporary password (same pattern as AuthService)
     */
    private String generateTemporaryPassword() {
        // Generate strong random password in production 
        // Currently using simple password for development
        return "TempPass123!";
    }

    /**
     * Get department name by ID
     * TODO: Implement proper department service lookup
     */
    private String getDepartmentName(Long departmentId) {
        // Mock department names for now
        switch (departmentId != null ? departmentId.intValue() : 0) {
            case 1: return "Human Resources";
            case 2: return "Information Technology";
            case 3: return "Finance";
            case 4: return "Operations";
            default: return "Unknown Department";
        }
    }
}