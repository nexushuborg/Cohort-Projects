# Multi-Vendor Marketplace (Modular Monolith)

Full-stack Multi-Vendor Marketplace built as a modular monolith using the **PERN stack (PostgreSQL, Express, React, Node.js)**.

---

## Workspace Structure

```
Cohort/
├── backend/                      # Express + PostgreSQL Backend
│   ├── src/
│   │   ├── config/               # Database pool & environment config
│   │   ├── middleware/           # Auth, RBAC, Validation & Error middlewares
│   │   ├── migrations/           # Full 16-table pure PostgreSQL schema
│   │   ├── seeds/                # Initial seed data
│   │   ├── modules/
│   │   │   ├── auth/             # JWT Auth with rotating refresh tokens
│   │   │   ├── users/            # Profile management & admin user listings
│   │   │   ├── sellers/          # Store onboarding & ownership controls
│   │   │   └── categories/       # Hierarchical category trees & subcategories
│   │   ├── utils/                # Response & Error helper utilities
│   │   ├── app.js                # Express app setup
│   │   └── server.js             # Server entrypoint
│   ├── tests/                    # Integration & unit test suites
│   ├── package.json
│   └── .env
├── 02-multi-vendor-marketplace.md # Marketplace PRD
├── Person_1_Detailed_Task.md     # Person 1 Specification Document
├── .env                          # Root environment configuration
└── README.md
```

---

## Quick Commands (Backend)

```bash
cd backend

# Setup DB
npm run setup-db

# Run SQL Migrations
npm run migrate

# Run SQL Seeds
npm run seed

# Run Automated Test Suite (24 tests)
npm test

# Run Development Server
npm run dev
```
