package com.banking.platform.controller;

import com.banking.platform.dto.MonthlyInsightResponse;
import com.banking.platform.security.CustomUserDetails;
import com.banking.platform.service.InsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Financial insights endpoint – monthly spending summaries.
 */
@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
public class InsightsController {

    private final InsightsService insightsService;

    /**
     * Get monthly financial insight (income, expenses, savings, alerts).
     */
    @GetMapping("/monthly")
    public ResponseEntity<MonthlyInsightResponse> getMonthlyInsight(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam int year,
            @RequestParam int month) {
        MonthlyInsightResponse insight = insightsService.getMonthlyInsight(
                userDetails.getUserId(), year, month);
        return ResponseEntity.ok(insight);
    }
}
