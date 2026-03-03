package com.banking.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Immutable record of every financial movement on the platform.
 * <p>
 * For TRANSFER type, both sourceAccount and targetAccount are set.
 * For CREDIT / DEBIT (wallet top-up or withdrawal), only one side is populated.
 *
 * <b>Interview note:</b> Transactions are created inside a {@code @Transactional}
 * service method to guarantee ACID compliance.  If any step fails (e.g., insufficient
 * balance), the entire operation rolls back – no partial state.
 */
@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_txn_source", columnList = "source_account_id"),
    @Index(name = "idx_txn_target", columnList = "target_account_id"),
    @Index(name = "idx_txn_timestamp", columnList = "timestamp")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_account_id")
    private Account sourceAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_account_id")
    private Account targetAccount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "VARCHAR(20)")
    private TransactionType type;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
