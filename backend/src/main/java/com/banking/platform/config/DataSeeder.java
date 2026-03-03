package com.banking.platform.config;

import com.banking.platform.entity.*;
import com.banking.platform.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds the database with demo data on application startup.
 * <p>
 * Creates:
 * <ul>
 *   <li><b>Ash</b> (ashrith@gmail.com / 12345678) – primary user with ₹75,000 balance</li>
 *   <li><b>Priya Sharma</b> (priya@example.com / 12345678) – secondary demo user</li>
 *   <li>15 realistic transactions between the two accounts</li>
 *   <li>5 financial literacy modules across different categories</li>
 * </ul>
 * Skips seeding if the primary user already exists (safe to restart).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LiteracyModuleRepository literacyModuleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByEmail("ashrith@gmail.com")) {
            log.info("✅ Seed data already exists – skipping.");
            return;
        }

        log.info("🌱 Seeding database with demo data...");

        // ══════════════════════════════════════════════
        // 1. Create Users
        // ══════════════════════════════════════════════
        User ash = userRepository.save(User.builder()
                .fullName("Ash")
                .email("ashrith@gmail.com")
                .passwordHash(passwordEncoder.encode("12345678"))
                .role(Role.USER)
                .build());

        User priya = userRepository.save(User.builder()
                .fullName("Priya Sharma")
                .email("priya@example.com")
                .passwordHash(passwordEncoder.encode("12345678"))
                .role(Role.USER)
                .build());

        User admin = userRepository.save(User.builder()
                .fullName("Admin User")
                .email("admin@bank.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .build());

        log.info("   👤 Created users: Ash, Priya Sharma, Admin");

        // ══════════════════════════════════════════════
        // 2. Create Accounts
        // ══════════════════════════════════════════════
        Account ashAccount = accountRepository.save(Account.builder()
                .accountNumber("1000000001")
                .balance(new BigDecimal("75000.00"))
                .user(ash)
                .build());

        Account priyaAccount = accountRepository.save(Account.builder()
                .accountNumber("1000000002")
                .balance(new BigDecimal("42500.00"))
                .user(priya)
                .build());

        accountRepository.save(Account.builder()
                .accountNumber("1000000003")
                .balance(new BigDecimal("100000.00"))
                .user(admin)
                .build());

        log.info("   💳 Created accounts: Ash(1000000001), Priya(1000000002), Admin(1000000003)");

        // ══════════════════════════════════════════════
        // 3. Create Transactions (realistic banking flow)
        // ══════════════════════════════════════════════
        LocalDateTime now = LocalDateTime.now();

        List<Transaction> transactions = List.of(
            // --- Day 1: Initial deposits (simulated salary credits) ---
            Transaction.builder()
                .targetAccount(ashAccount)
                .amount(new BigDecimal("50000.00"))
                .type(TransactionType.CREDIT)
                .description("Salary credit – March 2026")
                .timestamp(now.minusDays(25))
                .build(),

            Transaction.builder()
                .targetAccount(priyaAccount)
                .amount(new BigDecimal("35000.00"))
                .type(TransactionType.CREDIT)
                .description("Salary credit – March 2026")
                .timestamp(now.minusDays(25))
                .build(),

            // --- Day 3: Ash pays rent to Priya ---
            Transaction.builder()
                .sourceAccount(ashAccount)
                .targetAccount(priyaAccount)
                .amount(new BigDecimal("12000.00"))
                .type(TransactionType.TRANSFER)
                .description("Rent payment – March")
                .timestamp(now.minusDays(22))
                .build(),

            // --- Day 5: Ash buys groceries (debit) ---
            Transaction.builder()
                .sourceAccount(ashAccount)
                .amount(new BigDecimal("3500.00"))
                .type(TransactionType.DEBIT)
                .description("BigBasket grocery order")
                .timestamp(now.minusDays(20))
                .build(),

            // --- Day 7: Priya sends Ash money for shared dinner ---
            Transaction.builder()
                .sourceAccount(priyaAccount)
                .targetAccount(ashAccount)
                .amount(new BigDecimal("1500.00"))
                .type(TransactionType.TRANSFER)
                .description("Dinner split – Olive Garden")
                .timestamp(now.minusDays(18))
                .build(),

            // --- Day 9: Ash pays electricity bill ---
            Transaction.builder()
                .sourceAccount(ashAccount)
                .amount(new BigDecimal("2200.00"))
                .type(TransactionType.DEBIT)
                .description("Electricity bill – BESCOM")
                .timestamp(now.minusDays(16))
                .build(),

            // --- Day 10: Ash receives freelance income ---
            Transaction.builder()
                .targetAccount(ashAccount)
                .amount(new BigDecimal("15000.00"))
                .type(TransactionType.CREDIT)
                .description("Freelance project payment – WebDev")
                .timestamp(now.minusDays(15))
                .build(),

            // --- Day 12: Ash transfers to Priya for shared Netflix ---
            Transaction.builder()
                .sourceAccount(ashAccount)
                .targetAccount(priyaAccount)
                .amount(new BigDecimal("649.00"))
                .type(TransactionType.TRANSFER)
                .description("Netflix subscription share")
                .timestamp(now.minusDays(13))
                .build(),

            // --- Day 14: Priya pays back a loan to Ash ---
            Transaction.builder()
                .sourceAccount(priyaAccount)
                .targetAccount(ashAccount)
                .amount(new BigDecimal("5000.00"))
                .type(TransactionType.TRANSFER)
                .description("Loan repayment – thanks!")
                .timestamp(now.minusDays(11))
                .build(),

            // --- Day 16: Ash mobile recharge ---
            Transaction.builder()
                .sourceAccount(ashAccount)
                .amount(new BigDecimal("799.00"))
                .type(TransactionType.DEBIT)
                .description("Jio mobile recharge – 3 months")
                .timestamp(now.minusDays(9))
                .build(),

            // --- Day 18: Large transfer Ash → Priya (triggers velocity check if repeated) ---
            Transaction.builder()
                .sourceAccount(ashAccount)
                .targetAccount(priyaAccount)
                .amount(new BigDecimal("8000.00"))
                .type(TransactionType.TRANSFER)
                .description("Birthday gift 🎂")
                .timestamp(now.minusDays(7))
                .build(),

            // --- Day 20: Priya sends Ash for books ---
            Transaction.builder()
                .sourceAccount(priyaAccount)
                .targetAccount(ashAccount)
                .amount(new BigDecimal("2500.00"))
                .type(TransactionType.TRANSFER)
                .description("Book purchase – System Design Interview")
                .timestamp(now.minusDays(5))
                .build(),

            // --- Day 22: Ash gym membership debit ---
            Transaction.builder()
                .sourceAccount(ashAccount)
                .amount(new BigDecimal("3000.00"))
                .type(TransactionType.DEBIT)
                .description("Cult.fit gym membership – quarterly")
                .timestamp(now.minusDays(3))
                .build(),

            // --- Day 23: Another salary credit ---
            Transaction.builder()
                .targetAccount(ashAccount)
                .amount(new BigDecimal("50000.00"))
                .type(TransactionType.CREDIT)
                .description("Salary credit – April 2026 (advance)")
                .timestamp(now.minusDays(1))
                .build(),

            // --- Today: Ash transfers to Priya ---
            Transaction.builder()
                .sourceAccount(ashAccount)
                .targetAccount(priyaAccount)
                .amount(new BigDecimal("4000.00"))
                .type(TransactionType.TRANSFER)
                .description("Weekend trip contribution")
                .timestamp(now)
                .build()
        );

        transactionRepository.saveAll(transactions);
        log.info("   💰 Created {} demo transactions", transactions.size());

        // ══════════════════════════════════════════════
        // 4. Create Financial Literacy Modules
        // ══════════════════════════════════════════════
        List<LiteracyModule> modules = List.of(
            LiteracyModule.builder()
                .title("Budgeting 101: The 50/30/20 Rule")
                .category("BUDGETING")
                .content("""
                    The 50/30/20 rule is a simple budgeting framework:
                    
                    • 50% of income → Needs (rent, groceries, bills, EMIs)
                    • 30% of income → Wants (dining out, entertainment, shopping)
                    • 20% of income → Savings & Investments (FD, SIP, emergency fund)
                    
                    Example: If your monthly salary is ₹50,000:
                    - ₹25,000 for needs
                    - ₹15,000 for wants
                    - ₹10,000 for savings
                    
                    Start tracking your expenses today using this app's Insights page!
                    """)
                .build(),

            LiteracyModule.builder()
                .title("Understanding UPI & Digital Payments")
                .category("DIGITAL_PAYMENTS")
                .content("""
                    UPI (Unified Payments Interface) revolutionized India's payment landscape:
                    
                    • Instant bank-to-bank transfers 24/7
                    • Zero transaction fees for individuals
                    • Secured with 2-factor authentication (device + UPI PIN)
                    
                    Safety Tips:
                    1. Never share your UPI PIN with anyone
                    2. Verify the receiver's name before confirming
                    3. Use only official apps (Google Pay, PhonePe, Paytm)
                    4. Report unauthorized transactions within 48 hours
                    
                    This platform simulates real banking transfers to help you understand the flow!
                    """)
                .build(),

            LiteracyModule.builder()
                .title("Building an Emergency Fund")
                .category("SAVING")
                .content("""
                    An emergency fund is your financial safety net:
                    
                    • Target: 3-6 months of living expenses
                    • Keep it in a high-interest savings account or liquid fund
                    • Don't invest emergency funds in stocks or crypto
                    
                    How to build it:
                    1. Calculate monthly essential expenses (rent + food + bills)
                    2. Multiply by 6 = your emergency fund target
                    3. Automate ₹5,000-10,000/month into a separate account
                    4. Only use for true emergencies (job loss, medical, car repair)
                    
                    Pro tip: Keep 1 month's expenses in savings, rest in a liquid mutual fund.
                    """)
                .build(),

            LiteracyModule.builder()
                .title("Credit Score: What It Is & Why It Matters")
                .category("CREDIT")
                .content("""
                    Your CIBIL score (300-900) determines your loan eligibility:
                    
                    • 750+ → Excellent – best loan rates
                    • 700-749 → Good – most loans approved
                    • 650-699 → Fair – higher interest rates
                    • Below 650 → Poor – loans likely rejected
                    
                    How to improve your score:
                    1. Pay credit card bills IN FULL by due date
                    2. Keep credit utilization below 30%
                    3. Don't apply for multiple loans at once
                    4. Maintain a healthy mix of secured & unsecured credit
                    5. Check your CIBIL report annually for errors
                    
                    A good credit score can save you lakhs in interest over a home loan!
                    """)
                .build(),

            LiteracyModule.builder()
                .title("Spotting Financial Fraud & Phishing")
                .category("FRAUD_AWARENESS")
                .content("""
                    Common banking frauds in India:
                    
                    🚨 Phishing: Fake emails/SMS claiming to be from your bank
                    🚨 Vishing: Phone calls asking for OTP or card details
                    🚨 SIM Swap: Fraudster duplicates your SIM to intercept OTPs
                    🚨 Fake UPI requests: "Send ₹1 to receive ₹10,000"
                    
                    How to protect yourself:
                    1. Banks NEVER ask for OTP, PIN, or CVV over phone/email
                    2. Check URLs carefully – look for https:// and correct domain
                    3. Enable transaction alerts on your phone
                    4. Use strong, unique passwords for banking apps
                    5. Report fraud immediately to your bank & cybercrime.gov.in
                    
                    This app's fraud detection system flags suspicious patterns automatically!
                    """)
                .build()
        );

        literacyModuleRepository.saveAll(modules);
        log.info("   📚 Created {} literacy modules", modules.size());

        log.info("🌱 Database seeding complete!");
        log.info("   ╔══════════════════════════════════════════════╗");
        log.info("   ║  LOGIN CREDENTIALS                          ║");
        log.info("   ║  ─────────────────────────────────────────  ║");
        log.info("   ║  User:  ashrith@gmail.com / 12345678       ║");
        log.info("   ║  User:  priya@example.com / 12345678       ║");
        log.info("   ║  Admin: admin@bank.com    / admin123       ║");
        log.info("   ╚══════════════════════════════════════════════╝");
    }
}
