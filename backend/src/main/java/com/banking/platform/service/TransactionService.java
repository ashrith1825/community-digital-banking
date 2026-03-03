package com.banking.platform.service;

import com.banking.platform.dto.TransactionResponse;
import com.banking.platform.dto.TransferRequest;
import com.banking.platform.entity.*;
import com.banking.platform.exception.*;
import com.banking.platform.repository.AccountRepository;
import com.banking.platform.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Core transaction processing engine.
 * <p>
 * <b>Why {@code @Transactional} matters here (INTERVIEW EXPLANATION):</b>
 * <p>
 * A money transfer involves multiple database writes:
 * <ol>
 *   <li>Debit the source account</li>
 *   <li>Credit the target account</li>
 *   <li>Create a transaction record</li>
 * </ol>
 * If step 2 fails after step 1 succeeds, money "disappears" – the sender loses
 * funds but the receiver never gets them.  {@code @Transactional} wraps all three
 * operations in a single database transaction.  If ANY step throws an exception,
 * the entire transaction is rolled back – no partial state.  This is the "A" in
 * ACID (Atomicity) and is <b>absolutely critical</b> in banking systems.
 * <p>
 * We use {@code Isolation.READ_COMMITTED} to prevent dirty reads while avoiding
 * the overhead of SERIALIZABLE isolation in a simulation environment.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final FraudDetectionService fraudDetectionService;

    private static final int DEFAULT_HISTORY_SIZE = 10;

    /**
     * Transfer money between two accounts with full ACID compliance.
     *
     * @param sourceUserId the authenticated user's ID (from JWT)
     * @param request      target account number and amount
     * @return the completed transaction details
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransactionResponse transfer(Long sourceUserId, TransferRequest request) {
        // 1. Load source account
        Account sourceAccount = accountRepository.findByUserId(sourceUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found"));

        // 2. Prevent self-transfer
        if (sourceAccount.getAccountNumber().equals(request.getTargetAccountNumber())) {
            throw new BadRequestException("Cannot transfer to your own account");
        }

        // 3. Load target account
        Account targetAccount = accountRepository.findByAccountNumber(request.getTargetAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Target account not found: " + request.getTargetAccountNumber()));

        BigDecimal amount = request.getAmount();

        // 4. Check sufficient balance
        if (sourceAccount.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException(
                    "Insufficient balance. Available: " + sourceAccount.getBalance());
        }

        // 5. Check fraud patterns before proceeding
        fraudDetectionService.checkForSuspiciousActivity(sourceAccount, amount);

        // 6. Perform the transfer (atomic)
        sourceAccount.setBalance(sourceAccount.getBalance().subtract(amount));
        targetAccount.setBalance(targetAccount.getBalance().add(amount));

        accountRepository.save(sourceAccount);
        accountRepository.save(targetAccount);

        // 7. Record the transaction
        Transaction txn = Transaction.builder()
                .sourceAccount(sourceAccount)
                .targetAccount(targetAccount)
                .amount(amount)
                .type(TransactionType.TRANSFER)
                .description(request.getDescription() != null ? request.getDescription() : "Fund transfer")
                .build();
        txn = transactionRepository.save(txn);

        log.info("Transfer completed: {} -> {} | Amount: {}",
                sourceAccount.getAccountNumber(), targetAccount.getAccountNumber(), amount);

        return mapToResponse(txn);
    }

    /**
     * Get paginated transaction history for the authenticated user.
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> getHistory(Long userId, int page, int size) {
        Account account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        Page<Transaction> transactions = transactionRepository.findByAccountId(
                account.getId(), PageRequest.of(page, size));

        return transactions.getContent().stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Get the last N transactions (default 10) – used by the dashboard.
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> getRecentTransactions(Long userId) {
        return getHistory(userId, 0, DEFAULT_HISTORY_SIZE);
    }

    private TransactionResponse mapToResponse(Transaction txn) {
        return TransactionResponse.builder()
                .id(txn.getId())
                .sourceAccountNumber(txn.getSourceAccount() != null
                        ? txn.getSourceAccount().getAccountNumber() : null)
                .targetAccountNumber(txn.getTargetAccount() != null
                        ? txn.getTargetAccount().getAccountNumber() : null)
                .amount(txn.getAmount())
                .type(txn.getType())
                .description(txn.getDescription())
                .timestamp(txn.getTimestamp())
                .build();
    }
}
