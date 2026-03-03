package com.banking.platform.service;

import com.banking.platform.dto.AccountResponse;
import com.banking.platform.entity.Account;
import com.banking.platform.exception.ResourceNotFoundException;
import com.banking.platform.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Account-related operations – balance retrieval, account info.
 */
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    @Transactional(readOnly = true)
    public AccountResponse getAccountByUserId(Long userId) {
        Account account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for user"));

        return AccountResponse.builder()
                .accountNumber(account.getAccountNumber())
                .balance(account.getBalance())
                .ownerName(account.getUser().getFullName())
                .ownerEmail(account.getUser().getEmail())
                .build();
    }
}
