package com.corehive.backend.repository;

import com.corehive.backend.model.Subscription;
import com.corehive.backend.model.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByOrganizationUuid(String organizationUuid);
    Optional<Subscription> findBySubscriptionUuid(String subscriptionUuid);
    List<Subscription> findByStatusInAndNextBillingDateLessThanEqual(List<SubscriptionStatus> statuses, LocalDateTime dateTime);
}