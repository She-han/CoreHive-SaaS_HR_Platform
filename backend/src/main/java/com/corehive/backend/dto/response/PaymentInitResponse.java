
package com.corehive.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitResponse {
    private String orderId;
    private String transactionUuid;
    private BigDecimal amount;
    private String currency;
    private String paymentGateway;
    private String paymentUrl;
    private Map<String, String> paymentData;
    private String message;
    private Boolean isTrial;
}