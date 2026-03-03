package com.banking.platform.service;

import com.banking.platform.entity.Account;
import com.banking.platform.exception.BadRequestException;
import com.banking.platform.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Rule-based fraud detection engine.
 * <p>
 * Implements basic heuristics to flag potentially fraudulent activity:
 * <ul>
 *   <li>Single transfer exceeding a configured high-value threshold</li>
 *   <li>Multiple high-value transfers within a short time window</li>
 * </ul>
 *
 * In a production system this would integrate with an ML-based anomaly
 * detection pipeline, but rule-based logic is the correct starting point
 * and demonstrates the engineering pattern.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FraudDetectionService {

    private final TransactionRepository transactionRepository;

    // Configurable thresholds
    private static final BigDecimal HIGH_VALUE_THRESHOLD = new BigDecimal("50000.00");
    private static final BigDecimal SINGLE_TXN_LIMIT     = new BigDecimal("200000.00");
    private static final int    MAX_HIGH_VALUE_IN_WINDOW  = 3;
    private static final int    WINDOW_MINUTES            = 30;

    /**
     * Check if the proposed transaction triggers any fraud rules.
     * Throws {@link BadRequestException} if suspicious – blocks the transfer.
     */
    public void checkForSuspiciousActivity(Account sourceAccount, BigDecimal amount) {
        // Rule 1: Single transaction limit
        if (amount.compareTo(SINGLE_TXN_LIMIT) > 0) {
            log.warn("FRAUD ALERT: Transfer of {} exceeds single-transaction limit for account {}",
                    amount, sourceAccount.getAccountNumber());
            throw new BadRequestException(
                    "Transfer amount exceeds single-transaction limit of " + SINGLE_TXN_LIMIT
                    + ". Please contact support.");
        }

        // Rule 2: Velocity check – too many high-value transactions in a short window
        if (amount.compareTo(HIGH_VALUE_THRESHOLD) > 0) {
            LocalDateTime windowStart = LocalDateTime.now().minusMinutes(WINDOW_MINUTES);
            long recentHighValueCount = transactionRepository
                    .countHighValueTransactionsSince(sourceAccount.getId(), HIGH_VALUE_THRESHOLD, windowStart);

            if (recentHighValueCount >= MAX_HIGH_VALUE_IN_WINDOW) {
                log.warn("FRAUD ALERT: {} high-value transactions in {}min window for account {}",
                        recentHighValueCount, WINDOW_MINUTES, sourceAccount.getAccountNumber());
                throw new BadRequestException(
                        "Unusual activity detected: multiple high-value transactions in a short period. "
                        + "Transaction blocked for your safety.");
            }
        }
    }
}
