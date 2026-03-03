package com.banking.platform.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AccountResponse {

    private String accountNumber;
    private BigDecimal balance;
    private String ownerName;
    private String ownerEmail;
}
