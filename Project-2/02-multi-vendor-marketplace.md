# PRD: Multi-Vendor Marketplace

## Overview
A full-stack multi-vendor marketplace built as a modular monolith using the PERN stack. Sellers onboard, list products with variants, and fulfill orders. Buyers browse, purchase from multiple sellers in a single cart, and track orders.

---

## Architecture
- **Pattern:** Modular Monolith
- **Modules:** Auth, Users, Sellers, Products, Categories, Cart, Orders, Payments, Reviews, Search, Analytics

---

## Phase 1: Foundation & Auth (Week 1-2)

### Sub-steps
1. Project scaffolding (Express + React + PostgreSQL)
2. Database setup with migrations
3. User registration/login with JWT
4. Role-based access control (Admin, Seller, Buyer)
5. Profile management

### In Scope
- Email + password auth
- JWT access + refresh token flow
- Role assignment (Admin, Seller, Buyer)
- Profile update (name, email, phone, avatar)
- Password reset flow

### Out of Scope
- OAuth (Google/GitHub login)
- Email verification
- Two-factor auth
- Seller verification/kyc

---

## Phase 2: Seller & Store Setup (Week 2-3)

### Sub-steps
1. Seller registration and store creation
2. Store profile (name, description, logo, banner)
3. Store settings (policies, contact info)
4. Seller dashboard shell
5. Admin seller management

### In Scope
- Store creation with unique slug
- Store profile CRUD
- Store status: Pending, Active, Suspended
- Admin can approve/suspend stores
- Seller sees their store overview

### Out of Scope
- Multi-store per seller
- Store analytics
- Commission settings
- Subscription plans for sellers

---

## Phase 3: Products & Inventory (Week 3-4)

### Sub-steps
1. Product CRUD with rich fields
2. Product categories and subcategories
3. Product variants (size, color, etc.)
4. Inventory tracking per variant
5. Image upload for products

### In Scope
- Product listing (title, description, price, images)
- Category hierarchy (Category → Subcategory)
- Variant creation (type + options, e.g., "Color: Red, Blue")
- Stock quantity per variant
- Product status: Draft, Active, Archived
- Search by product name

### Out of Scope
- Digital products
- Product bundles
- SEO metadata
- Bulk import/export
- Inventory low-stock alerts

---

## Phase 4: Cart & Checkout (Week 4-5)

### Sub-steps
1. Add to cart with variant selection
2. Cart aggregation across sellers
3. Cart update (quantity, remove items)
4. Checkout flow with address
5. Order creation with per-seller splitting

### In Scope
- Cart per buyer (persistent)
- Group cart items by seller
- Shipping address management
- Order creation: one parent order, child orders per seller
- Stock validation at checkout
- Cart badge count

### Out of Scope
- Wishlist
- Saved carts
- Guest checkout
- Multiple shipping addresses per order
- Shipping cost calculation

---

## Phase 5: Orders & Payments (Week 5-6)

### Sub-steps
1. Order status tracking (per parent and child order)
2. Payment processing (simulated)
3. Seller order management (confirm, ship, deliver)
4. Buyer order history
5. Order cancellation flow

### In Scope
- Parent order status: Placed, Processing, Completed, Cancelled
- Child order statuses: Pending, Confirmed, Shipped, Delivered
- Payment statuses: Pending, Completed, Refunded
- Seller can update child order status
- Buyer can cancel before shipment
- Transaction logging

### Out of Scope
- Real payment gateway
- Partial refunds
- Dispute resolution
- Shipping carrier integration
- Tracking numbers

---

## Phase 6: Reviews & Ratings (Week 6-7)

### Sub-steps
1. Product review system (1-5 stars + text)
2. Seller review system
3. Review editing and deletion
4. Rating aggregation
5. Review display with filters

### In Scope
- One review per buyer per product
- Star rating + text comment
- Edit/delete own reviews
- Average rating per product
- Average rating per seller
- Filter reviews by rating

### Out of Scope
- Seller responses to reviews
- Review images
- Verified purchase badge
- Review moderation

---

## Phase 7: Search & Polish (Week 7-8)

### Sub-steps
1. Full-text search with Postgres
2. Category and price range filters
3. Sort by (price, rating, newest)
4. Admin dashboard
5. Deployment setup

### In Scope
- Full-text search on product name + description
- Filter by category, price range, rating
- Sort results
- Admin dashboard (users, sellers, orders)
- Global error handling
- Rate limiting

### Out of Scope
- Autocomplete/suggestions
- Search analytics
- Recommended products
- ElasticSearch integration

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'buyer' CHECK (role IN ('admin', 'seller', 'buyer')),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stores (Seller Profiles)
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  policies TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Product Variants
CREATE TABLE variant_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,  -- e.g., "Color", "Size"
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE variant_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_type_id UUID REFERENCES variant_types(id) ON DELETE CASCADE,
  value VARCHAR(100) NOT NULL,  -- e.g., "Red", "XL"
  created_at TIMESTAMP DEFAULT NOW()
);

-- Product SKUs (combination of variants)
CREATE TABLE product_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku_code VARCHAR(100) UNIQUE NOT NULL,
  price_override DECIMAL(10,2),  -- NULL means use product base price
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_stock CHECK (stock_quantity >= 0)
);

-- SKU ↔ Variant Option mapping
CREATE TABLE sku_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id UUID REFERENCES product_skus(id) ON DELETE CASCADE,
  variant_option_id UUID REFERENCES variant_options(id) NOT NULL,
  UNIQUE(sku_id, variant_option_id)
);

-- Shopping Cart
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  sku_id UUID REFERENCES product_skus(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, sku_id)
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'placed' CHECK (status IN ('placed', 'processing', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Child Orders (per seller)
CREATE TABLE seller_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_order_id UUID REFERENCES seller_orders(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES product_skus(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

CREATE TABLE store_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(store_id, user_id)
);

-- Indexes
CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_seller_orders_store ON seller_orders(store_id);
CREATE INDEX idx_seller_orders_parent ON seller_orders(parent_order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
```

---

## API Routes Structure

```
/auth
  POST   /register
  POST   /login
  POST   /refresh-token
  GET    /me

/sellers
  POST   /register-store        (buyer → seller)
  GET    /stores                 (public)
  GET    /stores/:slug           (public)
  PUT    /stores/:id             (owner)

/products
  POST   /                       (seller)
  GET    /                       (public, with search/filter)
  GET    /:id                     (public)
  PUT    /:id                     (seller, owner)
  DELETE /:id                     (seller, owner)
  GET    /store/:storeId          (public)

/categories
  GET    /                       (public)
  POST   /                       (admin)

/cart
  GET    /                       (buyer)
  POST   /add                    (buyer)
  PUT    /:id                     (buyer)
  DELETE /:id                     (buyer)

/orders
  POST   /checkout                (buyer)
  GET    /me                      (buyer)
  GET    /:id                     (buyer)
  POST   /:id/cancel              (buyer)

/seller-orders
  GET    /                        (seller)
  PUT    /:id/status              (seller)

/payments
  POST   /process                 (system)
  GET    /:orderId                (buyer)

/reviews
  POST   /product/:productId      (buyer)
  GET    /product/:productId      (public)
  PUT    /:id                     (author)
  DELETE /:id                     (author/admin)
  POST   /store/:storeId          (buyer)
  GET    /store/:storeId          (public)

/analytics
  GET    /seller                  (seller)
  GET    /admin                   (admin)
```

---

## Tech Stack & Libraries

### Backend
| Library | Purpose |
|---------|---------|
| Express | HTTP framework |
| Knex.js | Query builder + migrations |
| PostgreSQL | Database |
| bcrypt | Password hashing |
| jsonwebtoken | JWT auth |
| Joi | Request validation |
| Multer | File uploads (multipart) |
| uuid | UUID generation |
| cors | CORS middleware |
| helmet | Security headers |
| morgan | HTTP request logging |
| winston | Application logging |
| express-rate-limit | Rate limiting |

### Frontend
| Library | Purpose |
|---------|---------|
| React 18 | UI framework |
| React Router v6 | Client routing |
| Axios | HTTP client |
| @tanstack/react-query | Server state management |
| Tailwind CSS | Utility-first CSS |
| React Hook Form | Form handling |
| Zustand | Client state management |

### DevOps
| Tool | Purpose |
|------|---------|
| Docker | Containerization |
| docker-compose | Multi-service orchestration |
| Nodemon | Backend hot reload |
| Vite | Frontend build tool |

---

## Project Structure

```
multi-vendor-marketplace/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── env.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── sellers/
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   ├── reviews/
│   │   │   └── search/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── rbac.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── app.js
│   ├── uploads/
│   ├── Dockerfile
│   ├── knexfile.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Docker Setup

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: marketplace
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgres://postgres:postgres@postgres:5432/marketplace
      JWT_SECRET: dev-secret-key-change-in-prod
      JWT_REFRESH_SECRET: dev-refresh-secret-change-in-prod
      NODE_ENV: development
    volumes:
      - ./backend/src:/app/src
      - ./backend/uploads:/app/uploads
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:5000
    volumes:
      - ./frontend/src:/app/src
    depends_on:
      - backend

volumes:
  pgdata:
```

### .env.example
```env
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/marketplace

# JWT
JWT_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:5000
```

---

## Development Workflow

### Git Branching Strategy
```
main (production-ready)
  └── develop (integration branch)
       ├── feature/auth
       ├── feature/sellers
       ├── feature/products
       ├── feature/cart
       ├── feature/orders
       └── feature/reviews
```

### Branch Naming
- `feature/[module]` — new features
- `fix/[module]` — bug fixes
- `chore/[description]` — maintenance tasks

### PR Process
1. Create feature branch from `develop`
2. Commit with conventional commits: `feat(auth): add login endpoint`
3. Push and create PR to `develop`
4. Require 1 approval from team member
5. CI runs lint + tests
6. Squash merge into `develop`

### Group Role Assignments (5-person team)
| Role | Responsibility |
|------|---------------|
| **DB Lead** | Schema design, migrations, seed data, full-text search setup |
| **Backend Lead** | Auth, RBAC, middleware, API structure |
| **Backend Dev 1** | Sellers, Products, Categories modules |
| **Backend Dev 2** | Cart, Orders, Payments modules |
| **Frontend Lead** | React UI, routing, state management, API integration |

---

## API Contract

### Standard Response Format
```json
// Success
{
  "success": true,
  "data": { ... }
}

// Success with pagination
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Must be a valid email" }
    ]
  }
}
```

### Standard Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body/params |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Request/Response Examples

#### POST /auth/register
```json
// Request
{
  "email": "seller@test.com",
  "password": "Seller123!",
  "name": "Jane Seller",
  "role": "seller"
}

// Response 201
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "seller@test.com",
      "name": "Jane Seller",
      "role": "seller"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

#### POST /sellers/register-store
```json
// Request (seller)
{
  "name": "Jane's Fashion",
  "description": "Trendy clothing store",
  "contactEmail": "jane@fashion.com",
  "contactPhone": "+91-9876543210"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jane's Fashion",
    "slug": "janes-fashion",
    "status": "pending"
  }
}
```

#### POST /products
```json
// Request (seller)
{
  "title": "Classic White Tee",
  "description": "100% cotton comfortable white t-shirt",
  "categoryId": "uuid",
  "price": 299.00,
  "variants": [
    {
      "name": "Size",
      "options": ["S", "M", "L", "XL"]
    },
    {
      "name": "Color",
      "options": ["White", "Black"]
    }
  ],
  "skus": [
    { "code": "CWT-WHT-S", "options": { "Size": "S", "Color": "White" }, "stock": 50 },
    { "code": "CWT-WHT-M", "options": { "Size": "M", "Color": "White" }, "stock": 75 }
  ]
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Classic White Tee",
    "status": "draft"
  }
}
```

#### GET /products?search=shirt&category=clothing&minPrice=100&maxPrice=1000&page=1&limit=20
```json
// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Classic White Tee",
        "price": 299.00,
        "store": { "name": "Jane's Fashion", "slug": "janes-fashion" },
        "avgRating": 4.5,
        "reviewCount": 12,
        "images": [{ "url": "/uploads/products/img1.jpg" }]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 85,
      "totalPages": 5
    }
  }
}
```

### Validation Rules

#### Auth
| Field | Rules |
|-------|-------|
| email | Required, valid email format |
| password | Required, min 8 chars, 1 uppercase, 1 number, 1 special char |
| name | Required, 2-100 chars |
| role | Required, enum: admin, seller, buyer |

#### Products
| Field | Rules |
|-------|-------|
| title | Required, 3-255 chars |
| description | Optional, max 5000 chars |
| categoryId | Required, valid UUID |
| price | Required, decimal, min 0.01 |
| variants | Optional, array of {name, options} |
| skus | Optional, array of {code, stock} |

#### Orders
| Field | Rules |
|-------|-------|
| shippingAddress | Required, string, min 10 chars |
| items | Required, array of {skuId, quantity} |
| quantity | Required, integer, min 1 |

---

## Auth Details

### JWT Payload Structure
```json
// Access Token
{
  "sub": "user-uuid",
  "email": "seller@test.com",
  "role": "seller",
  "iat": 1705312200,
  "exp": 1705313100
}

// Refresh Token
{
  "sub": "user-uuid",
  "type": "refresh",
  "iat": 1705312200,
  "exp": 1705917000
}
```

### Token Configuration
| Token | Expiry | Storage |
|-------|--------|---------|
| Access Token | 15 minutes | Memory / httpOnly cookie |
| Refresh Token | 7 days | Database (hashed) + httpOnly cookie |

### Refresh Token Rotation
1. Client sends refresh token to `POST /auth/refresh-token`
2. Server validates refresh token against DB
3. Server deletes old refresh token
4. Server issues new access + refresh token pair
5. New refresh token stored in DB
6. If refresh token reuse detected → invalidate all user tokens

---

## Testing Strategy

### Testing Stack
| Tool | Purpose |
|------|---------|
| Jest | Unit testing |
| Supertest | API integration testing |
| Knex seeds | Test data setup |

### Test File Structure
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.service.test.js
│   │   │   └── auth.controller.test.js
│   │   ├── products/
│   │   │   ├── products.service.test.js
│   │   │   ├── products.repository.test.js
│   │   │   └── products.integration.test.js
│   │   └── ...
│   └── middleware/
│       ├── auth.middleware.test.js
│       └── rbac.middleware.test.js
├── tests/
│   ├── setup.js
│   └── helpers.js
└── jest.config.js
```

### Test Coverage Targets
- Services: unit tests for business logic
- Repositories: integration tests with test DB
- Controllers: integration tests with Supertest
- Middleware: unit tests

---

## Seed Data

### Test Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@test.com | Admin123! | admin |
| seller1@test.com | Seller123! | seller |
| seller2@test.com | Seller123! | seller |
| buyer@test.com | Buyer123! | buyer |

### Sample Seed Data
- 2 sellers with active stores
- 3 categories (Electronics, Clothing, Home)
- 10 products with variants and SKUs
- 5 orders in various statuses
- 8 reviews across products

---

## File Storage

### Local Development
- Uploads stored in `backend/uploads/`
- Served statically via Express
- Path: `/uploads/[module]/[filename]`

### Production (Cloudinary)
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Upload Limits
| Type | Max Size | Allowed Formats |
|------|----------|-----------------|
| Product Image | 5MB | jpg, png, webp |
| Store Logo | 2MB | jpg, png, webp |
| Store Banner | 5MB | jpg, png, webp |
| User Avatar | 2MB | jpg, png, webp |
