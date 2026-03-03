package com.banking.platform.dto;

import com.banking.platform.entity.TransactionType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TransactionResponse {

    private Long id;
    private String sourceAccountNumber;
    private String targetAccountNumber;
    private BigDecimal amount;
    private TransactionType type;
    private String description;
    private LocalDateTime timestamp;
}
