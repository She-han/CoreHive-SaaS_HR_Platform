package com.corehive.backend.repository;

import com.corehive.backend.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByOrganizationUuid(String organizationUuid);
    Optional<PaymentTransaction> findByTransactionUuid(String transactionUuid);
    Optional<PaymentTransaction> findByGatewayOrderId(String gatewayOrderId);
}