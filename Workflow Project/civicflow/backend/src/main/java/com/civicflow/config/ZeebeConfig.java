package com.civicflow.config;

import io.camunda.zeebe.client.ZeebeClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class ZeebeConfig {

    @Value("${civicflow.camunda.zeebe.gateway:127.0.0.1:26500}")
    private String zeebeGateway;

    @Bean(destroyMethod = "close")
    public ZeebeClient zeebeClient() {
        log.info("Initializing non-blocking ZeebeClient pointing to {}", zeebeGateway);
        return ZeebeClient.newClientBuilder()
                .gatewayAddress(zeebeGateway)
                .usePlaintext()
                .build();
    }
}
