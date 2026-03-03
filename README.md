# Community Digital Banking & Financial Literacy Platform

> A secure, cloud-deployed digital banking simulator and financial literacy system built to promote financial awareness among everyday citizens — students, gig workers, and small vendors.

[![CI/CD](https://github.com/YOUR_USERNAME/community-digital-banking/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/community-digital-banking/actions)

---

## Problem Statement

Millions of citizens lack access to:
- **Financial awareness** — no understanding of budgeting, saving, or credit
- **Secure digital money tracking** — no safe way to monitor income/expenses
- **Simple financial insights** — no tools to surface spending patterns

This platform addresses all three through a full-stack digital banking simulator with built-in financial literacy modules.

---

## Features

| Feature | Description |
|---|---|
| **JWT Authentication** | Secure login & registration with BCrypt password hashing |
| **Role-Based Access Control** | USER and ADMIN roles with granular endpoint protection |
| **Digital Wallet Simulation** | Credit/debit with real-time balance tracking |
| **Fund Transfers (ACID)** | Atomic transfers between accounts using `@Transactional` |
| **Transaction History** | Paginated history with newest-first ordering |
| **Monthly Financial Insights** | Income vs expenses summary with spending alerts |
| **Fraud-Pattern Detection** | Rule-based engine: single-txn limits + velocity checks |
| **Financial Literacy Modules** | Browsable learning content (Budgeting, Saving, Credit, Fraud) |
| **Responsive Dashboard** | Fintech-styled React UI with Tailwind CSS |

---

## Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.2**
- **Spring Security** with JWT (stateless authentication)
- **Spring Data JPA** / Hibernate (ORM)
- **MySQL 8** (relational database)
- **Lombok** (boilerplate reduction)

### Frontend
- **React 18** (Functional Components + Hooks)
- **Vite** (build tool)
- **Tailwind CSS** (utility-first styling)
- **Axios** with JWT interceptor
- **React Router v6**

### DevOps & Cloud
- **Docker** (multi-stage builds for backend + frontend)
- **Docker Compose** (full-stack orchestration)
- **GitHub Actions** (CI/CD pipeline)
- **Nginx** (production-grade frontend serving + API reverse proxy)
- **AWS-ready** (EC2 + RDS deployment architecture)

---

## Architecture

```
┌─────────────┐         ┌──────────────────────┐         ┌──────────┐
│  React SPA  │ ──API──▶│  Spring Boot (8080)   │ ──JPA──▶│  MySQL   │
│  (Nginx:80) │         │  JWT + RBAC + ACID    │         │  (3306)  │
└─────────────┘         └──────────────────────┘         └──────────┘
                              │
                        ┌─────┴──────┐
                        │   Fraud    │
                        │  Detection │
                        │   Engine   │
                        └────────────┘
```

---

## API Endpoints

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user + wallet |
| POST | `/api/auth/login` | Authenticate & receive JWT |

### Account (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/account/balance` | Get current balance & account info |

### Transactions (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transaction/transfer` | Transfer funds (ACID-compliant) |
| GET | `/api/transaction/history` | Paginated transaction history |
| GET | `/api/transaction/recent` | Last 10 transactions |

### Insights (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/insights/monthly?year=2026&month=3` | Monthly financial summary |

### Financial Literacy (Public GET / Admin POST)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/literacy` | List all modules |
| GET | `/api/literacy/category/{cat}` | Filter by category |
| POST | `/api/literacy` | Create module (ADMIN) |

---

## Quick Start

### Prerequisites
- Java 17+
- Node.js 20+
- MySQL 8 (or use Docker)

### Option 1: Docker Compose (Recommended)
```bash
cd community-digital-banking
docker-compose up --build
```
- Frontend: http://localhost
- Backend API: http://localhost:8080

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
# Update MySQL credentials in src/main/resources/application.properties
mvn clean install
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
- Frontend: http://localhost:5173 (Vite proxies API calls to :8080)

---

## Testing

**Backend (JUnit 5 + Mockito):**
```bash
cd backend
mvn test
```
Tests cover:
- ✅ Transfer balance updates (debit source, credit target)
- ✅ Insufficient funds rejection
- ✅ Self-transfer prevention
- ✅ Fraud detection rules (single-txn limit, velocity checks)
- ✅ Invalid account handling

**Frontend (Vitest + React Testing Library):**
```bash
cd frontend
npm test
```
Tests cover:
- ✅ Login form renders correctly
- ✅ Submit button disabled until fields filled
- ✅ Registration link present

---

## Why `@Transactional` Matters (Interview Talking Point)

A money transfer involves 3 database writes:
1. Debit the source account
2. Credit the target account
3. Record the transaction

If step 2 fails after step 1 succeeds, money **disappears**. `@Transactional` wraps all three operations in a single database transaction. If ANY step throws an exception, the **entire operation rolls back** — no partial state.

This is the **"A" in ACID (Atomicity)** and is absolutely critical in banking systems.

---

## Postman Collection

Test the API endpoints with these sample requests:

**Register:**
```json
POST /api/auth/register
{
  "fullName": "Alice Johnson",
  "email": "alice@example.com",
  "password": "securepass123"
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "alice@example.com",
  "password": "securepass123"
}
```

**Transfer (use JWT from login response):**
```json
POST /api/transaction/transfer
Authorization: Bearer <your-jwt-token>
{
  "targetAccountNumber": "2000000002",
  "amount": 1500.00,
  "description": "Payment for services"
}
```

---

## Project Structure

```
community-digital-banking/
├── backend/
│   ├── src/main/java/com/banking/platform/
│   │   ├── config/          # Security configuration
│   │   ├── controller/      # REST API endpoints
│   │   ├── dto/             # Request/Response objects
│   │   ├── entity/          # JPA domain models
│   │   ├── exception/       # Custom exceptions + global handler
│   │   ├── repository/      # Data access layer
│   │   ├── security/        # JWT provider, filter, user details
│   │   └── service/         # Business logic (@Transactional)
│   ├── src/main/resources/  # application.properties
│   ├── src/test/            # JUnit 5 + Mockito tests
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # AuthContext (JWT state management)
│   │   ├── pages/           # Login, Dashboard, Transfer, etc.
│   │   ├── services/        # Axios API client with interceptor
│   │   └── __tests__/       # React Testing Library tests
│   ├── package.json
│   └── vite.config.js
├── .github/workflows/ci.yml # CI/CD pipeline
├── docker-compose.yml        # Full-stack orchestration
├── Dockerfile.backend        # Multi-stage Java build
├── Dockerfile.frontend       # Multi-stage React + Nginx build
└── README.md
```

---

## License

This project is for educational and portfolio purposes.
