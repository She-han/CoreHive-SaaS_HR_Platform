package com.corehive.backend.service;

import com.corehive.backend.advisor.AppWideException;
import com.corehive.backend.dto.request.NoticeRequestDTO;
import com.corehive.backend.dto.response.NoticeResponseDTO;
import com.corehive.backend.model.Notice;
import com.corehive.backend.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

    /* =========================
       CREATE NOTICE
       ========================= */
    public NoticeResponseDTO createNotice(
            String organizationUuid,
            NoticeRequestDTO req,
            Long userId
    ) throws BadRequestException {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new BadRequestException(
                    "Notice title cannot be empty"
            );
        }

        if (req.getPublishAt() == null) {
            throw new BadRequestException(
                    "Publish date is required"
            );
        }

        Notice notice = new Notice();
        notice.setOrganizationUuid(organizationUuid);
        notice.setTitle(req.getTitle());
        notice.setContent(req.getContent());
        notice.setPriority(req.getPriority());
        notice.setPublishAt(req.getPublishAt());
        notice.setExpireAt(req.getExpireAt());
        notice.setStatus(req.getStatus());
        notice.setCreatedBy(userId);

        // ✅ Audit
        notice.setCreatedAt(LocalDateTime.now());
        notice.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(noticeRepository.save(notice));
    }

    /* =========================
       GET ALL NOTICES
       ========================= */
    public Page<NoticeResponseDTO> getAllNotices(
            String organizationUuid,
            int page,
            int size
    ) throws BadRequestException {
        if (page < 0 || size <= 0) {
            throw new BadRequestException(
                    "Invalid pagination parameters"
            );
        }

        Pageable pageable =
                PageRequest.of(page, size, Sort.by("publishAt").descending());

        Page<Notice> notices =
                noticeRepository.findAllByOrganizationUuid(
                        organizationUuid, pageable
                );

        return new PageImpl<>(
                notices.getContent()
                        .stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList()),
                pageable,
                notices.getTotalElements()
        );
    }

    /* =========================
       GET ONE NOTICE
       ========================= */
    public NoticeResponseDTO getNoticeById(
            String organizationUuid,
            Long id
    ) {
        Notice notice = noticeRepository
                .findByIdAndOrganizationUuid(id, organizationUuid)
                .orElseThrow(() ->
                        new AppWideException.ResourceNotFoundException(
                                "Notice not found with id: " + id
                        )
                );

        return mapToResponse(notice);
    }

    /* =========================
       UPDATE NOTICE
       ========================= */
    public NoticeResponseDTO updateNotice(
            String organizationUuid,
            Long id,
            NoticeRequestDTO req
    ) {
        Notice notice = noticeRepository
                .findByIdAndOrganizationUuid(id, organizationUuid)
                .orElseThrow(() ->
                        new AppWideException.ResourceNotFoundException(
                                "Notice not found with id: " + id
                        )
                );

        notice.setTitle(req.getTitle());
        notice.setContent(req.getContent());
        notice.setPriority(req.getPriority());
        notice.setPublishAt(req.getPublishAt());
        notice.setExpireAt(req.getExpireAt());
        notice.setStatus(req.getStatus());

        // ✅ Audit
        notice.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(noticeRepository.save(notice));
    }

    /* =========================
       DELETE NOTICE
       ========================= */
    public void deleteNotice(String organizationUuid, Long id) {
        Notice notice = noticeRepository
                .findByIdAndOrganizationUuid(id, organizationUuid)
                .orElseThrow(() ->
                        new AppWideException.ResourceNotFoundException(
                                "Notice not found with id: " + id
                        )
                );

        noticeRepository.delete(notice);
    }

    /* =========================
       MAPPER
       ========================= */
    private NoticeResponseDTO mapToResponse(Notice notice) {
        NoticeResponseDTO dto = new NoticeResponseDTO();
        dto.setId(notice.getId());
        dto.setTitle(notice.getTitle());
        dto.setContent(notice.getContent());
        dto.setPriority(notice.getPriority());
        dto.setStatus(notice.getStatus());
        dto.setPublishAt(notice.getPublishAt());
        dto.setExpireAt(notice.getExpireAt());
        dto.setCreatedAt(notice.getCreatedAt());
        return dto;
    }
}
