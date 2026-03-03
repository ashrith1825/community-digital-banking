package com.banking.platform.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

/**
 * Utility class responsible for JWT token generation, validation, and parsing.
 * <p>
 * <b>Interview talking point:</b> JWTs are stateless – the server does not need to
 * store session data.  Each request carries the signed token, which is validated
 * via HMAC-SHA256.  This is how modern banking APIs maintain secure, scalable sessions.
 */
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs) {
        byte[] decodedKey = Base64.getDecoder().decode(secret);
        this.key = Keys.hmacShaKeyFor(decodedKey);
        this.expirationMs = expirationMs;
    }

    /** Generate a signed JWT for the authenticated user. */
    public String generateToken(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("role", userDetails.getRole())
                .claim("userId", userDetails.getUserId())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /** Extract the email (subject) from a valid token. */
    public String getEmailFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    /** Validate token signature and expiry. */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
