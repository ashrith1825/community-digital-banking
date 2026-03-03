package com.banking.platform.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {

    private String token;
    private String email;
    private String fullName;
    private String role;
    private String accountNumber;
}
