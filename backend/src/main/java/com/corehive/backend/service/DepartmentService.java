package com.corehive.backend.service;

import com.corehive.backend.dto.request.CreateDepartmentRequest;
import com.corehive.backend.model.Department;
import com.corehive.backend.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing departments
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    /**
     * Ensure default departments exist for an organization
     */
    @Transactional
    public void ensureDefaultDepartments(String organizationUuid) {
        try {
            log.info("Ensuring default departments exist for organization: {}", organizationUuid);

            List<Department> existingDepts = departmentRepository.findByOrganizationUuid(organizationUuid);

            if (existingDepts.isEmpty()) {
                log.info("No departments found. Creating default departments for organization: {}", organizationUuid);
                createDefaultDepartments(organizationUuid);
            } else {
                log.info("Found {} existing departments for organization: {}", existingDepts.size(), organizationUuid);
            }

        } catch (Exception e) {
            log.error("Error ensuring default departments for organization: {}", organizationUuid, e);
            throw new RuntimeException("Failed to ensure default departments", e);
        }
    }

    /**
     * Create default departments for an organization
     */
    private void createDefaultDepartments(String organizationUuid) {
        List<Department> defaultDepartments = new ArrayList<>();

        // Default departments
        String[][] deptData = {
                {"Human Resources", "HR"},
                {"Information Technology", "IT"},
                {"Finance", "FIN"},
                {"Operations", "OPS"},
                {"Sales", "SALES"},
                {"Marketing", "MKT"}
        };

        for (String[] dept : deptData) {
            Department department = new Department();
            department.setOrganizationUuid(organizationUuid);
            department.setName(dept[0]);
            department.setCode(dept[1]);
            department.setIsActive(true);
            department.setCreatedAt(LocalDateTime.now());

            defaultDepartments.add(department);
        }

        List<Department> savedDepartments = departmentRepository.saveAll(defaultDepartments);
        log.info("Created {} default departments for organization: {}", savedDepartments.size(), organizationUuid);
    }

    /**
     * Get all departments for an organization
     */
    public List<Department> getDepartmentsByOrganization(String organizationUuid) {
        return departmentRepository.findByOrganizationUuidAndIsActiveTrue(organizationUuid);
    }

    /**
     * Validate if department exists for organization
     */
    public boolean validateDepartment(Long departmentId, String organizationUuid) {
        return departmentRepository.existsByIdAndOrganizationUuid(departmentId, organizationUuid);
    }

    public List<Department> getAll() {
        return departmentRepository.findAll();
    }

    /**
     * Create a new department for an organization
     */
    @Transactional
    public Department createDepartment(String organizationUuid, CreateDepartmentRequest request) {

        Optional<Department> existingDept =
                departmentRepository.findByOrganizationUuidAndName(organizationUuid, request.getName());

        if (existingDept.isPresent()) {
            throw new RuntimeException("Department with the same name already exists");
        }

        Department department = new Department();
        department.setOrganizationUuid(organizationUuid);
        department.setName(request.getName());
        department.setCode(request.getCode());
        department.setManagerId(request.getManagerId());
        department.setIsActive(true);
        department.setCreatedAt(LocalDateTime.now());

        return departmentRepository.save(department);
    }

}
