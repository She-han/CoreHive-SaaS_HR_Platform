

package com.corehive.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "payhere")
@Data
public class PayHereConfig {
    private String merchantId;
    private String merchantSecret;
    private String notifyUrl;
    private String returnUrl;
    private String cancelUrl;
    private String currency;
    private boolean sandbox;

    public String getPaymentUrl() {
        return sandbox
                ? "https://sandbox.payhere.lk/pay/checkout"
                : "https://www.payhere.lk/pay/checkout";
    }
}