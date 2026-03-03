package com.banking.platform;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class BankingPlatformApplicationTests {

    @Test
    void contextLoads() {
        // Verifies that the Spring context initialises without errors
    }
}
