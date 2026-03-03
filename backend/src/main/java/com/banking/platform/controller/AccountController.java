package com.banking.platform.controller;

import com.banking.platform.dto.AccountResponse;
import com.banking.platform.security.CustomUserDetails;
import com.banking.platform.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Account endpoints – balance and account info for the authenticated user.
 */
@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping("/balance")
    public ResponseEntity<AccountResponse> getBalance(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        AccountResponse response = accountService.getAccountByUserId(userDetails.getUserId());
        return ResponseEntity.ok(response);
    }
}
