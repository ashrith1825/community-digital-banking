package com.banking.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * A financial literacy learning module (e.g., "Budgeting 101", "Understanding Credit").
 * Admin users can create modules; regular users can browse and mark them as completed.
 */
@Entity
@Table(name = "literacy_modules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LiteracyModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 50)
    private String category;   // e.g. BUDGETING, SAVING, CREDIT, FRAUD_AWARENESS

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
