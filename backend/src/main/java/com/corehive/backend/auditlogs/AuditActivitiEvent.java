package com.corehive.backend.auditlogs;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class AuditActivitiEvent extends ApplicationEvent {
    private final String userEmail;
    private final String role;
    private final String action;
    private final String resource;
    private final String details;
    private final String severity;
    private final String ip;

    public AuditActivitiEvent(Object source, String userEmail, String role, String action, String resource, String details, String severity, String ip) {
        super(source);
        this.userEmail = userEmail;
        this.role = role;
        this.action = action;
        this.resource = resource;
        this.details = details;
        this.severity = severity;
        this.ip = ip;
    }
}
