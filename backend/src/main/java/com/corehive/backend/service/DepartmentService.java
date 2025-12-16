package com.corehive.backend.service;

import com.corehive.backend.dto.DepartmentDTO;
import com.corehive.backend.dto.request.CreateDepartmentRequest;
import com.corehive.backend.model.Department;
import com.corehive.backend.repository.DepartmentRepository;
import com.corehive.backend.util.mappers.DepartmentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    /**
     * Ensure default departments exist for an organization
     */
    @Transactional
    public void ensureDefaultDepartments(String organizationUuid) {
        List<Department> existingDepartments = departmentRepository.findByOrganizationUuid(organizationUuid);

        if (existingDepartments.isEmpty()) {
            log.info("No departments found. Creating default departments for organization: {}", organizationUuid);
            createDefaultDepartments(organizationUuid);
        } else {
            log.info("Found {} departments for organization: {}", existingDepartments.size(), organizationUuid);
        }
    }

    /**
     * Create default departments
     */
    private void createDefaultDepartments(String organizationUuid) {
        String[][] defaultDeptData = {
                {"Human Resources", "HR"},
                {"Information Technology", "IT"},
                {"Finance", "FIN"},
                {"Operations", "OPS"},
                {"Sales", "SALES"},
                {"Marketing", "MKT"}
        };

        List<Department> defaultDepartments = new ArrayList<>();
        for (String[] dept : defaultDeptData) {
            Department department = new Department();
            department.setOrganizationUuid(organizationUuid);
            department.setName(dept[0]);
            department.setCode(dept[1]);
            department.setIsActive(true);
            department.setCreatedAt(LocalDateTime.now());
            defaultDepartments.add(department);
        }

        departmentRepository.saveAll(defaultDepartments);
        log.info("Created {} default departments for organization: {}", defaultDepartments.size(), organizationUuid);
    }

    /**
     * Get all active departments as DTOs
     */
    public List<DepartmentDTO> getDepartmentsByOrganizationDto(String organizationUuid) {
        List<Department> departments = departmentRepository.findByOrganizationUuidAndIsActiveTrue(organizationUuid);
        return departmentMapper.toDtos(departments);
    }

    /**
     * Create a new department and return as DTO
     */
    @Transactional
    public DepartmentDTO createDepartmentDto(String organizationUuid, CreateDepartmentRequest request) {
        Optional<Department> existingDept = departmentRepository
                .findByOrganizationUuidAndName(organizationUuid, request.getName());

        if (existingDept.isPresent()) {
            throw new RuntimeException("Department with the same name already exists");
        }

        Department department = departmentMapper.toEntity(request);
        department.setOrganizationUuid(organizationUuid);
        department.setIsActive(true);
        department.setCreatedAt(LocalDateTime.now());

        Department savedDepartment = departmentRepository.save(department);
        log.info("Department created with ID: {} for organization: {}", savedDepartment.getId(), organizationUuid);
        return departmentMapper.toDto(savedDepartment);
    }

    /**
     * Update an existing department
     */
    @Transactional
    public DepartmentDTO updateDepartmentDto(Long departmentId, CreateDepartmentRequest request, String organizationUuid) {
        Department existingDept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        if (!existingDept.getOrganizationUuid().equals(organizationUuid)) {
            throw new RuntimeException("Department does not belong to this organization");
        }

        // Update fields using mapper
        departmentMapper.updateDepartmentFromDto(request, existingDept);
        Department updatedDept = departmentRepository.save(existingDept);

        log.info("Department updated with ID: {} for organization: {}", updatedDept.getId(), organizationUuid);
        return departmentMapper.toDto(updatedDept);
    }

    /**
     * Validate if a department exists in the organization
     */
    public boolean validateDepartment(Long departmentId, String organizationUuid) {
        return departmentRepository.existsByIdAndOrganizationUuid(departmentId, organizationUuid);
    }
}
