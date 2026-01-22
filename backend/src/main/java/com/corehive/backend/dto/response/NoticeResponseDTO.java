package com.corehive.backend.dto.response;

import com.corehive.backend.model.Notice;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoticeResponseDTO {

    private Long id;
    private String title;
    private String content;
    private Notice.Priority priority;
    private Notice.Status status;
    private LocalDateTime publishAt;
    private LocalDateTime expireAt;
    private LocalDateTime createdAt;
    private String createdByName;
}
