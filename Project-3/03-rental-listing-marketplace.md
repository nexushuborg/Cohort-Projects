# PRD: Rental/Listing Marketplace (Airbnb-style)

## Overview
A full-stack rental marketplace built as a modular monolith using the PERN stack. Hosts list properties with availability calendars. Guests search, book, and review properties. Includes geo-based search and date conflict detection.

---

## Architecture
- **Pattern:** Modular Monolith
- **Modules:** Auth, Users, Properties, Calendar, Bookings, Payments, Reviews, Search, Messaging

---

## Phase 1: Foundation & Auth (Week 1-2)

### Sub-steps
1. Project scaffolding (Express + React + PostgreSQL)
2. Database setup with migrations
3. User registration/login with JWT
4. Role-based access (Host, Guest, Admin)
5. Profile management

### In Scope
- Email + password auth
- JWT access + refresh token flow
- Role assignment (Host, Guest, Admin)
- Profile update (name, bio, avatar, phone)
- Password reset

### Out of Scope
- OAuth
- Email verification
- Identity verification
- Two-factor auth

---

## Phase 2: Properties & Listings (Week 2-3)

### Sub-steps
1. Property CRUD with rich fields
2. Property types (Apartment, House, Villa, etc.)
3. Amenities management
4. Photo upload (multiple per property)
5. Property status management

### In Scope
- Property listing (title, description, type, price per night)
- Location with city, state, country, address
- Max guests, bedrooms, bathrooms, beds
- Amenities (WiFi, Pool, Kitchen, Parking, etc.)
- Multiple photos per property
- Property status: Draft, Published, Unlisted
- Host can CRUD their own properties

### Out of Scope
- Interactive map display
- Street view
- Virtual tours
- Availability calendar display on listing
- Instant booking

---

## Phase 3: Availability Calendar (Week 3-4)

### Sub-steps
1. Availability date range management per property
2. Block/unblock dates
3. Date conflict detection (prevent overlapping bookings)
4. Calendar view endpoint
5. Minimum/maximum stay rules

### In Scope
- Host can mark available/blocked date ranges
- System rejects overlapping blocked dates
- Booking creates automatic blocks
- Query: "is property X available for date range Y?"
- Min/max stay per property (e.g., min 2 nights)

### Out of Scope
- Seasonal pricing display on calendar
- iCal sync
- Partial-day bookings
- Recurring blocks

---

## Phase 4: Bookings & Payments (Week 4-5)

### Sub-steps
1. Guest booking request flow
2. Host accept/decline
3. Booking status lifecycle
4. Payment processing (simulated)
5. Cancellation policy enforcement

### In Scope
- Guest sends booking request (dates, guest count)
- Host approves or declines within 24h (simulated)
- Booking statuses: Pending → Approved → Completed / Declined / Cancelled
- Payment holds until check-in
- Cancellation policies: Flexible (full refund 24h before), Moderate (50% refund 7d before), Strict (50% refund 30d before)
- Guest sees booking history, host sees upcoming/ past bookings

### Out of Scope
- Instant booking
- Long-term stay discounts
- Payment splitting (cleaning fee, service fee)
- Pre-authorization holds
- Multi-property booking

---

## Phase 5: Reviews & Ratings (Week 5-6)

### Sub-steps
1. Post-stay review system
2.双向 review (guest reviews property, host reviews guest)
3. Rating categories (cleanliness, accuracy, communication, location, value)
4. Review aggregation
5. Review display rules

### In Scope
- Guest reviews property after completed stay
- Host reviews guest after completed stay
- 1-5 star rating + text
- Category ratings: Cleanliness, Accuracy, Communication, Location, Value
- Average rating per property
- Review can only be left after checkout

### Out of Scope
- Review photos
- Response to reviews
- Review moderation
- Superhost badge

---

## Phase 6: Search & Filters (Week 6-7)

### Sub-steps
1. Text search on title + description
2. Filter by city/country
3. Filter by price range, guest count
4. Filter by amenities
5. Sort by (price, rating, newest)

### In Scope
- Full-text search (Postgres GIN)
- Filter: location, price range, guests, property type
- Filter: specific amenities (WiFi, Pool, etc.)
- Sort: price low/high, rating, newest
- Pagination on results

### Out of Scope
- Map-based search
- Geolocation radius search
- Search suggestions/autocomplete
- Saved searches

---

## Phase 7: Polish & Deployment (Week 7-8)

### Sub-steps
- Host dashboard (listings, bookings, earnings)
- Guest dashboard (trips, wishlist)
- Admin dashboard
- Error handling, rate limiting
- Deployment

### In Scope
- Host dashboard: manage listings, view bookings, earnings summary
- Guest dashboard: upcoming trips, past trips
- Admin: users, properties, bookings overview
- Global error handler
- Rate limiting on auth/booking endpoints

### Out of Scope
- Messaging between host/guest
- Wishlists
- Notifications (email/push)
- Host earnings payout system
- Mobile responsive design

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'guest' CHECK (role IN ('admin', 'host', 'guest')),
  phone VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Types
CREATE TABLE property_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO property_types (name) VALUES
  ('Apartment'), ('House'), ('Villa'), ('Cabin'),
  ('Cottage'), ('Loft'), ('Townhouse'), ('Bungalow');

-- Amenities
CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50)
);

INSERT INTO amenities (name) VALUES
  ('WiFi'), ('Pool'), ('Kitchen'), ('Parking'),
  ('Air Conditioning'), ('Heating'), ('Washer'),
  ('Dryer'), ('TV'), ('Hot Tub'), ('Fireplace'),
  ('Dedicated Workspace'), ('Pet Friendly');

-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES users(id) NOT NULL,
  property_type_id UUID REFERENCES property_types(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  country VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  price_per_night DECIMAL(10,2) NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 1,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  beds INTEGER NOT NULL DEFAULT 1,
  min_nights INTEGER DEFAULT 1,
  max_nights INTEGER DEFAULT 30,
  cancellation_policy VARCHAR(20) DEFAULT 'moderate' CHECK (cancellation_policy IN ('flexible', 'moderate', 'strict')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unlisted')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Amenities (junction)
CREATE TABLE property_amenities (
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id UUID REFERENCES amenities(id) NOT NULL,
  PRIMARY KEY (property_id, amenity_id)
);

-- Property Photos
CREATE TABLE property_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Availability Blocks (host-blocked dates)
CREATE TABLE availability_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason VARCHAR(50) DEFAULT 'host_blocked' CHECK (reason IN ('host_blocked', 'booking', 'maintenance')),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT no_overlap EXCLUDE USING gist (
    property_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  )
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) NOT NULL,
  guest_id UUID REFERENCES users(id) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1,
  total_nights INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'completed', 'cancelled')),
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (check_out > check_in)
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

-- Reviews
CREATE TABLE property_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) NOT NULL,
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  guest_id UUID REFERENCES users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(booking_id, guest_id)
);

CREATE TABLE guest_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  host_id UUID REFERENCES users(id) NOT NULL,
  guest_id UUID REFERENCES users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(booking_id, host_id)
);

-- Indexes
CREATE INDEX idx_properties_host ON properties(host_id);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_country ON properties(country);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price_per_night);
CREATE INDEX idx_properties_search ON properties USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_guest ON bookings(guest_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_availability_property ON availability_blocks(property_id);
CREATE INDEX idx_availability_dates ON availability_blocks(start_date, end_date);
CREATE INDEX idx_property_reviews_property ON property_reviews(property_id);
```

---

## API Routes Structure

```
/auth
  POST   /register
  POST   /login
  POST   /refresh-token
  GET    /me

/properties
  POST   /                       (host)
  GET    /                       (public, search/filters)
  GET    /:id                     (public)
  PUT    /:id                     (host, owner)
  DELETE /:id                     (host, owner)
  GET    /my                      (host)

/availability
  GET    /:propertyId             (public)
  POST   /:propertyId/block       (host, owner)
  DELETE /blocks/:blockId          (host, owner)

/bookings
  POST   /                        (guest)
  GET    /my                      (guest)
  GET    /host                    (host)
  GET    /:id                     (guest/host)
  POST   /:id/approve             (host)
  POST   /:id/decline             (host)
  POST   /:id/cancel              (guest)

/payments
  POST   /process                 (system)
  GET    /:bookingId              (guest)

/reviews
  POST   /property/:propertyId    (guest, after stay)
  GET    /property/:propertyId    (public)
  POST   /guest/:bookingId        (host)
  PUT    /:id                     (author)
  DELETE /:id                     (author/admin)

/users
  PUT    /profile                 (any)
  GET    /:id/public              (public)
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
| date-fns | Date manipulation |

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
rental-listing-marketplace/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── env.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── properties/
│   │   │   ├── calendar/
│   │   │   ├── bookings/
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
      POSTGRES_DB: rental_marketplace
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
      DATABASE_URL: postgres://postgres:postgres@postgres:5432/rental_marketplace
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
DATABASE_URL=postgres://postgres:postgres@localhost:5432/rental_marketplace

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
       ├── feature/properties
       ├── feature/calendar
       ├── feature/bookings
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
| **DB Lead** | Schema design, migrations, seed data, availability logic |
| **Backend Lead** | Auth, RBAC, middleware, API structure |
| **Backend Dev 1** | Properties, Calendar, Search modules |
| **Backend Dev 2** | Bookings, Payments, Reviews modules |
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
  "email": "host@test.com",
  "password": "Host123!",
  "name": "Priya Host",
  "role": "host"
}

// Response 201
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "host@test.com",
      "name": "Priya Host",
      "role": "host"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

#### POST /properties
```json
// Request (host)
{
  "title": "Beach House in Goa",
  "description": "Beautiful sea-facing property",
  "propertyTypeId": "uuid",
  "address": "123 Beach Road, Calangute",
  "city": "Goa",
  "state": "Goa",
  "country": "India",
  "zipCode": "403516",
  "pricePerNight": 3500.00,
  "maxGuests": 6,
  "bedrooms": 3,
  "bathrooms": 2,
  "beds": 4,
  "minNights": 2,
  "maxNights": 30,
  "cancellationPolicy": "moderate",
  "amenityIds": ["uuid1", "uuid2"]
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Beach House in Goa",
    "status": "draft"
  }
}
```

#### GET /properties?city=Goa&minPrice=1000&maxPrice=5000&guests=4&checkIn=2025-06-15&checkOut=2025-06-20&page=1&limit=20
```json
// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Beach House in Goa",
        "pricePerNight": 3500.00,
        "maxGuests": 6,
        "bedrooms": 3,
        "avgRating": 4.7,
        "reviewCount": 23,
        "photos": [{ "url": "/uploads/properties/img1.jpg" }],
        "host": { "name": "Priya Host", "avatar": "/uploads/avatars/priya.jpg" }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3
    }
  }
}
```

#### POST /bookings
```json
// Request (guest)
{
  "propertyId": "uuid",
  "checkIn": "2025-06-15",
  "checkOut": "2025-06-20",
  "guestsCount": 4
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending",
    "totalNights": 5,
    "totalPrice": 17500.00
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
| role | Required, enum: admin, host, guest |

#### Properties
| Field | Rules |
|-------|-------|
| title | Required, 5-255 chars |
| description | Optional, max 5000 chars |
| propertyTypeId | Required, valid UUID |
| address | Required, 10-500 chars |
| city | Required, 2-100 chars |
| country | Required, 2-100 chars |
| pricePerNight | Required, decimal, min 1 |
| maxGuests | Required, integer, min 1, max 20 |
| bedrooms | Required, integer, min 0 |
| bathrooms | Required, integer, min 0 |
| minNights | Optional, integer, min 1 |
| maxNights | Optional, integer, min 1 |

#### Bookings
| Field | Rules |
|-------|-------|
| propertyId | Required, valid UUID |
| checkIn | Required, date, must be today or future |
| checkOut | Required, date, must be after checkIn |
| guestsCount | Required, integer, min 1, max property.maxGuests |

---

## Auth Details

### JWT Payload Structure
```json
// Access Token
{
  "sub": "user-uuid",
  "email": "host@test.com",
  "role": "host",
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
│   │   ├── properties/
│   │   │   ├── properties.service.test.js
│   │   │   ├── properties.repository.test.js
│   │   │   └── properties.integration.test.js
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
| host@test.com | Host123! | host |
| host2@test.com | Host123! | host |
| guest@test.com | Guest123! | guest |

### Sample Seed Data
- 2 hosts with properties
- 8 properties across 4 cities (Goa, Mumbai, Jaipur, Manali)
- Property types and amenities seeded
- 5 bookings in various statuses
- 6 reviews across properties

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
| Property Photo | 5MB | jpg, png, webp |
| User Avatar | 2MB | jpg, png, webp |
