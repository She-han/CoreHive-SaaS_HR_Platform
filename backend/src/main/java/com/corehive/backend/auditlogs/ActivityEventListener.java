package com.corehive.backend.auditlogs;

import com.corehive.backend.model.AuditActivities;
import com.corehive.backend.service.AuditActivitiesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ActivityEventListener {
    @Autowired
    private AuditActivitiesService auditActivitiesService;

    @EventListener
    @Async
    public void handleActivityEvent(AuditActivitiEvent event) {
        AuditActivities log = new AuditActivities();
        log.setTimestamp(LocalDateTime.now());
        log.setUserEmail(event.getUserEmail());
        log.setRole(event.getRole());
        log.setAction(event.getAction());
        log.setResource(event.getResource());
        log.setDetails(event.getDetails());
        log.setSeverity(event.getSeverity());
        log.setIp(event.getIp());

        // AuditActivitiesService හි ඇති saveActivities method එක භාවිතා කිරීම
        auditActivitiesService.saveActivities(log);
    }
}
