package com.corehive.backend.service;

import com.corehive.backend.model.AuditActivities;
import com.corehive.backend.repository.AuditActivitiesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditActivitiesService {

    @Autowired
    private AuditActivitiesRepository auditActivitiesRepository;

    public List<AuditActivities> getAllActivities(){
        return auditActivitiesRepository.findAll(Sort.by(Sort.Direction.DESC, "timestamp"));
    }

    public void saveActivities(AuditActivities log){
        auditActivitiesRepository.save(log);

    }
}
