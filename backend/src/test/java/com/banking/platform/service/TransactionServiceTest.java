package com.banking.platform.service;

import com.banking.platform.dto.TransactionResponse;
import com.banking.platform.dto.TransferRequest;
import com.banking.platform.entity.*;
import com.banking.platform.exception.BadRequestException;
import com.banking.platform.exception.InsufficientFundsException;
import com.banking.platform.exception.ResourceNotFoundException;
import com.banking.platform.repository.AccountRepository;
import com.banking.platform.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link TransactionService}.
 * <p>
 * These tests verify the critical money-transfer logic:
 * <ul>
 *   <li>Balances update correctly after a transfer</li>
 *   <li>Insufficient funds are rejected</li>
 *   <li>Self-transfers are blocked</li>
 *   <li>Invalid accounts produce appropriate errors</li>
 * </ul>
 *
 * Uses Mockito to isolate the service from the database layer.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionService – Money Transfer Tests")
class TransactionServiceTest {

    @Mock private AccountRepository accountRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private FraudDetectionService fraudDetectionService;

    @InjectMocks
    private TransactionService transactionService;

    private Account sourceAccount;
    private Account targetAccount;
    private User sourceUser;
    private User targetUser;

    @BeforeEach
    void setUp() {
        sourceUser = User.builder().id(1L).email("alice@example.com").fullName("Alice").role(Role.USER).build();
        targetUser = User.builder().id(2L).email("bob@example.com").fullName("Bob").role(Role.USER).build();

        sourceAccount = Account.builder()
                .id(100L)
                .accountNumber("1000000001")
                .balance(new BigDecimal("5000.00"))
                .user(sourceUser)
                .build();

        targetAccount = Account.builder()
                .id(200L)
                .accountNumber("2000000002")
                .balance(new BigDecimal("3000.00"))
                .user(targetUser)
                .build();
    }

    @Nested
    @DisplayName("Successful Transfer Scenarios")
    class SuccessfulTransfers {

        @Test
        @DisplayName("should debit source and credit target correctly")
        void transferUpdatesBalances() {
            // Arrange
            TransferRequest request = TransferRequest.builder()
                    .targetAccountNumber("2000000002")
                    .amount(new BigDecimal("1500.00"))
                    .description("Test transfer")
                    .build();

            when(accountRepository.findByUserId(1L)).thenReturn(Optional.of(sourceAccount));
            when(accountRepository.findByAccountNumber("2000000002")).thenReturn(Optional.of(targetAccount));
            doNothing().when(fraudDetectionService).checkForSuspiciousActivity(any(), any());
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
                Transaction txn = invocation.getArgument(0);
                txn.setId(1L);
                return txn;
            });

            // Act
            TransactionResponse response = transactionService.transfer(1L, request);

            // Assert – balances updated correctly
            assertThat(sourceAccount.getBalance()).isEqualByComparingTo("3500.00");
            assertThat(targetAccount.getBalance()).isEqualByComparingTo("4500.00");

            // Assert – both accounts saved
            verify(accountRepository, times(2)).save(any(Account.class));

            // Assert – transaction recorded
            verify(transactionRepository).save(argThat(txn ->
                txn.getAmount().compareTo(new BigDecimal("1500.00")) == 0
                && txn.getType() == TransactionType.TRANSFER
            ));

            // Assert – response is correct
            assertThat(response.getAmount()).isEqualByComparingTo("1500.00");
            assertThat(response.getSourceAccountNumber()).isEqualTo("1000000001");
            assertThat(response.getTargetAccountNumber()).isEqualTo("2000000002");
        }

        @Test
        @DisplayName("should allow transfer of exact balance (zero remaining)")
        void transferExactBalance() {
            TransferRequest request = TransferRequest.builder()
                    .targetAccountNumber("2000000002")
                    .amount(new BigDecimal("5000.00"))
                    .build();

            when(accountRepository.findByUserId(1L)).thenReturn(Optional.of(sourceAccount));
            when(accountRepository.findByAccountNumber("2000000002")).thenReturn(Optional.of(targetAccount));
            doNothing().when(fraudDetectionService).checkForSuspiciousActivity(any(), any());
            when(transactionRepository.save(any())).thenAnswer(i -> { ((Transaction)i.getArgument(0)).setId(2L); return i.getArgument(0); });

            transactionService.transfer(1L, request);

            assertThat(sourceAccount.getBalance()).isEqualByComparingTo("0.00");
            assertThat(targetAccount.getBalance()).isEqualByComparingTo("8000.00");
        }
    }

    @Nested
    @DisplayName("Failed Transfer Scenarios")
    class FailedTransfers {

        @Test
        @DisplayName("should reject transfer when balance is insufficient")
        void rejectInsufficientFunds() {
            TransferRequest request = TransferRequest.builder()
                    .targetAccountNumber("2000000002")
                    .amount(new BigDecimal("10000.00")) // exceeds 5000 balance
                    .build();

            when(accountRepository.findByUserId(1L)).thenReturn(Optional.of(sourceAccount));
            when(accountRepository.findByAccountNumber("2000000002")).thenReturn(Optional.of(targetAccount));

            assertThatThrownBy(() -> transactionService.transfer(1L, request))
                    .isInstanceOf(InsufficientFundsException.class)
                    .hasMessageContaining("Insufficient balance");

            // Verify NO database writes occurred (atomicity)
            verify(accountRepository, never()).save(any());
            verify(transactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("should reject self-transfer")
        void rejectSelfTransfer() {
            TransferRequest request = TransferRequest.builder()
                    .targetAccountNumber("1000000001") // same as source
                    .amount(new BigDecimal("100.00"))
                    .build();

            when(accountRepository.findByUserId(1L)).thenReturn(Optional.of(sourceAccount));

            assertThatThrownBy(() -> transactionService.transfer(1L, request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Cannot transfer to your own account");
        }

        @Test
        @DisplayName("should throw exception when source account not found")
        void sourceAccountNotFound() {
            TransferRequest request = TransferRequest.builder()
                    .targetAccountNumber("2000000002")
                    .amount(new BigDecimal("100.00"))
                    .build();

            when(accountRepository.findByUserId(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> transactionService.transfer(999L, request))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("should throw exception when target account not found")
        void targetAccountNotFound() {
            TransferRequest request = TransferRequest.builder()
                    .targetAccountNumber("9999999999")
                    .amount(new BigDecimal("100.00"))
                    .build();

            when(accountRepository.findByUserId(1L)).thenReturn(Optional.of(sourceAccount));
            when(accountRepository.findByAccountNumber("9999999999")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> transactionService.transfer(1L, request))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Target account not found");
        }
    }

    @Nested
    @DisplayName("Fraud Detection Integration")
    class FraudDetection {

        @Test
        @DisplayName("should block transfer when fraud is detected")
        void fraudDetectionBlocksTransfer() {
            TransferRequest request = TransferRequest.builder()
                    .targetAccountNumber("2000000002")
                    .amount(new BigDecimal("250000.00")) // huge amount
                    .build();

            sourceAccount.setBalance(new BigDecimal("500000.00")); // enough balance

            when(accountRepository.findByUserId(1L)).thenReturn(Optional.of(sourceAccount));
            when(accountRepository.findByAccountNumber("2000000002")).thenReturn(Optional.of(targetAccount));
            doThrow(new BadRequestException("Transfer amount exceeds single-transaction limit"))
                    .when(fraudDetectionService).checkForSuspiciousActivity(any(), any());

            assertThatThrownBy(() -> transactionService.transfer(1L, request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("single-transaction limit");

            // No money moved
            verify(accountRepository, never()).save(any());
        }
    }
}
