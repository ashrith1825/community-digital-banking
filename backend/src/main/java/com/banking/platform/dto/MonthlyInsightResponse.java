package com.banking.platform.dto;

import lombok.*;
import java.math.BigDecimal;

/**
 * Monthly financial insight summary returned by the insights endpoint.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MonthlyInsightResponse {

    private int year;
    private int month;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netSavings;
    private String spendingAlert;   // e.g. "Your spending exceeded income by 15%"
}
