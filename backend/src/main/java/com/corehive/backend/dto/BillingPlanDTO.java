package com.corehive.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillingPlanDTO {

    private Long id;
    private String name;
    private String price;
    private String period;
    private String description;
    private String employees;
    private List<String> features = new ArrayList<>();
    private List<Long> moduleIds = new ArrayList<>();
    private boolean popular;
    private boolean active;
}
