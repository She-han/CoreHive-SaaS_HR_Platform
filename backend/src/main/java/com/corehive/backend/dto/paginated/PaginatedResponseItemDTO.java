package com.corehive.backend.dto.paginated;

import com.corehive.backend.dto.response.EmployeeResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PaginatedResponseItemDTO<T> {
    private List<T> items;      // The list of items
    private int page;           // Current page number
    private int size;           // Page size
    private long totalItems;    // Total number of items
    private int totalPages;     // Total number of pages
}
