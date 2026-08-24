# Multi-Vendor Marketplace - Backend (Modular Monolith)

Full-stack Multi-Vendor E-Commerce Marketplace Backend built as a modular monolith using **Node.js, Express, PostgreSQL (`pg`), Pure SQL queries, and MVC architecture**.

---

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment Variables
Copy `.env.example` to `.env` (already pre-configured for local PostgreSQL):
```bash
cp .env.example .env
```

### 3. Provision Database & Run Migrations
```bash
# Provision marketplace and marketplace_test databases
npm run setup-db

# Run pure SQL migrations (Creates all 16 tables and full-text search indexes)
npm run migrate

# Seed initial test data (Users, Stores, Categories)
npm run seed
```

### 4. Run Automated Tests
```bash
npm test
```

### 5. Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

---

## Seed Test Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@test.com` | `Admin123!` | System Administrator with platform-wide access |
| **Seller 1** | `seller1@test.com` | `Seller123!` | Active store: **Tech Haven Store** (`tech-haven-store`) |
| **Seller 2** | `seller2@test.com` | `Seller123!` | Active store: **Vogue Boutique** (`vogue-boutique`) |
| **Buyer** | `buyer@test.com` | `Buyer123!` | Standard customer account |

---

## API Endpoints Overview

### Auth Module (`/auth`)
- `POST /auth/register` - Register a user (`admin`, `seller`, `buyer`)
- `POST /auth/login` - Authenticate and retrieve JWT access & refresh tokens
- `POST /auth/refresh-token` - Rotate refresh token & get new access token
- `POST /auth/logout` - Invalidate refresh token session
- `GET /auth/me` - Get authenticated user profile

### Users Module (`/users`)
- `GET /users/profile` - Get own profile
- `PUT /users/profile` - Update name, phone, avatar
- `PUT /users/password` - Change password
- `GET /users` - Admin-only user listing

### Sellers & Stores Module (`/sellers`)
- `POST /sellers/register-store` - Onboard store (status: `pending`)
- `GET /sellers/stores` - List active stores (public, paginated)
- `GET /sellers/stores/:slug` - Get store by slug (public)
- `GET /sellers/stores/me/profile` - Get own store (seller)
- `PUT /sellers/stores/:id` - Update store (owner-only)
- `PATCH /sellers/stores/:id/status` - Admin approve/suspend store

### Categories Module (`/categories`)
- `GET /categories` - Hierarchical category tree (public)
- `GET /categories/:id` - Get category by ID or slug (public)
- `POST /categories` - Create category / subcategory (admin)
- `PUT /categories/:id` - Update category (admin)
- `DELETE /categories/:id` - Delete category (admin)

---

## Architectural Rules & Conventions

- **MVC Pattern**: Model (SQL Repository) $\rightarrow$ Service (Logic) $\rightarrow$ View (Serializer) $\rightarrow$ Controller $\rightarrow$ Routes.
- **Pure Functions**: Functional implementation throughout.
- **Consistent Response Envelopes**:
  - Success: `{ "success": true, "data": { ... } }`
  - Error: `{ "success": false, "error": { "code": "...", "message": "..." } }`
- **Native SQL**: Direct parameterized queries via `pg.Pool` (`$1, $2, ...`).
