package com.corehive.backend.dto.request;

import com.corehive.backend.model.Notice;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoticeRequestDTO {

    @NotBlank(message = "Title cannot be empty")
    @Size(min = 5, max = 100)
    private String title;

    @NotBlank(message = "Content cannot be empty")
    @Size(min = 10)
    private String content;

    @NotNull(message = "Publish date is required")
    private LocalDateTime publishAt;

    private LocalDateTime expireAt;

    @NotNull
    private Notice.Priority priority;

    @NotNull
    private Notice.Status status;
}
