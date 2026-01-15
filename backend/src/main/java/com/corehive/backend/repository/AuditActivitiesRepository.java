package com.corehive.backend.repository;

import com.corehive.backend.model.AuditActivities;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditActivitiesRepository extends JpaRepository<AuditActivities, Long> {

}
