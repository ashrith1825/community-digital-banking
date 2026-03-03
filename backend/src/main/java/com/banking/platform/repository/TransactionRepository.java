package com.banking.platform.repository;

import com.banking.platform.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Fetch paged transactions where the given account is either the sender or receiver.
     * Ordered newest-first for the "Recent Transactions" view.
     */
    @Query("SELECT t FROM Transaction t WHERE t.sourceAccount.id = :accountId "
         + "OR t.targetAccount.id = :accountId ORDER BY t.timestamp DESC")
    Page<Transaction> findByAccountId(@Param("accountId") Long accountId, Pageable pageable);

    /**
     * Sum of all DEBIT / outgoing transfers for a given account within a date range.
     * Used for monthly spending-insights.
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t "
         + "WHERE t.sourceAccount.id = :accountId "
         + "AND t.timestamp BETWEEN :start AND :end")
    BigDecimal sumOutgoingBetween(@Param("accountId") Long accountId,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);

    /**
     * Sum of all CREDIT / incoming transfers for a given account within a date range.
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t "
         + "WHERE t.targetAccount.id = :accountId "
         + "AND t.timestamp BETWEEN :start AND :end")
    BigDecimal sumIncomingBetween(@Param("accountId") Long accountId,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);

    /**
     * Count outgoing transactions above a threshold in the last N minutes.
     * Basic rule-based fraud-pattern detection.
     */
    @Query("SELECT COUNT(t) FROM Transaction t "
         + "WHERE t.sourceAccount.id = :accountId "
         + "AND t.amount > :threshold "
         + "AND t.timestamp > :since")
    long countHighValueTransactionsSince(@Param("accountId") Long accountId,
                                         @Param("threshold") BigDecimal threshold,
                                         @Param("since") LocalDateTime since);
}
