package com.corehive.backend.dto.request;

public class ManualTimeRequest {
    private String manualTime;

    public ManualTimeRequest() {
    }

    public ManualTimeRequest(String manualTime) {
        this.manualTime = manualTime;
    }

    public String getManualTime() {
        return manualTime;
    }

    public void setManualTime(String manualTime) {
        this.manualTime = manualTime;
    }
}
