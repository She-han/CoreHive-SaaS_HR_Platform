package com.corehive.backend.service;

import com.corehive.backend.dto.EmployeeLeaveBalanceDTO;
import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.paginated.PaginatedResponseItemDTO;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.exception.employeeCustomException.EmployeeAlreadyInactiveException;
import com.corehive.backend.exception.employeeCustomException.EmployeeNotFoundException;
import com.corehive.backend.exception.employeeCustomException.InvalidEmployeeDataException;
import com.corehive.backend.exception.employeeCustomException.OrganizationNotFoundException;
import com.corehive.backend.model.*;
import com.corehive.backend.repository.*;
import com.corehive.backend.util.mappers.EmployeeMapper;
import com.corehive.backend.util.RandomTokenUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataAccessException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private final EmployeeLeaveBalanceRepository employeeLeaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final AzureBlobStorageService azureBlobStorageService;
    private final EmployeeFeedbackRepository employeeFeedbackRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceRepository attendanceRepository;
    private final PayslipRepository payslipRepository;
    private final FeedbackSurveyResponseRepository feedbackSurveyResponseRepository;
    private final AttendanceConfigurationRepository attendanceConfigurationRepository;
    private final AllowanceRepository allowanceRepository;
    private final DeductionRepository deductionRepository;

    @Value("${storage.mode:local}")
    private String storageMode;

    @Value("${ai.service.url:http://localhost:8001}")
    private String aiServiceUrl;
    
    private static final String PROFILE_IMAGES_DIR = "uploads/profile-images";
    private static final String PROFILE_IMAGES_URL_PREFIX = "/uploads/profile-images";
    private final RestTemplate restTemplate = new RestTemplate();



    public EmployeeService(EmployeeRepository employeeRepository, EmployeeMapper employeeMapper, 
                          DepartmentRepository departmentRepository, OrganizationRepository organizationRepository, 
                          DepartmentService departmentService, AppUserRepository appUserRepository, 
                          EmailService emailService, PasswordEncoder passwordEncoder,
                          EmployeeLeaveBalanceRepository employeeLeaveBalanceRepository,
                          LeaveTypeRepository leaveTypeRepository,
                          AzureBlobStorageService azureBlobStorageService,
                          EmployeeFeedbackRepository employeeFeedbackRepository,
                          LeaveRequestRepository leaveRequestRepository,
                          AttendanceRepository attendanceRepository,
                          PayslipRepository payslipRepository,
                          FeedbackSurveyResponseRepository feedbackSurveyResponseRepository,
                          AttendanceConfigurationRepository attendanceConfigurationRepository,
                          AllowanceRepository allowanceRepository,
                          DeductionRepository deductionRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeMapper = employeeMapper;
        this.departmentRepository = departmentRepository;
        this.organizationRepository = organizationRepository;
        this.departmentService = departmentService;
        this.appUserRepository = appUserRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.employeeLeaveBalanceRepository = employeeLeaveBalanceRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.azureBlobStorageService = azureBlobStorageService;
        this.employeeFeedbackRepository = employeeFeedbackRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.attendanceRepository = attendanceRepository;
        this.payslipRepository = payslipRepository;
        this.feedbackSurveyResponseRepository = feedbackSurveyResponseRepository;
        this.attendanceConfigurationRepository = attendanceConfigurationRepository;
        this.allowanceRepository = allowanceRepository;
        this.deductionRepository = deductionRepository;
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
        employee.setBankAccNo(request.getBankAccNo());
        employee.setDesignation(request.getDesignation());
        employee.setDepartmentId(request.getDepartment());
        employee.setBasicSalary(request.getBasicSalary());
       
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

        /* -------------------------------------------------
         * 1️⃣1️⃣ Save leave balances for each leave type
         * ------------------------------------------------- */
        if (request.getLeaveBalances() != null && !request.getLeaveBalances().isEmpty()) {
            log.info("Saving {} leave balances for employee {}", 
                    request.getLeaveBalances().size(), savedEmployee.getId());
            
            for (EmployeeLeaveBalanceDTO balanceDTO : request.getLeaveBalances()) {
                EmployeeLeaveBalance balance = new EmployeeLeaveBalance();
                balance.setOrganizationUuid(organizationUuid);
                balance.setEmployeeId(savedEmployee.getId());
                balance.setLeaveTypeId(balanceDTO.getLeaveTypeId());
                balance.setBalance(balanceDTO.getBalance());
                balance.setCreatedAt(LocalDateTime.now());
                balance.setUpdatedAt(LocalDateTime.now());
                
                employeeLeaveBalanceRepository.save(balance);
            }
            
            List<EmployeeLeaveBalanceDTO> savedBalances = getEmployeeLeaveBalances(
                    savedEmployee.getId(), organizationUuid);
            responseDto.setLeaveBalances(savedBalances);
        }

        return ApiResponse.success(responseDto, "Employee created successfully");
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
//            return ApiResponse.success(dto, "Employee created successfully");
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
        EmployeeResponseDTO responseDto = employeeMapper.toDto(employee);
        
        // 4) Load leave balances
        List<EmployeeLeaveBalanceDTO> leaveBalances = getEmployeeLeaveBalances(id, organizationUuid);
        responseDto.setLeaveBalances(leaveBalances);
        
        return responseDto;

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
            employee.setBankAccNo(request.getBankAccNo());
            employee.setDepartmentId(request.getDepartment());
      
            employee.setSalaryType(Employee.SalaryType.valueOf(request.getSalaryType().toUpperCase()));
            employee.setBasicSalary(request.getBasicSalary());
            employee.setDateOfJoining(request.getDateOfJoining());
            employee.setIsActive(request.getStatus().equalsIgnoreCase("Active"));
            employee.setUpdatedAt(LocalDateTime.now());

            Employee savedEmployee = employeeRepository.save(employee);

            // Update leave balances
            if (request.getLeaveBalances() != null && !request.getLeaveBalances().isEmpty()) {
                log.info("Updating {} leave balances for employee {}", 
                        request.getLeaveBalances().size(), savedEmployee.getId());
                
                for (EmployeeLeaveBalanceDTO balanceDTO : request.getLeaveBalances()) {
                    Optional<EmployeeLeaveBalance> existingBalance = 
                            employeeLeaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndOrganizationUuid(
                                    savedEmployee.getId(), balanceDTO.getLeaveTypeId(), organizationUuid);
                    
                    if (existingBalance.isPresent()) {
                        EmployeeLeaveBalance balance = existingBalance.get();
                        balance.setBalance(balanceDTO.getBalance());
                        balance.setUpdatedAt(LocalDateTime.now());
                        employeeLeaveBalanceRepository.save(balance);
                    } else {
                        EmployeeLeaveBalance balance = new EmployeeLeaveBalance();
                        balance.setOrganizationUuid(organizationUuid);
                        balance.setEmployeeId(savedEmployee.getId());
                        balance.setLeaveTypeId(balanceDTO.getLeaveTypeId());
                        balance.setBalance(balanceDTO.getBalance());
                        balance.setCreatedAt(LocalDateTime.now());
                        balance.setUpdatedAt(LocalDateTime.now());
                        employeeLeaveBalanceRepository.save(balance);
                    }
                }
            }

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
            
            List<EmployeeLeaveBalanceDTO> leaveBalances = getEmployeeLeaveBalances(
                    savedEmployee.getId(), organizationUuid);
            dto.setLeaveBalances(leaveBalances);
            
            return ApiResponse.success(dto, "Employee updated successfully");


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

    /**
     * Get employee by email (for current user profile)
     */
    public ApiResponse<Employee> getEmployeeByEmail(String organizationUuid, String email) {
        try {
            log.info("Fetching employee with email: {} for organization: {}", email, organizationUuid);

            Optional<Employee> employeeOpt = employeeRepository.findByEmailAndOrganizationUuid(email, organizationUuid);

            if (employeeOpt.isEmpty()) {
                log.warn("Employee not found with email: {}", email);
                return ApiResponse.error("Employee profile not found");
            }

            Employee employee = employeeOpt.get();
            applyProfileImageNormalization(employee);
            log.info("Employee profile retrieved successfully for: {}", email);
            return ApiResponse.success(employee, "Employee profile retrieved successfully");

        } catch (Exception e) {
            log.error("Error fetching employee with email: {}", email, e);
            return ApiResponse.error("Failed to retrieve employee profile");
        }
    }

    /**
     * Update employee by email (for current user profile)
     */
    @Transactional
    public ApiResponse<Employee> updateEmployeeByEmail(String organizationUuid, String email, 
                                                      String firstName, String lastName, String phone, 
                                                      MultipartFile profileImage) {
        try {
            log.info("Updating employee with email: {} for organization: {}", email, organizationUuid);

            Optional<Employee> employeeOpt = employeeRepository.findByEmailAndOrganizationUuid(email, organizationUuid);

            if (employeeOpt.isEmpty()) {
                log.warn("Employee not found with email: {}", email);
                return ApiResponse.error("Employee profile not found");
            }

            Employee employee = employeeOpt.get();

            // Employees can only update limited fields (not email, salary, department, etc.)
            employee.setFirstName(firstName);
            employee.setLastName(lastName);
            employee.setPhone(phone);
            
            // Handle profile image upload
            if (profileImage != null && !profileImage.isEmpty()) {
                try {
                    String imageUrl = saveProfileImage(profileImage, employee.getId(), organizationUuid);
                    employee.setProfileImage(imageUrl);
                    log.info("Profile image saved for employee: {}", email);
                } catch (IOException e) {
                    log.error("Error saving profile image for employee: {}", email, e);
                    return ApiResponse.error("Failed to upload profile image");
                }
            }
            
            employee.setUpdatedAt(LocalDateTime.now());

            Employee savedEmployee = employeeRepository.save(employee);
            applyProfileImageNormalization(savedEmployee);

            log.info("Employee profile updated successfully for: {}", email);
            return ApiResponse.success(savedEmployee, "Profile updated successfully");

        } catch (Exception e) {
            log.error("Error updating employee with email: {}", email, e);
            return ApiResponse.error("Failed to update profile: " + e.getMessage());
        }
    }
    
    /**
     * Save profile image to file system
     */
    private String saveProfileImage(MultipartFile file, Long employeeId, String organizationUuid) throws IOException {
        // Azure mode
        if ("azure".equalsIgnoreCase(storageMode) && azureBlobStorageService.isAzureEnabled()) {
            return azureBlobStorageService.uploadProfileImage(file, organizationUuid, employeeId);
        }

        // Local mode (default)
        Path uploadPath = Paths.get(PROFILE_IMAGES_DIR, organizationUuid);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = "employee_" + employeeId + "_" + System.currentTimeMillis() + extension;

        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return PROFILE_IMAGES_URL_PREFIX + "/" + organizationUuid + "/" + filename;
    }

    private void applyProfileImageNormalization(Employee employee) {
        if (employee == null) {
            return;
        }
        employee.setProfileImage(normalizeProfileImageUrl(employee.getProfileImage()));
    }

    private String normalizeProfileImageUrl(String profileImage) {
        if (profileImage == null) {
            return null;
        }

        String trimmed = profileImage.trim();
        if (trimmed.isEmpty()) {
            return null;
        }

        String normalized = trimmed.replace("\\", "/");

        if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
            return normalized;
        }

        if (normalized.startsWith(PROFILE_IMAGES_URL_PREFIX)) {
            return normalized;
        }

        if (normalized.startsWith("uploads/")) {
            return "/" + normalized;
        }

        int uploadsIndex = normalized.indexOf("uploads/");
        if (uploadsIndex >= 0) {
            return "/" + normalized.substring(uploadsIndex);
        }

        return normalized;
    }

    /**
     * Generate permanent QR token for employee by employee code
     */
    @Transactional
    public String generatePermanentQrByEmployeeCode(String employeeCode, String organizationUuid) {
        log.info("Generating permanent QR for employee code: {} in organization: {}", employeeCode, organizationUuid);

        // Find employee by employee code and organization UUID
        Optional<Employee> employeeOpt = employeeRepository.findByEmployeeCodeAndOrganizationUuid(employeeCode, organizationUuid);

        if (employeeOpt.isEmpty()) {
            log.error("Employee not found with code: {} in organization: {}", employeeCode, organizationUuid);
            throw new EmployeeNotFoundException("Employee not found with code: " + employeeCode);
        }

        Employee employee = employeeOpt.get();

        // If QR token already exists, return it
        if (employee.getQrToken() != null && !employee.getQrToken().isEmpty()) {
            log.info("Returning existing QR token for employee: {}", employeeCode);
            return employee.getQrToken();
        }

        // Generate new QR token
        String qrToken = RandomTokenUtil.generateEmployeeQrToken();
        employee.setQrToken(qrToken);
        employee.setUpdatedAt(LocalDateTime.now());

        employeeRepository.save(employee);
        log.info("Generated and saved new QR token for employee: {}", employeeCode);

        return qrToken;
    }
    
    /**
     * Get employee leave balances with leave type details
     */
    private List<EmployeeLeaveBalanceDTO> getEmployeeLeaveBalances(Long employeeId, String organizationUuid) {
        List<EmployeeLeaveBalance> balances = employeeLeaveBalanceRepository
                .findByEmployeeIdAndOrganizationUuid(employeeId, organizationUuid);
        
        return balances.stream().map(balance -> {
            EmployeeLeaveBalanceDTO dto = new EmployeeLeaveBalanceDTO();
            dto.setLeaveTypeId(balance.getLeaveTypeId());
            dto.setBalance(balance.getBalance());
            
            leaveTypeRepository.findById(balance.getLeaveTypeId()).ifPresent(leaveType -> {
                dto.setLeaveTypeName(leaveType.getName());
                dto.setLeaveTypeCode(leaveType.getCode());
            });
            
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Get leave balances for employee by email (for logged-in employee)
     */
    public ApiResponse<List<java.util.Map<String, Object>>> getEmployeeLeaveBalances(String organizationUuid, String userEmail) {
        try {
            // Find employee by email
            Employee employee = employeeRepository.findByEmailAndOrganizationUuid(userEmail, organizationUuid)
                    .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with email: " + userEmail));

            // Get leave balances
            List<EmployeeLeaveBalance> balances = employeeLeaveBalanceRepository
                    .findByEmployeeIdAndOrganizationUuid(employee.getId(), organizationUuid);

            // Build response with leave type details
            List<java.util.Map<String, Object>> result = balances.stream().map(balance -> {
                java.util.Map<String, Object> balanceData = new java.util.HashMap<>();
                balanceData.put("leaveTypeId", balance.getLeaveTypeId());
                balanceData.put("balance", balance.getBalance());

                // Get leave type details
                leaveTypeRepository.findById(balance.getLeaveTypeId()).ifPresent(leaveType -> {
                    balanceData.put("leaveTypeName", leaveType.getName());
                    balanceData.put("leaveTypeCode", leaveType.getCode());
                });

                return balanceData;
            }).collect(Collectors.toList());

            return ApiResponse.success(result, "Leave balances fetched successfully");
        } catch (EmployeeNotFoundException e) {
            log.error("Employee not found: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Error fetching employee leave balances", e);
            return ApiResponse.error("Failed to fetch leave balances");
        }
    }

    /**
     * Get yearly employee growth chart data for dashboard charts
     * Returns monthly employee counts for a specific year
     */
    public List<Map<String, Object>> getYearlyEmployeeGrowthChartData(String organizationUuid, int year) {
        List<Map<String, Object>> chartData = new ArrayList<>();
        
        String[] monthNames = {
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        };
        
        for (int month = 1; month <= 12; month++) {
            LocalDate endOfMonth = LocalDate.of(year, month, 1).withDayOfMonth(
                LocalDate.of(year, month, 1).lengthOfMonth()
            );
            
            // Count employees who were created before or on end of month
            long employeeCount = employeeRepository.countByOrganizationUuidAndCreatedAtBefore(
                organizationUuid, endOfMonth.atTime(23, 59, 59)
            );
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthNames[month - 1]);
            monthData.put("monthNumber", month);
            monthData.put("totalEmployees", employeeCount);
            monthData.put("year", year);
            
            chartData.add(monthData);
        }
        
        return chartData;
    }

    /**
     * Delete an employee
     * Validates organization and employee existence before deletion
     */
    @Transactional
    public void deleteEmployee(String organizationUuid, Long employeeId) {
        log.info("Deleting employee with ID: {} for organization: {}", employeeId, organizationUuid);
        
        // Validate employee exists and belongs to organization
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with ID: " + employeeId));
        
        if (!employee.getOrganizationUuid().equals(organizationUuid)) {
            throw new InvalidEmployeeDataException("Employee does not belong to this organization");
        }

        // Best-effort cleanup in AI service: remove face photo + embedding record for this employee.
        deregisterEmployeeFaceData(organizationUuid, employeeId);

        // Delete records that directly depend on employee FK or employee id.
        employeeFeedbackRepository.deleteByEmployee_Id(employeeId);
        leaveRequestRepository.deleteByOrganizationUuidAndEmployee_Id(organizationUuid, employeeId);
        attendanceRepository.deleteByOrganizationUuidAndEmployeeId(organizationUuid, employeeId);
        payslipRepository.deleteByOrganizationUuidAndEmployeeId(organizationUuid, employeeId);
        feedbackSurveyResponseRepository.deleteByEmployeeId(employeeId);

        // Delete employee-targeted rules/configurations.
        attendanceConfigurationRepository.deleteByOrganizationUuidAndEmployeeId(organizationUuid, employeeId);
        allowanceRepository.deleteByOrganizationUuidAndEmployeeId(organizationUuid, employeeId);
        deductionRepository.deleteByOrganizationUuidAndEmployeeId(organizationUuid, employeeId);
        
        // Delete associated leave balances first (to avoid foreign key constraint)
        List<EmployeeLeaveBalance> leaveBalances = employeeLeaveBalanceRepository.findByEmployeeIdAndOrganizationUuid(employeeId, organizationUuid);
        if (!leaveBalances.isEmpty()) {
            employeeLeaveBalanceRepository.deleteAll(leaveBalances);
            log.info("Deleted {} leave balance records for employee ID: {}", leaveBalances.size(), employeeId);
        }
        
        // Delete associated AppUser if exists
        if (employee.getAppUserId() != null) {
            appUserRepository.deleteById(employee.getAppUserId());
            log.info("Deleted associated AppUser with ID: {}", employee.getAppUserId());
        }
        
        // Delete employee
        employeeRepository.delete(employee);
        log.info("Successfully deleted employee with ID: {}", employeeId);
    }

    private void deregisterEmployeeFaceData(String organizationUuid, Long employeeId) {
        String baseUrl = normalizeAiServiceBaseUrl(aiServiceUrl);
        String endpoint = String.format(
                "%s/api/face/deregister/%s/%s",
                baseUrl,
                organizationUuid,
                employeeId
        );

        try {
            ResponseEntity<String> response = restTemplate.exchange(endpoint, HttpMethod.DELETE, null, String.class);
            log.info(
                    "AI face deregistration response for employee {} in org {}: status={}",
                    employeeId,
                    organizationUuid,
                    response.getStatusCode().value()
            );
        } catch (HttpStatusCodeException ex) {
            if (ex.getStatusCode().value() == 404) {
                log.info(
                        "No existing face registration found for employee {} in org {}. Skipping AI cleanup.",
                        employeeId,
                        organizationUuid
                );
                return;
            }

            log.warn(
                    "AI face deregistration failed for employee {} in org {}: status={} body={}",
                    employeeId,
                    organizationUuid,
                    ex.getStatusCode().value(),
                    ex.getResponseBodyAsString()
            );
        } catch (Exception ex) {
            log.warn(
                    "Could not call AI face deregistration for employee {} in org {}: {}",
                    employeeId,
                    organizationUuid,
                    ex.getMessage()
            );
        }
    }

    private String normalizeAiServiceBaseUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return "http://localhost:8001";
        }

        String trimmed = rawUrl.trim();
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            trimmed = "https://" + trimmed;
        }

        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }

        return trimmed;
    }
}
