package com.corehive.backend.dto;


public class TenantGrowthDTO {
    private String month;
    private long activeUsers;
    private long newTenants;

    // Constructor
    public TenantGrowthDTO(String month, long activeUsers, long newTenants) {
        this.month = month;
        this.activeUsers = activeUsers;
        this.newTenants = newTenants;
    }

    // Getters and Setters 
    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

    public long getNewTenants() { return newTenants; }
    public void setNewTenants(long newTenants) { this.newTenants = newTenants; }
}
