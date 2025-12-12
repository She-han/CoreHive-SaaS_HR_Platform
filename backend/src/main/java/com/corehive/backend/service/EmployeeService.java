package com.corehive.backend.service;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.model.AppUser;
import com.corehive.backend.model.AppUserRole;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.Organization;
import com.corehive.backend.repository.AppUserRepository;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final DepartmentService departmentService;
    private final EmailService emailService;
    private final OrganizationRepository organizationRepository;

    /**
     * Get all employees for an organization
     * Returns plain List wrapped in ApiResponse (not individual employee responses)
     */
    public ApiResponse<List<Employee>> getAllEmployees(String organizationUuid) {
        try {
            log.info("Fetching all employees for organization: {}", organizationUuid);
            List<Employee> employees = employeeRepository.findByOrganizationUuid(organizationUuid);
            log.info("Found {} employees for organization: {}", employees.size(), organizationUuid);

            // Return plain Employee list - frontend can handle department names if needed
            return ApiResponse.success("Employees retrieved successfully", employees);

        } catch (Exception e) {
            log.error("Error fetching employees for organization: {}", organizationUuid, e);
            return ApiResponse.error("Failed to retrieve employees");
        }
    }

    /**
     * Get employee by ID
     */
    public ApiResponse<Employee> getEmployeeById(String organizationUuid, Long id) {
        try {
            log.info("Fetching employee with ID: {} for organization: {}", id, organizationUuid);

            Optional<Employee> employeeOpt = employeeRepository.findById(id);

            if (employeeOpt.isEmpty()) {
                log.warn("Employee not found with ID: {}", id);
                return ApiResponse.error("Employee not found");
            }

            Employee employee = employeeOpt.get();

            // Verify it's from the correct organization
            if (!employee.getOrganizationUuid().equals(organizationUuid)) {
                log.warn("Employee {} does not belong to organization: {}", id, organizationUuid);
                return ApiResponse.error("Employee not found");
            }

            log.info("Employee retrieved successfully: {}", id);
            return ApiResponse.success("Employee retrieved successfully", employee);

        } catch (Exception e) {
            log.error("Error fetching employee with ID: {}", id, e);
            return ApiResponse.error("Failed to retrieve employee");
        }
    }

    /**
     * Create new employee
     */
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Employee> createEmployee(String organizationUuid, EmployeeRequestDTO request) {
        log.info("Creating employee for organization: {} with email: {}", organizationUuid, request.getEmail());

        // Validate organization UUID
        if (organizationUuid == null || organizationUuid.trim().isEmpty()) {
            log.error("Organization UUID is null or empty");
            return ApiResponse.error("Invalid organization");
        }

        // Get organization
        Optional<Organization> orgOpt = organizationRepository.findByOrganizationUuid(organizationUuid);
        if (orgOpt.isEmpty()) {
            log.error("Organization not found with UUID: {}", organizationUuid);
            return ApiResponse.error("Organization not found");
        }
        Organization organization = orgOpt.get();

        // Validate department ID and ensure departments exist
        departmentService.ensureDefaultDepartments(organizationUuid);

        if (!departmentService.validateDepartment(request.getDepartment(), organizationUuid)) {
            log.warn("Invalid department ID {} for organization: {}", request.getDepartment(), organizationUuid);
            return ApiResponse.error("Invalid department ID. Please select a valid department.");
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
            String tempPassword = UUID.randomUUID().toString().substring(0, 8);

            // Create AppUser first
            AppUser appUser = AppUser.builder()
                    .organizationUuid(organizationUuid)
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode(tempPassword))
                    .role(AppUserRole.EMPLOYEE)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            appUser.setIsPasswordChangeRequired(true);
            AppUser savedUser = appUserRepository.save(appUser);
            log.info("AppUser created with ID: {}", savedUser.getId());

            // Send email with credentials
            try {
                emailService.sendEmployeePasswordEmail(request.getEmail(), tempPassword, organization.getName());
                log.info("Employee password email sent successfully to: {}", request.getEmail());
            } catch (Exception e) {
                log.error("Failed to send employee password email: {}", e.getMessage());
            }

            // Generate employee code
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
            employee.setDepartmentId(request.getDepartment());
            employee.setBasicSalary(request.getBasicSalary());
            employee.setLeaveCount(request.getLeaveCount());
            employee.setDateOfJoining(request.getDateOfJoining());
            employee.setSalaryType(Employee.SalaryType.valueOf(request.getSalaryType().toUpperCase()));
            employee.setIsActive(request.getStatus().equalsIgnoreCase("Active"));
            employee.setCreatedAt(LocalDateTime.now());
            employee.setUpdatedAt(LocalDateTime.now());

            Employee savedEmployee = employeeRepository.save(employee);
            log.info("Employee created with ID: {} and code: {}", savedEmployee.getId(), employeeCode);

            // Update AppUser with linked employee ID
            savedUser.setLinkedEmployeeId(savedEmployee.getId());
            appUserRepository.save(savedUser);
            log.info("AppUser updated with linked employee ID: {}", savedEmployee.getId());

            log.info("Employee created successfully with ID: {}", savedEmployee.getId());
            return ApiResponse.success("Employee created successfully", savedEmployee);

        } catch (Exception e) {
            log.error("Error creating employee for organization: {} - {}", organizationUuid, e.getMessage(), e);
            throw new RuntimeException("Failed to create employee: " + e.getMessage(), e);
        }
    }

    /**
     * Update employee
     */
    @Transactional
    public ApiResponse<Employee> updateEmployee(String organizationUuid, Long id, EmployeeRequestDTO request) {
        try {
            log.info("Updating employee with ID: {} for organization: {}", id, organizationUuid);

            Optional<Employee> employeeOpt = employeeRepository.findById(id);

            if (employeeOpt.isEmpty()) {
                log.warn("Employee not found with ID: {}", id);
                return ApiResponse.error("Employee not found");
            }

            Employee employee = employeeOpt.get();

            // Verify it's from the correct organization
            if (!employee.getOrganizationUuid().equals(organizationUuid)) {
                log.warn("Employee {} does not belong to organization: {}", id, organizationUuid);
                return ApiResponse.error("Employee not found");
            }

            // Check if email is being changed and if it conflicts
            if (!employee.getEmail().equals(request.getEmail()) &&
                    employeeRepository.existsByEmailAndOrganizationUuid(request.getEmail(), organizationUuid)) {
                log.warn("Email {} already exists in organization: {}", request.getEmail(), organizationUuid);
                return ApiResponse.error("Email already exists in this organization");
            }

            // Validate department
            if (!departmentService.validateDepartment(request.getDepartment(), organizationUuid)) {
                log.warn("Invalid department ID {} for organization: {}", request.getDepartment(), organizationUuid);
                return ApiResponse.error("Invalid department ID");
            }

            // Update Employee fields
            employee.setFirstName(request.getFirstName());
            employee.setLastName(request.getLastName());
            employee.setDesignation(request.getDesignation());
            employee.setEmail(request.getEmail());
            employee.setPhone(request.getPhone());
            employee.setDepartmentId(request.getDepartment());
            employee.setLeaveCount(request.getLeaveCount());
            employee.setSalaryType(Employee.SalaryType.valueOf(request.getSalaryType().toUpperCase()));
            employee.setBasicSalary(request.getBasicSalary());
            employee.setDateOfJoining(request.getDateOfJoining());
            employee.setIsActive(request.getStatus().equalsIgnoreCase("Active"));
            employee.setUpdatedAt(LocalDateTime.now());

            Employee savedEmployee = employeeRepository.save(employee);

            // Update AppUser if linked
            if (savedEmployee.getAppUserId() != null) {
                Optional<AppUser> userOpt = appUserRepository.findById(savedEmployee.getAppUserId());
                if (userOpt.isPresent()) {
                    AppUser user = userOpt.get();
                    user.setEmail(request.getEmail());
                    user.setIsActive(request.getStatus().equalsIgnoreCase("Active"));
                    user.setUpdatedAt(LocalDateTime.now());
                    appUserRepository.save(user);
                    log.info("AppUser updated with ID: {}", user.getId());
                }
            }

            log.info("Employee updated successfully with ID: {}", id);
            return ApiResponse.success("Employee updated successfully", savedEmployee);

        } catch (Exception e) {
            log.error("Error updating employee with ID: {}", id, e);
            return ApiResponse.error("Failed to update employee: " + e.getMessage());
        }
    }

    /**
     * Delete employee
     */
    @Transactional
    public ApiResponse<String> deleteEmployee(String organizationUuid, Long id) {
        try {
            log.info("Deleting employee with ID: {} for organization: {}", id, organizationUuid);

            Optional<Employee> employeeOpt = employeeRepository.findById(id);

            if (employeeOpt.isEmpty()) {
                log.warn("Employee not found with ID: {}", id);
                return ApiResponse.error("Employee not found");
            }

            Employee employee = employeeOpt.get();

            // Verify it's from the correct organization
            if (!employee.getOrganizationUuid().equals(organizationUuid)) {
                log.warn("Employee {} does not belong to organization: {}", id, organizationUuid);
                return ApiResponse.error("Employee not found");
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

            log.info("Employee deleted successfully with ID: {}", id);
            return ApiResponse.success("Employee deleted successfully", null);

        } catch (Exception e) {
            log.error("Error deleting employee with ID: {}", id, e);
            return ApiResponse.error("Failed to delete employee: " + e.getMessage());
        }
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
}