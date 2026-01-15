package com.corehive.backend.model;

import org.springframework.context.ApplicationEvent;

public class AuditActivities extends ApplicationEvent {
    private final String user;
    private final String role;
    private final String action;
    private final String resource;
    private final String details;
    private final String severity;
    private final String ip;

    public AuditActivities(Object source, String user, String role, String action, String resource, String details, String severity, String ip){
        super(source);
        this.user = user;
        this.role = role;
        this.action = action;
        this.resource = resource;
        this.details = details;
        this.severity = severity;
        this.ip = ip;
    }
    public String getUser() { return user; }
    public String getRole() { return role; }
    public String getAction() { return action; }
    public String getResource() { return resource; }
    public String getDetails() { return details; }
    public String getSeverity() { return severity; }
    public String getIp() { return ip; }
}
