package com.corehive.backend.repository;

import com.corehive.backend.model.DeductionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeductionItemRepository extends JpaRepository<DeductionItem, Long> {
    List<DeductionItem> findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
