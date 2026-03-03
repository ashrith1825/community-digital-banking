/**
 * ═══════════════════════════════════════════════════════════════
 * seed.js – Frontend API Seed Script
 * ═══════════════════════════════════════════════════════════════
 *
 * This script demonstrates the full API flow by calling the backend
 * directly. Run it ONLY if the backend DataSeeder didn't run
 * (e.g., you want to seed via REST APIs instead).
 *
 * The backend already seeds data on startup via DataSeeder.java.
 * This script is for LEARNING & UNDERSTANDING the API flow.
 *
 * Usage:
 *   node seed.js
 *
 * Prerequisites:
 *   - Backend running on http://localhost:8080
 *   - npm install (axios must be available)
 */

const BASE_URL = 'http://localhost:8080/api';

// ── Helper: Make HTTP requests ──
async function request(method, path, data = null, token = null) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(url, options);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }

  if (!res.ok) {
    console.error(`❌ ${method} ${path} → ${res.status}`, json);
    return null;
  }
  return json;
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  🌱 Community Digital Banking – API Seed Script  ');
  console.log('═══════════════════════════════════════════════════\n');

  // ──────────────────────────────────────────────────
  // STEP 1: Register Users
  // ──────────────────────────────────────────────────
  console.log('📌 STEP 1: Register Users\n');

  // Register Ash (primary user)
  console.log('  → Registering Ash (ashrith@gmail.com)...');
  const ashAuth = await request('POST', '/auth/register', {
    fullName: 'Ash',
    email: 'ashrith@gmail.com',
    password: '12345678',
  });

  if (ashAuth) {
    console.log('  ✅ Ash registered successfully!');
    console.log(`     Account Number: ${ashAuth.accountNumber}`);
    console.log(`     JWT Token: ${ashAuth.token.substring(0, 40)}...`);
    console.log(`     Role: ${ashAuth.role}\n`);
  } else {
    // User might already exist from DataSeeder – try logging in
    console.log('  ⚠️  Registration failed (user may already exist). Trying login...\n');
  }

  // Register Priya (secondary user)
  console.log('  → Registering Priya Sharma...');
  const priyaAuth = await request('POST', '/auth/register', {
    fullName: 'Priya Sharma',
    email: 'priya@example.com',
    password: '12345678',
  });
  if (priyaAuth) {
    console.log('  ✅ Priya registered!');
    console.log(`     Account Number: ${priyaAuth.accountNumber}\n`);
  }

  // ──────────────────────────────────────────────────
  // STEP 2: Login (get fresh tokens)
  // ──────────────────────────────────────────────────
  console.log('📌 STEP 2: Login & Get JWT Tokens\n');

  console.log('  → Logging in as Ash...');
  const ashLogin = await request('POST', '/auth/login', {
    email: 'ashrith@gmail.com',
    password: '12345678',
  });

  if (!ashLogin) {
    console.error('❌ Cannot login as Ash. Is the backend running? Exiting.');
    process.exit(1);
  }
  const ashToken = ashLogin.token;
  console.log(`  ✅ Ash logged in! Token: ${ashToken.substring(0, 40)}...`);
  console.log(`     Full Name: ${ashLogin.fullName}`);
  console.log(`     Account: ${ashLogin.accountNumber}\n`);

  console.log('  → Logging in as Priya...');
  const priyaLogin = await request('POST', '/auth/login', {
    email: 'priya@example.com',
    password: '12345678',
  });
  const priyaToken = priyaLogin?.token;
  if (priyaLogin) {
    console.log(`  ✅ Priya logged in! Account: ${priyaLogin.accountNumber}\n`);
  }

  // ──────────────────────────────────────────────────
  // STEP 3: Check Account Balance
  // ──────────────────────────────────────────────────
  console.log('📌 STEP 3: Check Account Balances\n');

  const ashBalance = await request('GET', '/account/balance', null, ashToken);
  if (ashBalance) {
    console.log(`  💰 Ash's Balance: ₹${ashBalance.balance}`);
    console.log(`     Account: ${ashBalance.accountNumber}\n`);
  }

  if (priyaToken) {
    const priyaBalance = await request('GET', '/account/balance', null, priyaToken);
    if (priyaBalance) {
      console.log(`  💰 Priya's Balance: ₹${priyaBalance.balance}\n`);
    }
  }

  // ──────────────────────────────────────────────────
  // STEP 4: Make a Transfer (Ash → Priya)
  // ──────────────────────────────────────────────────
  console.log('📌 STEP 4: Transfer Money (Ash → Priya)\n');

  if (priyaLogin) {
    console.log(`  → Ash sending ₹2,500 to Priya (${priyaLogin.accountNumber})...`);
    const transfer = await request('POST', '/transaction/transfer', {
      targetAccountNumber: priyaLogin.accountNumber,
      amount: 2500.00,
      description: 'Coffee shop treat ☕',
    }, ashToken);

    if (transfer) {
      console.log('  ✅ Transfer successful!');
      console.log(`     Transaction ID: ${transfer.id || 'created'}`);
      console.log(`     Amount: ₹${transfer.amount || 2500}\n`);
    }
  }

  // ──────────────────────────────────────────────────
  // STEP 5: View Transaction History
  // ──────────────────────────────────────────────────
  console.log('📌 STEP 5: View Ash\'s Transaction History\n');

  const history = await request('GET', '/transaction/history?page=0&size=10', null, ashToken);
  if (history && history.content) {
    console.log(`  📜 Found ${history.totalElements} transactions (showing page 1):\n`);
    history.content.forEach((txn, i) => {
      const dir = txn.type === 'CREDIT' ? '⬇️  IN' :
                  txn.type === 'DEBIT' ? '⬆️ OUT' : '↔️ TFR';
      console.log(`     ${i + 1}. ${dir}  ₹${txn.amount}  –  ${txn.description}`);
      console.log(`        ${txn.type} | ${txn.timestamp}\n`);
    });
  } else {
    // Try alternate endpoint
    const recent = await request('GET', '/transaction/recent', null, ashToken);
    if (recent && Array.isArray(recent)) {
      console.log(`  📜 Recent transactions (${recent.length}):\n`);
      recent.forEach((txn, i) => {
        console.log(`     ${i + 1}. ₹${txn.amount} – ${txn.description} (${txn.type})`);
      });
      console.log();
    }
  }

  // ──────────────────────────────────────────────────
  // STEP 6: Check Balances After Transfer
  // ──────────────────────────────────────────────────
  console.log('📌 STEP 6: Updated Balances After Transfer\n');

  const ashBalanceAfter = await request('GET', '/account/balance', null, ashToken);
  if (ashBalanceAfter) {
    console.log(`  💰 Ash's Balance: ₹${ashBalanceAfter.balance}`);
  }
  if (priyaToken) {
    const priyaBalanceAfter = await request('GET', '/account/balance', null, priyaToken);
    if (priyaBalanceAfter) {
      console.log(`  💰 Priya's Balance: ₹${priyaBalanceAfter.balance}`);
    }
  }
  console.log();

  // ──────────────────────────────────────────────────
  // STEP 7: Monthly Insights
  // ──────────────────────────────────────────────────
  console.log('📌 STEP 7: Monthly Financial Insights\n');

  const insights = await request('GET', '/insights/monthly?year=2026&month=3', null, ashToken);
  if (insights) {
    console.log(`  📊 March 2026 Insights for Ash:`);
    console.log(`     Income:   ₹${insights.totalIncome || 0}`);
    console.log(`     Expenses: ₹${insights.totalExpense || 0}`);
    console.log(`     Net:      ₹${(insights.totalIncome || 0) - (insights.totalExpense || 0)}`);
    if (insights.alert) console.log(`     ⚠️  Alert: ${insights.alert}`);
    console.log();
  }

  // ──────────────────────────────────────────────────
  // STEP 8: Browse Literacy Modules
  // ──────────────────────────────────────────────────
  console.log('📌 STEP 8: Financial Literacy Modules\n');

  const modules = await request('GET', '/literacy');
  if (modules && Array.isArray(modules)) {
    console.log(`  📚 Found ${modules.length} modules:\n`);
    modules.forEach((mod, i) => {
      console.log(`     ${i + 1}. [${mod.category}] ${mod.title}`);
    });
    console.log();
  }

  // ──────────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════');
  console.log('  ✅ Seed & Flow Demo Complete!');
  console.log('═══════════════════════════════════════════════════');
  console.log('\n  🔑 Login Credentials:');
  console.log('     ┌──────────────────────────────────────────┐');
  console.log('     │  ashrith@gmail.com  /  12345678          │');
  console.log('     │  priya@example.com  /  12345678          │');
  console.log('     │  admin@bank.com     /  admin123          │');
  console.log('     └──────────────────────────────────────────┘');
  console.log('\n  🌐 Open http://localhost:5173 to use the app!');
  console.log('  📡 API base: http://localhost:8080/api\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
