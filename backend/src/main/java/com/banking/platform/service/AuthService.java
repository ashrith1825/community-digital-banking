package com.banking.platform.service;

import com.banking.platform.dto.*;
import com.banking.platform.entity.*;
import com.banking.platform.exception.BadRequestException;
import com.banking.platform.repository.AccountRepository;
import com.banking.platform.repository.UserRepository;
import com.banking.platform.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Handles user registration, login, and JWT token generation.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    /**
     * Register a new user and create their digital wallet account.
     * <p>
     * Uses {@code @Transactional} so that if account creation fails,
     * the user row is also rolled back – no orphaned records.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // 1. Create user with hashed password
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();
        user = userRepository.save(user);

        // 2. Create digital wallet (account) with ₹10,000 simulated opening balance
        Account account = Account.builder()
                .accountNumber(generateAccountNumber())
                .balance(new BigDecimal("10000.00"))
                .user(user)
                .build();
        account = accountRepository.save(account);

        // 3. Authenticate and return JWT
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(auth);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .accountNumber(account.getAccountNumber())
                .build();
    }

    /**
     * Authenticate an existing user and return a fresh JWT.
     */
    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        String token = tokenProvider.generateToken(auth);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));
        Account account = accountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Account not found"));

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .accountNumber(account.getAccountNumber())
                .build();
    }

    /** Generate a unique 10-digit account number. */
    private String generateAccountNumber() {
        String number;
        do {
            number = String.valueOf(1_000_000_000L + ThreadLocalRandom.current().nextLong(9_000_000_000L));
        } while (accountRepository.findByAccountNumber(number).isPresent());
        return number;
    }
}
