package com.corehive.backend.dto.request;

import com.corehive.backend.model.Notice;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoticeRequestDTO {

    private String title;
    private String content;
    private Notice.Priority priority;
    private LocalDateTime publishAt;
    private LocalDateTime expireAt;
    private Notice.Status status;
}
