package com.corehive.backend.repository;

import com.corehive.backend.model.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    Page<Notice> findAllByOrganizationUuid(String organizationUuid, Pageable pageable);

    Optional<Notice> findByIdAndOrganizationUuid(Long id, String organizationUuid);
}
