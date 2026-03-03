package com.banking.platform.service;

import com.banking.platform.entity.Account;
import com.banking.platform.exception.BadRequestException;
import com.banking.platform.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FraudDetectionService Tests")
class FraudDetectionServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @InjectMocks private FraudDetectionService fraudDetectionService;

    private Account account;

    @BeforeEach
    void setUp() {
        account = Account.builder()
                .id(1L)
                .accountNumber("1000000001")
                .balance(new BigDecimal("500000.00"))
                .build();
    }

    @Test
    @DisplayName("should block transactions exceeding single-transaction limit")
    void blockExceedingSingleLimit() {
        BigDecimal amount = new BigDecimal("250000.00"); // > 200,000 limit

        assertThatThrownBy(() -> fraudDetectionService.checkForSuspiciousActivity(account, amount))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("single-transaction limit");
    }

    @Test
    @DisplayName("should allow transactions under the single-transaction limit")
    void allowUnderLimit() {
        BigDecimal amount = new BigDecimal("10000.00");

        // No repository call needed for amounts under high-value threshold
        assertThatCode(() -> fraudDetectionService.checkForSuspiciousActivity(account, amount))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("should block multiple high-value transactions in short window")
    void blockVelocityAbuse() {
        BigDecimal amount = new BigDecimal("60000.00"); // > 50,000 threshold

        when(transactionRepository.countHighValueTransactionsSince(eq(1L), any(), any()))
                .thenReturn(3L); // already 3 high-value txns

        assertThatThrownBy(() -> fraudDetectionService.checkForSuspiciousActivity(account, amount))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Unusual activity detected");
    }

    @Test
    @DisplayName("should allow high-value transaction when velocity is low")
    void allowWhenVelocityIsLow() {
        BigDecimal amount = new BigDecimal("60000.00");

        when(transactionRepository.countHighValueTransactionsSince(eq(1L), any(), any()))
                .thenReturn(1L); // only 1 recent high-value txn

        assertThatCode(() -> fraudDetectionService.checkForSuspiciousActivity(account, amount))
                .doesNotThrowAnyException();
    }
}
