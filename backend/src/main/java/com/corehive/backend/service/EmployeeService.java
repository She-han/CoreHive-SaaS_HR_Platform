package com.corehive.backend.service;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.paginated.PaginatedResponseItemDTO;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.exception.employeeCustomException.EmployeeAlreadyInactiveException;
import com.corehive.backend.exception.employeeCustomException.EmployeeNotFoundException;
import com.corehive.backend.exception.employeeCustomException.InvalidEmployeeDataException;
import com.corehive.backend.exception.employeeCustomException.OrganizationNotFoundException;
import com.corehive.backend.model.*;
import com.corehive.backend.repository.AppUserRepository;
import com.corehive.backend.repository.DepartmentRepository;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.repository.OrganizationRepository;
import com.corehive.backend.util.mappers.EmployeeMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataAccessException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j

public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private EmployeeMapper employeeMapper;
    private final DepartmentRepository departmentRepository;
    private final OrganizationRepository organizationRepository;
    private final DepartmentService departmentService;
    private final AppUserRepository appUserRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;



    public EmployeeService(EmployeeRepository employeeRepository, EmployeeMapper employeeMapper, DepartmentRepository departmentRepository, OrganizationRepository organizationRepository, DepartmentService departmentService, AppUserRepository appUserRepository, EmailService emailService, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.employeeMapper = employeeMapper;
        this.departmentRepository = departmentRepository;

        this.organizationRepository = organizationRepository;
        this.departmentService = departmentService;
        this.appUserRepository = appUserRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    //************************************************//
    //GET ALL EMPLOYEES//
    //************************************************//
    public PaginatedResponseItemDTO getAllEmployeesWithPaginated(String orgUuid, int page, int size) {
        // 1. Validate the orgUuid first
        if (orgUuid == null || orgUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID cannot be null or empty");
        }

        // 2️. Validate pagination parameters
        if (page < 0) {
            throw new IllegalArgumentException("Page number must be 0 or greater");
        }

        if (size <= 0) {
            throw new IllegalArgumentException("Page size must be greater than 0");
        }

        // 3. Create Pageable object
        Pageable pageable = PageRequest.of(page, size);

        // 4. Fetch employees
        Page<Employee> employeePage =
                employeeRepository.findByOrganizationUuidWithDepartment(orgUuid, pageable);


        // 5. Map entities to DTOs
        List<EmployeeResponseDTO> employeeDTOs = employeeMapper.toDtos(employeePage.getContent());

        // 6. Build paginated response
        PaginatedResponseItemDTO paginatedResponse = new PaginatedResponseItemDTO();
        paginatedResponse.setItems(employeeDTOs);
        paginatedResponse.setPage(page);
        paginatedResponse.setSize(size);
        paginatedResponse.setTotalItems(employeePage.getTotalElements());
        paginatedResponse.setTotalPages(employeePage.getTotalPages());

        return paginatedResponse;


    }

    /**
     * Create a new employee
     *
     * IMPORTANT DESIGN RULES USED HERE:
     * 1. Validate EVERYTHING before starting DB writes
     * 2. Never return success before transaction commit
     * 3. Never swallow exceptions inside @Transactional
     * 4. Generate employee code ONLY ONCE
     * 5. Fail fast on invalid data
     */
    @Transactional
    public ApiResponse<EmployeeResponseDTO> createEmployee(
            String organizationUuid,
            EmployeeRequestDTO request
    ) {
        log.info("Creating employee for organization={} email={}", organizationUuid, request.getEmail());

        /* -------------------------------------------------
         * 1️⃣ Validate organization UUID
         * ------------------------------------------------- */
        if (organizationUuid == null || organizationUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID is invalid");
        }

        Organization organization = organizationRepository
                .findByOrganizationUuid(organizationUuid)
                .orElseThrow(() ->
                        new OrganizationNotFoundException("Organization not found")
                );

        /* -------------------------------------------------
         * 2️⃣ Ensure & validate department
         * (FAIL FAST – prevents FK rollback later)
         * ------------------------------------------------- */
        departmentService.ensureDefaultDepartments(organizationUuid);

        if (!departmentService.validateDepartment(request.getDepartment(), organizationUuid)) {
            throw new InvalidEmployeeDataException("Invalid department ID");
        }

        /* -------------------------------------------------
         * 3️⃣ Email uniqueness checks
         * ------------------------------------------------- */
        if (employeeRepository.existsByEmailAndOrganizationUuid(
                request.getEmail(), organizationUuid)) {
            throw new InvalidEmployeeDataException(
                    "Email already exists in this organization"
            );
        }

        Optional<AppUser> existingUser =
                appUserRepository.findByEmail(request.getEmail());

        if (existingUser.isPresent()
                && organizationUuid.equals(existingUser.get().getOrganizationUuid())) {
            throw new InvalidEmployeeDataException(
                    "User with this email already exists"
            );
        }

        /* -------------------------------------------------
         * 4️⃣ Create AppUser (FIRST)
         * ------------------------------------------------- */
        String tempPassword = UUID.randomUUID()
                .toString()
                .substring(0, 8);

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
        log.info("AppUser created with id={}", savedUser.getId());

        /* -------------------------------------------------
         * 5️⃣ Send email (NON-TRANSACTIONAL SIDE EFFECT)
         * Email failure MUST NOT rollback DB
         * ------------------------------------------------- */
        try {
            emailService.sendEmployeePasswordEmail(
                    request.getEmail(),
                    tempPassword,
                    organization.getName()
            );
        } catch (Exception e) {
            log.error("Email sending failed: {}", e.getMessage());
            // intentionally ignored
        }

        /* -------------------------------------------------
         * 6️⃣ Generate employee code (ONLY ONCE)
         * ------------------------------------------------- */
        String employeeCode = generateEmployeeCode(organizationUuid);
        log.info("Generated employee code={}", employeeCode);

        /* -------------------------------------------------
         * 7️⃣ Create Employee entity
         * ------------------------------------------------- */
        Employee employee = new Employee();
        employee.setOrganizationUuid(organizationUuid);
        employee.setAppUserId(savedUser.getId());
        employee.setEmployeeCode(employeeCode);
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setNationalId(request.getNationalId());
        employee.setDesignation(request.getDesignation());
        employee.setDepartmentId(request.getDepartment());
        employee.setBasicSalary(request.getBasicSalary());
        employee.setLeaveCount(request.getLeaveCount());
        employee.setDateOfJoining(request.getDateOfJoining());

        /* ---- SAFE enum conversion ---- */
        try {
            employee.setSalaryType(
                    Employee.SalaryType.valueOf(
                            request.getSalaryType().toUpperCase()
                    )
            );
        } catch (IllegalArgumentException ex) {
            throw new InvalidEmployeeDataException("Invalid salary type");
        }

        employee.setIsActive("Active".equalsIgnoreCase(request.getStatus()));
        employee.setCreatedAt(LocalDateTime.now());
        employee.setUpdatedAt(LocalDateTime.now());

        /* -------------------------------------------------
         * 8️⃣ Persist employee
         * save() is enough – commit happens after method ends
         * ------------------------------------------------- */
        Employee savedEmployee = employeeRepository.save(employee);
        log.info("Employee persisted with id={}", savedEmployee.getId());

        /* -------------------------------------------------
         * 9️⃣ Link AppUser → Employee
         * ------------------------------------------------- */
        savedUser.setLinkedEmployeeId(savedEmployee.getId());
        appUserRepository.save(savedUser);

        /* -------------------------------------------------
         * 🔟 Build response AFTER successful persistence
         * ------------------------------------------------- */
        EmployeeResponseDTO responseDto =
                employeeMapper.toDto(savedEmployee);

        return ApiResponse.success(
                "Employee created successfully",
                responseDto
        );
    }


//    /**
//     * Create new employee
//     */
//    @Transactional(rollbackFor = Exception.class)
//    public ApiResponse<EmployeeResponseDTO> createEmployee(String organizationUuid, EmployeeRequestDTO request) {
//        log.info("Creating employee for organization: {} with email: {}", organizationUuid, request.getEmail());
//
//        // Validate organization UUID
//        if (organizationUuid == null || organizationUuid.trim().isEmpty()) {
//            log.error("Organization UUID is null or empty");
//            return ApiResponse.error("Invalid organization");
//        }
//
//        // Get organization
//        Optional<Organization> orgOpt = organizationRepository.findByOrganizationUuid(organizationUuid);
//        if (orgOpt.isEmpty()) {
//            log.error("Organization not found with UUID: {}", organizationUuid);
//            return ApiResponse.error("Organization not found");
//        }
//        Organization organization = orgOpt.get();
//
//        // Validate department ID and ensure departments exist
//        departmentService.ensureDefaultDepartments(organizationUuid);
//
//        if (!departmentService.validateDepartment(request.getDepartment(), organizationUuid)) {
//            throw new InvalidEmployeeDataException("Invalid department ID");
//        }
//
//
//        // Check if email already exists in organization
//        if (employeeRepository.existsByEmailAndOrganizationUuid(request.getEmail(), organizationUuid)) {
//            log.warn("Email {} already exists in organization: {}", request.getEmail(), organizationUuid);
//            return ApiResponse.error("Email already exists in this organization");
//        }
//
//        // Check if email exists as an app user
//        Optional<AppUser> existingUser = appUserRepository.findByEmail(request.getEmail());
//        if (existingUser.isPresent() && existingUser.get().getOrganizationUuid().equals(organizationUuid)) {
//            log.warn("User with email {} already exists in organization: {}", request.getEmail(), organizationUuid);
//            return ApiResponse.error("User with this email already exists");
//        }
//
//        try {
//            // Generate temporary password
//            String tempPassword = UUID.randomUUID().toString().substring(0, 8);
//
//            // Create AppUser first
//            AppUser appUser = AppUser.builder()
//                    .organizationUuid(organizationUuid)
//                    .email(request.getEmail())
//                    .passwordHash(passwordEncoder.encode(tempPassword))
//                    .role(AppUserRole.EMPLOYEE)
//                    .isActive(true)
//                    .createdAt(LocalDateTime.now())
//                    .updatedAt(LocalDateTime.now())
//                    .build();
//
//            appUser.setIsPasswordChangeRequired(true);
//            AppUser savedUser = appUserRepository.save(appUser);
//            log.info("AppUser created with ID: {}", savedUser.getId());
//
//            // Send email with credentials
//            try {
//                emailService.sendEmployeePasswordEmail(request.getEmail(), tempPassword, organization.getName());
//                log.info("Employee password email sent successfully to: {}", request.getEmail());
//            } catch (Exception e) {
//                log.error("Failed to send employee password email: {}", e.getMessage());
//            }
//
//            // Generate employee code
//
//            log.info("Generated employee code: {}");
//
//            String employeeCode = generateEmployeeCode(organizationUuid);
//
//            // Create Employee
//            Employee employee = new Employee();
//            employee.setOrganizationUuid(organizationUuid);
//            employee.setAppUserId(savedUser.getId());
//            employee.setEmployeeCode(employeeCode);
//            employee.setFirstName(request.getFirstName());
//            employee.setLastName(request.getLastName());
//            employee.setEmail(request.getEmail());
//            employee.setPhone(request.getPhone());
//            employee.setNationalId(request.getNationalId());
//            employee.setDesignation(request.getDesignation());
//            employee.setDepartmentId(request.getDepartment());
//            employee.setBasicSalary(request.getBasicSalary());
//            employee.setLeaveCount(request.getLeaveCount());
//            employee.setDateOfJoining(request.getDateOfJoining());
//            employee.setSalaryType(Employee.SalaryType.valueOf(request.getSalaryType().toUpperCase()));
//            employee.setIsActive(request.getStatus().equalsIgnoreCase("Active"));
//            employee.setCreatedAt(LocalDateTime.now());
//            employee.setUpdatedAt(LocalDateTime.now());
//
//            Employee savedEmployee = employeeRepository.saveAndFlush(employee);
////            String code = generateEmployeeCode(organizationUuid);
//            log.info("Employee created with ID: {} and code: {}", savedEmployee.getId());
//
//            // Update AppUser with linked employee ID
//            savedUser.setLinkedEmployeeId(savedEmployee.getId());
//            appUserRepository.save(savedUser);
//            log.info("AppUser updated with linked employee ID: {}", savedEmployee.getId());
//
//            log.info("Employee created successfully with ID: {}", savedEmployee.getId());
//            EmployeeResponseDTO dto = employeeMapper.toDto(savedEmployee);
//            return ApiResponse.success("Employee created successfully", dto);
//
//
//        } catch (Exception e) {
//            log.error("Error creating employee for organization: {} - {}", organizationUuid, e.getMessage(), e);
//            throw new RuntimeException("Failed to create employee: " + e.getMessage(), e);
//        }
//    }

//    //************************************************//
//    //MAKE DEACTIVATE EMPLOYEE//
//    //************************************************//
//    public void deactivateEmployee(String orgUuid, Long id) {
//        // Step 1: Find the employee
//        Optional<Employee> optionalEmployee = employeeRepository.findByIdAndOrganizationUuid(id, orgUuid);
//
//        // Step 2: Check if employee exists
//        if (optionalEmployee.isPresent()) {
//            Employee employee = optionalEmployee.get();
//
//            // Throw exception if already inactive
//            if (!employee.getIsActive()) {
//                throw new EmployeeAlreadyInactiveException(
//                        "Employee with id " + id + " is already inactive."
//                );
//            }
//
//            // Deactivate employee
//            employee.setIsActive(false);
//            employeeRepository.save(employee);
//
//        } else {
//            // Throw exception if employee not found
//            throw new EmployeeNotFoundException(
//                    "Employee with id " + id + " not found in organization " + orgUuid
//            );
//        }
//    }

    //************************************************//
    //Toggle status(active and deactivate)//
    //************************************************//
    @Transactional
    public Employee toggleEmployeeStatus(String orgUuid, Long id) {
        try {
            // 1. Fetch employee
            Employee employee = employeeRepository.findByIdAndOrganizationUuid(id, orgUuid)
                    .orElseThrow(() -> new EmployeeNotFoundException("Employee with ID " + id + " not found in this organization"));

            // 2. Toggle status
            employee.setIsActive(!employee.getIsActive());
            employee.setUpdatedAt(LocalDateTime.now());

            Employee savedEmployee;
            try {
                savedEmployee = employeeRepository.save(employee);
            } catch (DataAccessException dae) {
                throw new RuntimeException("Failed to update employee status in database: " + dae.getMessage(), dae);
            }

            // 3. Update linked AppUser (if exists)
            if (savedEmployee.getAppUserId() != null) {
                try {
                    appUserRepository.findById(savedEmployee.getAppUserId()).ifPresent(user -> {
                        user.setIsActive(savedEmployee.getIsActive());
                        user.setUpdatedAt(LocalDateTime.now());
                        appUserRepository.save(user);
                    });
                } catch (DataAccessException dae) {
                    throw new RuntimeException("Failed to update linked AppUser status: " + dae.getMessage(), dae);
                }
            }

            return savedEmployee;

        } catch (EmployeeNotFoundException enf) {
            // Handle not found
            throw enf;
        } catch (Exception e) {
            // Catch-all for unexpected exceptions
            throw new RuntimeException("Error toggling employee status: " + e.getMessage(), e);
        }
    }



    //************************************************//
    //GET ONE EMPLOYEE//
    //************************************************//
    public EmployeeResponseDTO getEmployeeById(String organizationUuid, Long id) {
        // 1️) Validate organization
        if (organizationUuid == null || organizationUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID is missing");
        }


        // 2️) Fetch employee safely
        Employee employee = employeeRepository
                .findByIdAndOrganizationUuidWithDepartment(id, organizationUuid)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee with id " + id + " not found in this organization"
                        )
                );


        // 3) Map entity → DTO
        return employeeMapper.toDto(employee);

    }




    /**
     * Update employee
     */
    @Transactional
    public ApiResponse<EmployeeResponseDTO> updateEmployee(String organizationUuid, Long id, EmployeeRequestDTO request) {
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
            employee.setNationalId(request.getNationalId());
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
            EmployeeResponseDTO dto = employeeMapper.toDto(savedEmployee);
            return ApiResponse.success("Employee updated successfully", dto);


        } catch (Exception e) {
            log.error("Error updating employee with ID: {}", id, e);
            return ApiResponse.error("Failed to update employee: " + e.getMessage());
        }
    }

    //************************************************//
    //GENERATE EMPLOYEE-CODE AUTOMATICALLY//
    //************************************************//
    public String generateEmployeeCode(String organizationUuid) {

        // 1️⃣ Validate input
        if (organizationUuid == null || organizationUuid.isBlank()) {
            throw new IllegalArgumentException("Organization UUID cannot be null or empty");
        }

        try {
            // 2️⃣ Fetch next number from DB
            Integer nextNumber = employeeRepository.findNextEmployeeNumber(organizationUuid);

            if (nextNumber == null || nextNumber <= 0) {
                throw new IllegalStateException("Failed to generate next employee number");
            }

            // 3️⃣ Format employee code
            return String.format("EMP-%03d", nextNumber);

        } catch (Exception ex) {
            // 4️⃣ Log & wrap exception
            log.error(
                    "Error generating employee code for organizationUuid={}",
                    organizationUuid,
                    ex
            );
            throw new RuntimeException("Unable to generate employee code at this time");
        }
    }

    //************************************************//
    //get count of total employees//
    //************************************************//
    public int getTotalEmployees(String organizationUuid) {

        if (organizationUuid == null || organizationUuid.isBlank()) {
            throw new IllegalArgumentException("Organization UUID cannot be null or empty");
        }

        return employeeRepository.countByOrganizationUuid(organizationUuid);
    }

    //************************************************//
    //get count of total active employees//
    //************************************************//
    public int getTotalActiveEmployees(String organizationUuid) {
        if (organizationUuid == null || organizationUuid.isBlank()) {
            throw new IllegalArgumentException("Organization UUID cannot be null or empty");
        }

        return employeeRepository.countByOrganizationUuidAndIsActive(
                organizationUuid , true
        );
    }
}
