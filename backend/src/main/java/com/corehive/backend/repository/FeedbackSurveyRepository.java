package com.corehive.backend.repository;

import com.corehive.backend.model.FeedbackSurvey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackSurveyRepository extends JpaRepository<FeedbackSurvey, Long> {

    // load all surveys for an organization
    List<FeedbackSurvey> findByOrganizationUuid(String orgUuid);
}

