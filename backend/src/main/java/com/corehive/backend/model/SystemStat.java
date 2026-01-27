package com.corehive.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class SystemStat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double cpu;
    private double memory;
    private String time;

    // Default Constructor (JPA සඳහා අවශ්‍යයි)
    public SystemStat() {}

    // Getters and Setters (මෙන්න මේවා නැති නිසයි Scheduler එකේ error එකක් ආවේ)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getCpu() { return cpu; }
    public void setCpu(double cpu) { this.cpu = cpu; }

    public double getMemory() { return memory; }
    public void setMemory(double memory) { this.memory = memory; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
}
