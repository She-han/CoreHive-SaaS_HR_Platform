package com.corehive.backend.dto;

import lombok.*;
import java.util.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DailyMonitorDto {
    private String date;
    private Map<String, Integer> summary;
    private List<AttendanceRowDto> data;
}
