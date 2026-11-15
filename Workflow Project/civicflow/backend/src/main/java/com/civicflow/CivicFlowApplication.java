package com.civicflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CivicFlowApplication {
    public static void main(String[] args) {
        SpringApplication.run(CivicFlowApplication.class, args);
    }
}

