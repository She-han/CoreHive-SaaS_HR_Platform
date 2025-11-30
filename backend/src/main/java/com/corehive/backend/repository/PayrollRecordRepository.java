package com.corehive.backend.repository;

import com.corehive.backend.model.PayrollRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayrollRecordRepository extends JpaRepository<PayrollRecord, Long> {
    List<PayrollRecord> findByPeriodYearAndPeriodMonth(int year, int month);
    List<PayrollRecord> findByEmployeeId(Long employeeId);
    @Query("SELECT p FROM PayrollRecord p ORDER BY p.periodYear ASC, p.periodMonth ASC")
    List<PayrollRecord> findAllSorted();

}
