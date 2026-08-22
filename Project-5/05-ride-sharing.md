# PRD: Peer-to-Peer Ride Sharing

## Overview
A full-stack peer-to-peer ride sharing platform built as a modular monolith using the PERN stack. Drivers post rides with routes, seats, and pricing. Riders search, book, and complete trips. Includes geo-based search, seat management, and bidirectional ratings.

---

## Architecture
- **Pattern:** Modular Monolith
- **Modules:** Auth, Users, Drivers, Vehicles, Rides, Bookings, Payments, Ratings, Search, Wallet

---

## Phase 1: Foundation & Auth (Week 1-2)

### Sub-steps
1. Project scaffolding (Express + React + PostgreSQL)
2. Database setup with migrations
3. User registration/login with JWT
4. Role switching (Rider ↔ Driver)
5. Profile management

### In Scope
- Email + password auth
- JWT access + refresh token flow
- Single user can be both rider and driver
- Profile: name, phone, avatar
- Password reset

### Out of Scope
- OAuth
- Email verification
- Two-factor auth
- Driver license verification

---

## Phase 2: Driver & Vehicle Setup (Week 2-3)

### Sub-steps
1. Driver profile creation
2. Vehicle CRUD (make, model, year, color, plate)
3. Vehicle photo upload
4. Driver status management
5. Driver verification shell

### In Scope
- Add vehicle (make, model, year, color, license plate, seat count)
- One active vehicle per driver
- Vehicle photos (front, interior)
- Driver status: Offline, Online, On Trip
- Admin can approve/suspend drivers

### Out of Scope
- Multi-vehicle per driver
- Vehicle insurance docs
- License upload
- Background check integration

---

## Phase 3: Ride Creation & Search (Week 3-4)

### Sub-steps
1. Ride creation (origin, destination, route, datetime, seats, price)
2. Route input with from/to locations
3. Seat availability tracking
4. Ride search by origin/destination/date
5. Ride listing with filters

### In Scope
- Driver creates ride:
  - Origin (address + lat/lng)
  - Destination (address + lat/lung)
  - Departure date/time
  - Available seats
  - Price per seat
  - Optional: route waypoints, notes
- Rider searches:
  - By origin city/area
  - By destination city/area
  - By date
  - By seat count
- Ride statuses: Active, Full, Completed, Cancelled

### Out of Scope
- Interactive map route builder
- Google Maps integration
- Real-time route optimization
- Recurring rides
- Multi-stop rides

---

## Phase 4: Bookings & Trip Flow (Week 4-5)

### Sub-steps
1. Ride booking request
2. Driver accept/decline
3. Seat decrement on confirmation
4. Trip lifecycle management
5. Trip completion flow

### In Scope
- Rider sends booking request (seat count, message)
- Driver approves or declines
- On approve: seats decremented atomically
- Trip lifecycle:
  - Requested → Accepted → In Progress → Completed
  - Requested → Declined
  - Accepted → Cancelled (by either party)
- Trip start/complete buttons
- Trip history for both driver and rider

### Out of Scope
- Instant booking
- Group booking
- Ride sharing (multiple riders per trip)
- Real-time location tracking
- SOS/emergency button

---

## Phase 5: Payments & Wallet (Week 5-6)

### Sub-steps
1. Payment collection on booking
2. Simulated payment processing
3. Driver wallet/earnings
4. Wallet withdrawal (simulated)
5. Transaction history

### In Scope
- Rider pays at booking (simulated)
- Payment held until trip completed
- On trip completion: funds move to driver wallet
- Driver wallet balance
- Transaction history (ride earnings, withdrawals)
- Trip cancellation refund logic

### Out of Scope
- Real payment gateway
- Bank transfer integration
- Split payments
- Promo codes
- Ride fare estimation

---

## Phase 6: Ratings & Reviews (Week 6-7)

### Sub-steps
1. Bidirectional rating system
2. Post-trip rating flow
3. Rating aggregation
4. Driver/rider profiles with ratings
5. Rating display rules

### In Scope
- After trip: rider rates driver AND driver rates rider
- 1-5 star rating + optional text
- Average rating on profiles
- Rating only allowed after completed trip
- One rating per trip per party

### Out of Scope
- Rating responses
- Rating moderation
- Top-rated badges
- Rating export

---

## Phase 7: Search & Polish (Week 7-8)

### Sub-steps
1. Advanced search with date + geo
2. Recent/saved searches
3. Driver dashboard (earnings, trips)
4. Rider dashboard (trips, upcoming)
5. Admin dashboard
6. Deployment

### In Scope
- Search with combined filters (origin, destination, date, seats)
- Sort by: price, departure time, rating
- Driver dashboard: total earnings, trip count, rating
- Rider dashboard: upcoming rides, past rides
- Admin: users, drivers, rides overview
- Global error handling, rate limiting

### Out of Scope
- Saved/favorite routes
- Push notifications
- In-app messaging
- Surge pricing
- Ride recommendations

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Driver Profiles
CREATE TABLE driver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('offline', 'online', 'on_trip')),
  license_number VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  total_trips INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES driver_profiles(id) NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(50) NOT NULL,
  license_plate VARCHAR(20) NOT NULL,
  seat_count INTEGER NOT NULL CHECK (seat_count >= 2 AND seat_count <= 8),
  photo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rides
CREATE TABLE rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES driver_profiles(id) NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
  origin_address TEXT NOT NULL,
  origin_lat DECIMAL(10,8) NOT NULL,
  origin_lng DECIMAL(11,8) NOT NULL,
  origin_city VARCHAR(100) NOT NULL,
  destination_address TEXT NOT NULL,
  destination_lat DECIMAL(10,8) NOT NULL,
  destination_lng DECIMAL(11,8) NOT NULL,
  destination_city VARCHAR(100) NOT NULL,
  departure_at TIMESTAMP NOT NULL,
  total_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  price_per_seat DECIMAL(10,2) NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'full', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_seats CHECK (available_seats >= 0 AND available_seats <= total_seats)
);

-- Ride Bookings
CREATE TABLE ride_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) NOT NULL,
  rider_id UUID REFERENCES users(id) NOT NULL,
  seats_booked INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'declined', 'cancelled', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES ride_bookings(id) NOT NULL,
  rider_id UUID REFERENCES users(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Driver Wallet
CREATE TABLE wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES driver_profiles(id) NOT NULL UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(10,2) DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallet Transactions
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallet(id) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  ride_id UUID REFERENCES rides(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ratings
CREATE TABLE ride_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) NOT NULL,
  booking_id UUID REFERENCES ride_bookings(id) NOT NULL,
  from_user_id UUID REFERENCES users(id) NOT NULL,
  to_user_id UUID REFERENCES users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(booking_id, from_user_id)
);

-- Recent Searches
CREATE TABLE recent_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  search_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_driver_profiles_user ON driver_profiles(user_id);
CREATE INDEX idx_vehicles_driver ON vehicles(driver_id);
CREATE INDEX idx_rides_driver ON rides(driver_id);
CREATE INDEX idx_rides_origin_city ON rides(origin_city);
CREATE INDEX idx_rides_destination_city ON rides(destination_city);
CREATE INDEX idx_rides_departure ON rides(departure_at);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_search ON rides(origin_city, destination_city, departure_at, status);
CREATE INDEX idx_ride_bookings_ride ON ride_bookings(ride_id);
CREATE INDEX idx_ride_bookings_rider ON ride_bookings(rider_id);
CREATE INDEX idx_ride_ratings_ride ON ride_ratings(ride_id);
CREATE INDEX idx_wallet_driver ON wallet(driver_id);
CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
```

---

## API Routes Structure

```
/auth
  POST   /register
  POST   /login
  POST   /refresh-token
  GET    /me

/drivers
  POST   /register               (user → driver)
  GET    /me                      (driver)
  PUT    /status                  (driver)
  GET    /:id/public              (public)

/vehicles
  POST   /                        (driver)
  GET    /me                      (driver)
  PUT    /:id                     (driver, owner)
  DELETE /:id                     (driver, owner)

/rides
  POST   /                        (driver)
  GET    /search                  (public, with filters)
  GET    /:id                     (public)
  PUT    /:id                     (driver, owner)
  DELETE /:id                     (driver, owner)
  GET    /my                      (driver)

/bookings
  POST   /                        (rider)
  GET    /my                      (rider)
  GET    /driver                  (driver)
  GET    /:id                     (rider/driver)
  POST   /:id/accept              (driver)
  POST   /:id/decline             (driver)
  POST   /:id/cancel              (rider/driver)
  POST   /:id/start               (driver)
  POST   /:id/complete            (driver)

/payments
  POST   /process                 (system)
  GET    /:bookingId              (rider)

/wallet
  GET    /me                      (driver)
  GET    /transactions            (driver)
  POST   /withdraw                (driver)

/ratings
  POST   /                        (rider/driver, after trip)
  GET    /user/:userId            (public)
  GET    /ride/:rideId            (public)

/recent-searches
  GET    /me                      (rider)
  POST   /                        (rider)
  DELETE /:id                     (rider)
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
ride-sharing/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── env.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── drivers/
│   │   │   ├── vehicles/
│   │   │   ├── rides/
│   │   │   ├── bookings/
│   │   │   ├── payments/
│   │   │   ├── wallet/
│   │   │   ├── ratings/
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
      POSTGRES_DB: ride_sharing
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
      DATABASE_URL: postgres://postgres:postgres@postgres:5432/ride_sharing
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
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ride_sharing

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
       ├── feature/drivers
       ├── feature/rides
       ├── feature/bookings
       ├── feature/wallet
       └── feature/ratings
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
| **DB Lead** | Schema design, migrations, seed data, geo queries |
| **Backend Lead** | Auth, RBAC, middleware, API structure |
| **Backend Dev 1** | Drivers, Vehicles, Rides modules |
| **Backend Dev 2** | Bookings, Payments, Wallet, Ratings modules |
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
  "email": "driver@test.com",
  "password": "Driver123!",
  "name": "Amit Driver",
  "phone": "+91-9876543210"
}

// Response 201
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "driver@test.com",
      "name": "Amit Driver",
      "phone": "+91-9876543210"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

#### POST /drivers/register
```json
// Request (user → driver)
{
  "licenseNumber": "DL-1234567890"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "offline",
    "isVerified": false
  }
}
```

#### POST /vehicles
```json
// Request (driver)
{
  "make": "Maruti Suzuki",
  "model": "Swift",
  "year": 2022,
  "color": "White",
  "licensePlate": "MH-02-AB-1234",
  "seatCount": 4
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "make": "Maruti Suzuki",
    "model": "Swift",
    "isActive": true
  }
}
```

#### POST /rides
```json
// Request (driver)
{
  "originAddress": "Andheri West, Mumbai",
  "originLat": 19.1364,
  "originLng": 72.8296,
  "originCity": "Mumbai",
  "destinationAddress": "Pune Railway Station",
  "destinationLat": 18.5286,
  "destinationLng": 73.8745,
  "destinationCity": "Pune",
  "departureAt": "2025-06-20T08:00:00Z",
  "totalSeats": 3,
  "pricePerSeat": 450.00,
  "notes": "AC car, luggage space available"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "active",
    "availableSeats": 3
  }
}
```

#### GET /rides/search?origin=Mumbai&destination=Pune&date=2025-06-20&seats=1
```json
// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "originAddress": "Andheri West, Mumbai",
        "destinationAddress": "Pune Railway Station",
        "departureAt": "2025-06-20T08:00:00Z",
        "availableSeats": 3,
        "pricePerSeat": 450.00,
        "driver": {
          "name": "Amit Driver",
          "avgRating": 4.8,
          "totalTrips": 45
        },
        "vehicle": {
          "make": "Maruti Suzuki",
          "model": "Swift",
          "color": "White"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1
    }
  }
}
```

#### POST /bookings
```json
// Request (rider)
{
  "rideId": "uuid",
  "seatsBooked": 1,
  "message": "Please share pickup point"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "requested",
    "totalAmount": 450.00
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
| phone | Optional, valid phone format |

#### Vehicles
| Field | Rules |
|-------|-------|
| make | Required, 2-100 chars |
| model | Required, 2-100 chars |
| year | Required, integer, 2000-current year |
| color | Required, 2-50 chars |
| licensePlate | Required, 2-20 chars |
| seatCount | Required, integer, min 2, max 8 |

#### Rides
| Field | Rules |
|-------|-------|
| originAddress | Required, 5-500 chars |
| originLat | Required, decimal (-90 to 90) |
| originLng | Required, decimal (-180 to 180) |
| originCity | Required, 2-100 chars |
| destinationAddress | Required, 5-500 chars |
| destinationLat | Required, decimal (-90 to 90) |
| destinationLng | Required, decimal (-180 to 180) |
| destinationCity | Required, 2-100 chars |
| departureAt | Required, ISO 8601, must be future |
| totalSeats | Required, integer, min 1, max 7 |
| pricePerSeat | Required, decimal, min 1 |

#### Bookings
| Field | Rules |
|-------|-------|
| rideId | Required, valid UUID |
| seatsBooked | Required, integer, min 1, max availableSeats |
| message | Optional, max 500 chars |

---

## Auth Details

### JWT Payload Structure
```json
// Access Token
{
  "sub": "user-uuid",
  "email": "driver@test.com",
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
│   │   ├── rides/
│   │   │   ├── rides.service.test.js
│   │   │   ├── rides.repository.test.js
│   │   │   └── rides.integration.test.js
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
| driver@test.com | Driver123! | driver |
| driver2@test.com | Driver123! | driver |
| rider@test.com | Rider123! | rider |

### Sample Seed Data
- 2 drivers with vehicles
- 5 riders
- 8 rides across 3 city pairs (Mumbai-Pune, Delhi-Jaipur, Bangalore-Chennai)
- 6 bookings in various statuses
- 4 completed trips with ratings
- Wallets for drivers with sample earnings

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
| Vehicle Photo | 5MB | jpg, png, webp |
| User Avatar | 2MB | jpg, png, webp |
