package com.banking.platform.controller;

import com.banking.platform.dto.TransactionResponse;
import com.banking.platform.dto.TransferRequest;
import com.banking.platform.security.CustomUserDetails;
import com.banking.platform.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Transaction endpoints – money transfers and transaction history.
 */
@RestController
@RequestMapping("/api/transaction")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * Transfer money between accounts.
     * The source account is determined from the JWT (the authenticated user).
     */
    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponse> transfer(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody TransferRequest request) {
        TransactionResponse response = transactionService.transfer(userDetails.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get paginated transaction history.
     */
    @GetMapping("/history")
    public ResponseEntity<List<TransactionResponse>> getHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<TransactionResponse> history = transactionService.getHistory(userDetails.getUserId(), page, size);
        return ResponseEntity.ok(history);
    }

    /**
     * Get recent transactions for the dashboard (last 10).
     */
    @GetMapping("/recent")
    public ResponseEntity<List<TransactionResponse>> getRecent(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<TransactionResponse> recent = transactionService.getRecentTransactions(userDetails.getUserId());
        return ResponseEntity.ok(recent);
    }
}
