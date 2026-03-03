package com.banking.platform.service;

import com.banking.platform.dto.MonthlyInsightResponse;
import com.banking.platform.entity.Account;
import com.banking.platform.exception.ResourceNotFoundException;
import com.banking.platform.repository.AccountRepository;
import com.banking.platform.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;

/**
 * Generates monthly spending and saving insights for users.
 * <p>
 * Aggregates transaction data to help users understand their financial
 * habits – a core financial literacy feature.
 */
@Service
@RequiredArgsConstructor
public class InsightsService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public MonthlyInsightResponse getMonthlyInsight(Long userId, int year, int month) {
        Account account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end   = ym.atEndOfMonth().atTime(23, 59, 59);

        BigDecimal totalIncome   = transactionRepository.sumIncomingBetween(account.getId(), start, end);
        BigDecimal totalExpenses = transactionRepository.sumOutgoingBetween(account.getId(), start, end);
        BigDecimal netSavings    = totalIncome.subtract(totalExpenses);

        // Generate a spending alert if expenses exceed income
        String alert = null;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0 && totalExpenses.compareTo(totalIncome) > 0) {
            BigDecimal overSpendPct = totalExpenses.subtract(totalIncome)
                    .divide(totalIncome, 2, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            alert = "⚠ Your spending exceeded income by " + overSpendPct + "% this month. "
                  + "Consider reviewing your expenses.";
        } else if (netSavings.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal savingsPct = netSavings
                    .divide(totalIncome.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ONE : totalIncome,
                            2, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            alert = "✅ Great job! You saved " + savingsPct + "% of your income this month.";
        }

        return MonthlyInsightResponse.builder()
                .year(year)
                .month(month)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netSavings(netSavings)
                .spendingAlert(alert)
                .build();
    }
}
