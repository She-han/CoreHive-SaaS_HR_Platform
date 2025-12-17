package com.corehive.backend.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DailySummaryCountDTO {
    private int present;
    private int late;
    private int onLeave;
    private int absent;
}
