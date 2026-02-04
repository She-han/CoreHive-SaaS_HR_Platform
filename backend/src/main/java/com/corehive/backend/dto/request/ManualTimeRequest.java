package com.corehive.backend.dto.request;

public class ManualTimeRequest {
    private String manualTime;
    private String date; // LocalDate in format YYYY-MM-DD

    public ManualTimeRequest() {
    }

    public ManualTimeRequest(String manualTime, String date) {
        this.manualTime = manualTime;
        this.date = date;
    }

    public String getManualTime() {
        return manualTime;
    }

    public void setManualTime(String manualTime) {
        this.manualTime = manualTime;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}
