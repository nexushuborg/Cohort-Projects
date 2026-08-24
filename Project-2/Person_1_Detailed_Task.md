# Person 1 — Detailed Task & Folder Structure

## 1. Role

Person 1 is responsible for the complete foundation, authentication, user, seller/store and category side of the marketplace.

### Primary ownership

- Authentication
- Users
- RBAC
- Database
- Migrations
- Common Middleware
- Sellers
- Stores
- Categories

---

# 2. Git Branches

Person 1 will work on:

```text
develop
   │
   ├── feature/auth       ← Person 1
   └── feature/sellers    ← Person 1
```

### Branch responsibility

| Branch | Responsibility |
|---|---|
| `feature/auth` | Database foundation, authentication, users, JWT, RBAC, middleware |
| `feature/sellers` | Seller registration, stores, store management, seller-related APIs |

### Important

Do not create separate branches for every small task.

Keep related work together:

```text
feature/auth
├── Registration
├── Login
├── JWT
├── Refresh Token
├── Users
└── RBAC
```

---

# 3. Person 1 Folder Ownership

Person 1 owns:

```text
backend/
└── src/
    ├── config/
    │   ├── database.js
    │   └── env.js
    │
    ├── middleware/
    │   ├── auth.middleware.js
    │   ├── rbac.middleware.js
    │   ├── error.middleware.js
    │   └── validate.middleware.js
    │
    ├── migrations/
    │
    ├── seeds/
    │
    └── modules/
        ├── auth/
        ├── users/
        ├── sellers/
        └── categories/
```

---

# 4. Complete Folder Structure

```text
backend/
│
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── rbac.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   │
│   ├── migrations/
│   │   ├── 001_create_users.js
│   │   ├── 002_create_stores.js
│   │   ├── 003_create_categories.js
│   │   ├── 004_create_products.js
│   │   ├── 005_create_product_images.js
│   │   ├── 006_create_variant_types.js
│   │   ├── 007_create_variant_options.js
│   │   ├── 008_create_product_skus.js
│   │   ├── 009_create_sku_variants.js
│   │   ├── 010_create_cart_items.js
│   │   ├── 011_create_orders.js
│   │   ├── 012_create_seller_orders.js
│   │   ├── 013_create_order_items.js
│   │   ├── 014_create_payments.js
│   │   ├── 015_create_reviews.js
│   │   └── 016_create_store_reviews.js
│   │
│   ├── seeds/
│   │   ├── users.seed.js
│   │   ├── categories.seed.js
│   │   └── stores.seed.js
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.repository.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.validation.js
│   │   │
│   │   ├── users/
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.repository.js
│   │   │   ├── user.routes.js
│   │   │   └── user.validation.js
│   │   │
│   │   ├── sellers/
│   │   │   ├── seller.controller.js
│   │   │   ├── seller.service.js
│   │   │   ├── seller.repository.js
│   │   │   ├── seller.routes.js
│   │   │   └── seller.validation.js
│   │   │
│   │   └── categories/
│   │       ├── category.controller.js
│   │       ├── category.service.js
│   │       ├── category.repository.js
│   │       ├── category.routes.js
│   │       └── category.validation.js
│   │
│   ├── app.js
│   └── server.js
│
├── knexfile.js
├── package.json
└── .env
```

---

# 5. Database Responsibility

## Person 1 owns migrations

Person 1 controls the migration files because all other modules depend on the database structure.

### Workflow

```text
Person 2
   │
   │ Needs database change
   ▼
Person 1
   │
   │ Creates migration
   ▼
Shared database
```

Person 2 should not independently modify shared migration files.

---

# 6. Database Tables

Person 1 should establish the initial database structure required by the project.

```text
users
stores
categories
products
product_images
variant_types
variant_options
product_skus
sku_variants
cart_items
orders
seller_orders
order_items
payments
reviews
store_reviews
```

---

# 7. Users Table

Create:

```text
users
```

Important fields:

```text
id
name
email
password
phone
avatar
role
created_at
updated_at
```

Roles:

```text
admin
seller
buyer
```

---

# 8. Stores Table

Create:

```text
stores
```

The store should support:

```text
id
seller/user reference
name
slug
description
logo
banner
contact information
policies
status
created_at
updated_at
```

Store status:

```text
pending
active
suspended
```

---

# 9. Categories

Create:

```text
categories
```

Support:

```text
Category
   └── Subcategory
```

Example:

```text
Electronics
├── Mobiles
├── Laptops
└── Accessories

Fashion
├── Men
├── Women
└── Shoes
```

---

# 10. Authentication Module

## Folder

```text
modules/auth/
```

### Routes

```text
POST /auth/register
POST /auth/login
POST /auth/refresh-token
POST /auth/logout
GET  /auth/me
```

### `auth.controller.js`

Responsible for:

```text
Receive request
      ↓
Validate/request data
      ↓
Call service
      ↓
Return response
```

Do not put database queries directly inside the controller.

### `auth.service.js`

Business logic:

```text
register user
login user
verify password
generate access token
generate refresh token
refresh access token
```

### `auth.repository.js`

Database operations:

```text
findUserByEmail()
findUserById()
createUser()
updateUser()
```

### `auth.validation.js`

Validate:

```text
Registration:
- name
- email
- password
- phone

Login:
- email
- password
```

---

# 11. JWT Authentication

Implement:

```text
Access Token
+
Refresh Token
```

Flow:

```text
Login
  │
  ▼
Verify email/password
  │
  ▼
Generate Access Token
  │
  ▼
Generate Refresh Token
  │
  ▼
Return tokens
```

Refresh flow:

```text
Access token expires
       │
       ▼
Refresh token
       │
       ▼
New access token
```

---

# 12. Authentication Middleware

## File

```text
middleware/auth.middleware.js
```

Flow:

```text
Request
   ↓
Authorization Header
   ↓
Verify JWT
   ↓
Extract user
   ↓
req.user
   ↓
Controller
```

Expected header:

```text
Authorization: Bearer <token>
```

---

# 13. RBAC Middleware

## File

```text
middleware/rbac.middleware.js
```

Support:

```text
requireRole("admin")
requireRole("seller")
requireRole("buyer")
```

Example:

```text
GET /admin/users

JWT
 ↓
authMiddleware
 ↓
requireRole("admin")
 ↓
Controller
```

---

# 14. Error Middleware

## File

```text
middleware/error.middleware.js
```

Use one consistent error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data"
  }
}
```

All team members should follow this format.

---

# 15. Validation Middleware

## File

```text
middleware/validate.middleware.js
```

Use Joi validation.

Flow:

```text
Request
 ↓
Joi validation
 ↓
Valid?
 ├── No → 400 error
 └── Yes
       ↓
    Controller
```

---

# 16. Seller Module

## Folder

```text
modules/sellers/
```

Implement seller registration:

```text
POST /sellers/register-store
```

The seller flow should support:

```text
Buyer/User
   ↓
Seller registration
   ↓
Store creation
   ↓
Store status = pending
```

---

# 17. Store APIs

Implement:

```text
GET /sellers/stores
GET /sellers/stores/:slug
PUT /sellers/stores/:id
```

Seller-owned store updates must be protected.

---

# 18. Store Ownership

A seller can modify only their own store.

Flow:

```text
Request
 ↓
JWT
 ↓
User ID
 ↓
Find store
 ↓
Check store.seller_id === req.user.id
 ↓
Allow update
```

If another seller attempts the update:

```text
❌ Forbidden
```

---

# 19. Store Status

Implement:

```text
Pending
Active
Suspended
```

Flow:

```text
Seller creates store
       ↓
Pending
       ↓
Admin approves
       ↓
Active
```

Suspension:

```text
Active
  ↓
Admin suspends
  ↓
Suspended
```

---

# 20. Category Module

## Folder

```text
modules/categories/
```

Implement:

```text
GET    /categories
POST   /categories
PUT    /categories/:id
DELETE /categories/:id
```

Support category/subcategory relationships.

---

# 21. Seeds

Person 1 should create initial seed data:

```text
seeds/
├── users.seed.js
├── categories.seed.js
└── stores.seed.js
```

Example users:

```text
admin@example.com
seller@example.com
buyer@example.com
```

Example categories:

```text
Electronics
Fashion
Home
Books
```

---

# 22. `app.js` Responsibility

Person 1 establishes the main Express application structure.

Flow:

```text
Express
 ↓
CORS
 ↓
JSON parser
 ↓
Routes
 ↓
Error middleware
```

Routes should be organized under:

```text
/auth
/users
/sellers
/categories
/products
/cart
/orders
/payments
/reviews
/search
```

Person 2 and Person 3 can add their routes without changing the overall architecture.

---

# 23. Person 1's Final Backend Structure

```text
backend/
│
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── rbac.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   │
│   ├── migrations/
│   │   ├── 001_create_users.js
│   │   ├── 002_create_stores.js
│   │   ├── 003_create_categories.js
│   │   ├── ...
│   │   └── 016_create_store_reviews.js
│   │
│   ├── seeds/
│   │   ├── users.seed.js
│   │   ├── categories.seed.js
│   │   └── stores.seed.js
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.repository.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.validation.js
│   │   │
│   │   ├── users/
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.repository.js
│   │   │   ├── user.routes.js
│   │   │   └── user.validation.js
│   │   │
│   │   ├── sellers/
│   │   │   ├── seller.controller.js
│   │   │   ├── seller.service.js
│   │   │   ├── seller.repository.js
│   │   │   ├── seller.routes.js
│   │   │   └── seller.validation.js
│   │   │
│   │   └── categories/
│   │       ├── category.controller.js
│   │       ├── category.service.js
│   │       ├── category.repository.js
│   │       ├── category.routes.js
│   │       └── category.validation.js
│   │
│   ├── app.js
│   └── server.js
│
├── knexfile.js
├── package.json
└── .env
```

---

# 24. What Person 1 Must Give Person 2

Before Person 2 integrates commerce modules, Person 1 should provide:

```text
✓ Database running
✓ Migrations working
✓ Seed data working
✓ User table
✓ Store table
✓ Category table
✓ Authentication
✓ JWT middleware
✓ RBAC middleware
✓ Error format
✓ Validation format
✓ API response format
```

Most importantly:

```text
req.user
```

must be reliably available after authentication.

Person 2 can then use:

```text
req.user.id
```

to determine ownership and identity.

---

# 25. What Person 1 Must Give Person 3

Person 3 needs working APIs for:

```text
POST /auth/register
POST /auth/login
POST /auth/refresh-token
GET  /auth/me

POST /sellers/register-store
GET  /sellers/stores
GET  /sellers/stores/:slug
PUT  /sellers/stores/:id

GET /categories
```

Person 3 can then build:

```text
Login
Register
Profile
Seller registration
Store pages
Category pages
Protected routes
Role-based UI
```

---

# 26. Person 1 Testing Checklist

## Database

```text
[ ] PostgreSQL connection works
[ ] All migrations run successfully
[ ] Migrations can be rolled back
[ ] Foreign keys work
[ ] Constraints work
[ ] Seed data works
```

## Authentication

```text
[ ] Register works
[ ] Duplicate email rejected
[ ] Password hashed
[ ] Login works
[ ] Wrong password rejected
[ ] JWT generated
[ ] Access token verified
[ ] Refresh token works
[ ] Invalid token rejected
[ ] /auth/me works
```

## RBAC

```text
[ ] Admin access works
[ ] Seller access works
[ ] Buyer access works
[ ] Unauthorized requests rejected
[ ] Wrong-role requests rejected
```

## Sellers

```text
[ ] Seller registration works
[ ] Store creation works
[ ] Unique slug enforced
[ ] Store retrieval works
[ ] Store update works
[ ] Seller can only update own store
[ ] Store status works
```

## Categories

```text
[ ] Category creation works
[ ] Category listing works
[ ] Category update works
[ ] Category deletion works
[ ] Subcategory relationship works
```

---

# 27. Definition of DONE

Person 1 is DONE only when this complete flow works:

```text
Create Database
      ↓
Run Migrations
      ↓
Seed Database
      ↓
Register Buyer
      ↓
Login
      ↓
Receive JWT
      ↓
Access Protected Route
      ↓
RBAC Works
      ↓
Register Seller
      ↓
Create Store
      ↓
Store = Pending
      ↓
Admin Approval
      ↓
Store = Active
      ↓
Create Categories
      ↓
Person 2 can create Products
      ↓
Person 3 can use Auth/Seller APIs
```

---

# 28. Person 1 Priority Order

Follow this order:

```text
1. Backend setup
        ↓
2. PostgreSQL connection
        ↓
3. Knex setup
        ↓
4. Database migrations
        ↓
5. Seed data
        ↓
6. User repository
        ↓
7. Registration
        ↓
8. Login
        ↓
9. JWT
        ↓
10. Refresh token
        ↓
11. Auth middleware
        ↓
12. RBAC
        ↓
13. Error middleware
        ↓
14. Validation middleware
        ↓
15. User profile
        ↓
16. Seller registration
        ↓
17. Store CRUD
        ↓
18. Store ownership
        ↓
19. Store status
        ↓
20. Categories
        ↓
21. Test complete flow
        ↓
22. Merge into develop
```

---

# 29. Final Ownership Summary

```text
PERSON 1
│
├── DATABASE
│   ├── PostgreSQL
│   ├── Knex
│   ├── Migrations
│   └── Seeds
│
├── AUTH
│   ├── Register
│   ├── Login
│   ├── JWT
│   ├── Refresh Token
│   └── Password handling
│
├── USERS
│   └── Profile
│
├── RBAC
│   ├── Admin
│   ├── Seller
│   └── Buyer
│
├── MIDDLEWARE
│   ├── Authentication
│   ├── Authorization
│   ├── Validation
│   └── Errors
│
├── SELLERS
│   ├── Seller registration
│   ├── Store creation
│   ├── Store CRUD
│   ├── Store ownership
│   └── Store status
│
└── CATEGORIES
    ├── Categories
    └── Subcategories
```

## Core responsibility

> **Person 1 builds the foundation that Persons 2 and 3 depend on: database, authentication, users, RBAC, sellers, stores, categories and shared backend middleware.**
