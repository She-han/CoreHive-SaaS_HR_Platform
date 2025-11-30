package com.corehive.backend.repository;

import com.corehive.backend.model.AllowanceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AllowanceItemRepository extends JpaRepository<AllowanceItem, Long> {
    List<AllowanceItem> findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
