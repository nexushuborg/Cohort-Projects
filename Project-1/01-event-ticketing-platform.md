# PRD: Event Ticketing Platform

## Overview
A full-stack event ticketing platform built as a modular monolith using the PERN stack. Organizers create events, manage venues/seating, and sell tickets. Attendees browse, book, and receive QR-coded tickets.

---

## Architecture
- **Pattern:** Modular Monolith (each module has its own routes, controllers, services, repository)
- **Modules:** Auth, Events, Venues, Bookings, Payments, Tickets, Reviews, Analytics

---

## Phase 1: Foundation & Auth (Week 1-2)

### Sub-steps
1. Project scaffolding (Express + React + PostgreSQL)
2. Database setup with migrations
3. User registration/login with JWT
4. Role-based access control (Admin, Organizer, Attendee)
5. Profile management

### In Scope
- Email + password auth
- JWT access + refresh token flow
- Role assignment (Admin, Organizer, Attendee)
- Password reset flow
- Input validation on all endpoints

### Out of Scope
- OAuth (Google/GitHub login)
- Email verification
- Two-factor auth

---

## Phase 2: Events & Venues (Week 2-3)

### Sub-steps
1. Event CRUD (create, read, update, delete)
2. Event categories and tagging
3. Image upload for event banners
4. Venue CRUD with address management
5. Seat map builder (sections → rows → seats)

### In Scope
- Event listing with filters (category, date, location)
- Pagination on event lists
- Venue creation with capacity
- Seat map as nested structure (section → row → seat)
- Event status: Draft, Published, Cancelled

### Out of Scope
- Recurring events
- Multi-day events
- Map integration (Google Maps)
- Venue analytics

---

## Phase 3: Ticketing & Inventory (Week 3-4)

### Sub-steps
1. Ticket tier creation (VIP, General, Early Bird, etc.)
2. Price and quantity per tier
3. Seat assignment per booking
4. Seat locking mechanism (temporary hold during checkout)
5. Inventory decrement with optimistic locking

### In Scope
- Multiple ticket tiers per event
- Per-seat or general admission mode
- Seat hold with TTL (e.g., 10 minutes)
- Atomic inventory decrement
- Sold-out detection

### Out of Scope
- Group discounts
- Promo codes
- Waitlist
- Ticket transfers

---

## Phase 4: Bookings & Payments (Week 4-5)

### Sub-steps
1. Cart/checkout flow
2. Booking creation with seat reservation
3. Payment integration (Stripe test mode or simulated)
4. Payment status tracking
5. Booking confirmation and cancellation

### In Scope
- Single-event checkout (one event per booking)
- Payment statuses: Pending, Completed, Failed, Refunded
- Booking statuses: Pending, Confirmed, Cancelled
- Refund initiation (admin only)
- Transaction logging

### Out of Scope
- Multi-event checkout
- Real Stripe integration
- Installment payments
- Invoice generation

---

## Phase 5: Tickets & QR (Week 5-6)

### Sub-steps
1. Ticket generation after successful payment
2. QR code generation per ticket
3. Ticket PDF export
4. Ticket validation at entry (scan QR)
5. Ticket listing in attendee dashboard

### In Scope
- Unique QR code per ticket
- QR contains ticket ID + event ID
- Ticket status: Valid, Used, Cancelled
- Check-in endpoint (mark ticket as used)
- Attendee sees all their tickets

### Out of Scope
- PDF generation
- Email ticket delivery
- Offline QR validation
- Multi-use tickets

---

## Phase 6: Reviews & Analytics (Week 6-7)

### Sub-steps
1. Post-event review system (1-5 stars + text)
2. Organizer can respond to reviews
3. Organizer dashboard (tickets sold, revenue)
4. Admin dashboard (platform-wide stats)
5. Basic search analytics

### In Scope
- One review per user per event
- Edit/delete own reviews
- Organizer response to reviews
- Revenue per event calculation
- Total tickets sold per event
- Platform-wide stats (total events, users, revenue)

### Out of Scope
- Sentiment analysis
- Recommendation engine
- Export reports
- Real-time analytics

---

## Phase 7: Polish & Deployment (Week 7-8)

### Sub-steps
- Error handling middleware
- Rate limiting
- Logging
- React frontend completion
- Deployment setup

### In Scope
- Global error handler
- Rate limit on auth and booking endpoints
- Winston/Pino logging
- Responsive React UI
- Docker setup

### Out of Scope
- CI/CD pipeline
- Monitoring/alerting
- Load testing
- Internationalization

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'attendee' CHECK (role IN ('admin', 'organizer', 'attendee')),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Venues
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  country VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20),
  capacity INTEGER NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Venue Seat Maps
CREATE TABLE venue_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE venue_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES venue_sections(id) ON DELETE CASCADE,
  label VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE venue_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  row_id UUID REFERENCES venue_rows(id) ON DELETE CASCADE,
  label VARCHAR(10) NOT NULL,
  seat_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  venue_id UUID REFERENCES venues(id),
  organizer_id UUID REFERENCES users(id) NOT NULL,
  banner_url TEXT,
  event_date TIMESTAMP NOT NULL,
  event_end_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ticket Tiers
CREATE TABLE ticket_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total_quantity INTEGER NOT NULL,
  sold_quantity INTEGER DEFAULT 0,
  sale_start TIMESTAMP,
  sale_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_sold CHECK (sold_quantity <= total_quantity)
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  event_id UUID REFERENCES events(id) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Booking Items (tickets in a booking)
CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  ticket_tier_id UUID REFERENCES ticket_tiers(id) NOT NULL,
  seat_id UUID REFERENCES venue_seats(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_item_id UUID REFERENCES booking_items(id) NOT NULL,
  qr_code VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled')),
  checked_in_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seat Holds (temporary reservation)
CREATE TABLE seat_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id UUID REFERENCES venue_seats(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  organizer_response TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_event ON bookings(event_id);
CREATE INDEX idx_tickets_qr ON tickets(qr_code);
CREATE INDEX idx_ticket_tiers_event ON ticket_tiers(event_id);
CREATE INDEX idx_reviews_event ON reviews(event_id);
```

---

## API Routes Structure

```
/auth
  POST   /register
  POST   /login
  POST   /refresh-token
  POST   /forgot-password
  GET    /me

/venues
  POST   /              (organizer/admin)
  GET    /
  GET    /:id
  PUT    /:id            (owner/admin)
  DELETE /:id            (owner/admin)

/events
  POST   /              (organizer)
  GET    /              (public, with filters)
  GET    /:id            (public)
  PUT    /:id            (owner/admin)
  DELETE /:id            (owner/admin)
  POST   /:id/publish    (owner)

/ticket-tiers
  POST   /:eventId       (organizer)
  GET    /:eventId       (public)
  PUT    /:id            (owner)
  DELETE /:id            (owner)

/bookings
  POST   /              (attendee)
  GET    /me             (attendee)
  GET    /:id            (attendee/admin)
  POST   /:id/cancel     (attendee/admin)

/payments
  POST   /process        (system)
  GET    /:bookingId     (attendee)

/tickets
  GET    /me             (attendee)
  POST   /check-in       (organizer)
  GET    /:id/qr         (attendee)

/reviews
  POST   /:eventId       (attendee)
  GET    /:eventId       (public)
  PUT    /:id            (author)
  DELETE /:id            (author/admin)
  POST   /:id/respond    (organizer)

/analytics
  GET    /organizer      (organizer)
  GET    /admin          (admin)
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
| qrcode | QR code generation |
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
event-ticketing-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Knex config
│   │   │   └── env.js               # Environment variables
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   └── auth.validation.js
│   │   │   ├── events/
│   │   │   │   ├── events.routes.js
│   │   │   │   ├── events.controller.js
│   │   │   │   ├── events.service.js
│   │   │   │   ├── events.repository.js
│   │   │   │   └── events.validation.js
│   │   │   ├── venues/
│   │   │   ├── bookings/
│   │   │   ├── payments/
│   │   │   ├── tickets/
│   │   │   └── reviews/
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
      POSTGRES_DB: event_ticketing
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
      DATABASE_URL: postgres://postgres:postgres@postgres:5432/event_ticketing
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
DATABASE_URL=postgres://postgres:postgres@localhost:5432/event_ticketing

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
       ├── feature/events
       ├── feature/venues
       ├── feature/bookings
       └── feature/tickets
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
| **DB Lead** | Schema design, migrations, seed data, query optimization |
| **Backend Lead** | Auth, RBAC, middleware, API structure |
| **Backend Dev 1** | Events, Venues, Bookings modules |
| **Backend Dev 2** | Tickets, Payments, Reviews modules |
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
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe",
  "role": "organizer"
}

// Response 201
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "organizer"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

#### POST /auth/login
```json
// Request
{
  "email": "user@example.com",
  "password": "Password123!"
}

// Response 200
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "organizer"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

#### POST /events
```json
// Request (organizer)
{
  "title": "Tech Conference 2025",
  "description": "Annual tech conference",
  "category": "Technology",
  "venueId": "uuid",
  "eventDate": "2025-06-15T09:00:00Z",
  "eventEndDate": "2025-06-15T18:00:00Z"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Tech Conference 2025",
    "status": "draft",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

#### GET /events?page=1&limit=20&category=Technology
```json
// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Tech Conference 2025",
        "category": "Technology",
        "eventDate": "2025-06-15T09:00:00Z",
        "venue": { "name": "Convention Center", "city": "Mumbai" },
        "ticketTiers": [
          { "name": "General", "price": 500, "available": 200 }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
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
| role | Required, enum: admin, organizer, attendee |

#### Events
| Field | Rules |
|-------|-------|
| title | Required, 3-255 chars |
| description | Optional, max 5000 chars |
| category | Required, string |
| venueId | Required, valid UUID |
| eventDate | Required, ISO 8601 date, must be future |
| eventEndDate | Optional, must be after eventDate |

#### Bookings
| Field | Rules |
|-------|-------|
| eventId | Required, valid UUID |
| ticketTierId | Required, valid UUID |
| quantity | Required, integer, min 1, max 10 |
| seatIds | Optional, array of UUIDs (for seated events) |

---

## Auth Details

### JWT Payload Structure
```json
// Access Token
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "organizer",
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
│   │   ├── events/
│   │   │   ├── events.service.test.js
│   │   │   ├── events.repository.test.js
│   │   │   └── events.integration.test.js
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
| organizer@test.com | Organ123! | organizer |
| attendee@test.com | Attend123! | attendee |

### Sample Seed Data
- 2 organizers with 3 events each
- 3 venues with seat maps (100, 500, 1000 capacity)
- 3 ticket tiers per event
- 10 attendees with sample bookings
- 5 reviews across events

---

## File Storage

### Local Development
- Uploads stored in `backend/uploads/`
- Served statically via Express
- Path: `/uploads/[category]/[filename]`

### Production (Cloudinary)
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Upload Limits
| Type | Max Size | Allowed Formats |
|------|----------|-----------------|
| Event Banner | 5MB | jpg, png, webp |
| Venue Photo | 5MB | jpg, png, webp |
| User Avatar | 2MB | jpg, png, webp |
