# PRD: Collaborative Task Management

## Overview
A full-stack collaborative task management tool built as a modular monolith using the PERN stack. Teams create workspaces, boards, and cards. Supports drag-and-drop, role-based access, activity logging, and real-time updates via WebSockets.

---

## Architecture
- **Pattern:** Modular Monolith
- **Modules:** Auth, Users, Workspaces, Boards, Columns, Cards, Labels, Activity, Notifications

---

## Phase 1: Foundation & Auth (Week 1-2)

### Sub-steps
1. Project scaffolding (Express + React + PostgreSQL)
2. Database setup with migrations
3. User registration/login with JWT
4. Role-based access (Admin, Member)
5. Profile management

### In Scope
- Email + password auth
- JWT access + refresh token flow
- Profile update (name, avatar, timezone)
- Password reset

### Out of Scope
- OAuth
- Email verification
- Two-factor auth
- SSO/SAML

---

## Phase 2: Workspaces & Teams (Week 2-3)

### Sub-steps
1. Workspace CRUD
2. Workspace member management (invite/remove)
3. Role-based permissions per workspace
4. Workspace settings
5. Workspace switching

### In Scope
- Create workspace (name, description, icon)
- Invite members by email
- Roles: Owner, Admin, Member
  - Owner: full control, delete workspace
  - Admin: manage members, settings
  - Member: create/edit cards, view boards
- Member list with roles
- Leave workspace

### Out of Scope
- Multi-workspace per user (single workspace per team)
- Workspace templates
- Guest/external collaborators
- Workspace billing

---

## Phase 3: Boards & Columns (Week 3-4)

### Sub-steps
1. Board CRUD within workspace
2. Board visibility (workspace-only for now)
3. Column CRUD with ordering
4. Default column templates
5. Board member assignment

### In Scope
- Create board (name, description)
- Board belongs to workspace
- Create columns (title, position)
- Reorder columns (drag-and-drop support)
- Default columns: To Do, In Progress, Done
- Column delete with card handling (move to first column)

### Out of Scope
- Board templates
- Cross-workspace boards
- Board archiving
- Swimlanes
- Sub-columns

---

## Phase 4: Cards & Details (Week 4-5)

### Sub-steps
1. Card CRUD within columns
2. Card ordering within/between columns
3. Card details (description, assignees, labels, due date)
4. Label management (colored tags)
5. Card search and filters

### In Scope
- Create card (title, description)
- Move card between columns (drag-and-drop)
- Reorder cards within column
- Assign multiple members to card
- Create labels (name + color) per workspace
- Attach labels to cards
- Set due date
- Filter cards: by assignee, label, due date, search text

### Out of Scope
- Card attachments/files
- Checklist/subtasks
- Card comments
- Card templates
- Recurring cards
- Time tracking

---

## Phase 5: Activity Log & Real-time (Week 5-6)

### Sub-steps
1. Activity log per card
2. Activity log per board
3. WebSocket connection setup
4. Real-time board updates
5. Real-time notifications

### In Scope
- Log all card mutations (create, move, edit, assign, label)
- Activity entry: action, user, timestamp, details
- Activity feed on card detail view
- Activity feed on board view
- WebSocket: broadcast card moves to all board viewers
- WebSocket: broadcast new cards
- In-app notification bell (unread count)

### Out of Scope
- Email notifications
- Push notifications
- Activity export
- Audit trail for admin compliance
- @mentions in cards

---

## Phase 6: Search & Filters (Week 6-7)

### Sub-steps
1. Global search across cards
2. Board-level filters
3. Saved filters/views
4. Keyboard shortcuts

### In Scope
- Search cards by title/description across workspace
- Filter board by: assignee, label, due date range
- Quick filters (my cards, overdue, due this week)
- Keyboard shortcuts: N (new card), / (search), Esc (close modal)

### Out of Scope
- Saved views/filters
- Custom fields
- Gantt view
- Calendar view
- Bulk operations

---

## Phase 7: Polish & Deployment (Week 7-8)

### Sub-steps
- Drag-and-drop polish (visual feedback, smooth animation)
- Error handling middleware
- Rate limiting
- Admin workspace dashboard
- Deployment

### In Scope
- DnD visual feedback (ghost, drop zones)
- Global error handler
- Rate limit on auth endpoints
- Admin view: all workspaces, members
- Responsive design (desktop-first)

### Out of Scope
- Mobile app
- Offline mode
- Dark mode
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
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  owner_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workspace Members
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Boards
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Columns
CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Labels
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,  -- hex code
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cards
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID REFERENCES columns(id) ON DELETE CASCADE,
  board_id UUID REFERENCES boards(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  due_date TIMESTAMP,
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Card Assignees
CREATE TABLE card_assignees (
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (card_id, user_id)
);

-- Card Labels
CREATE TABLE card_labels (
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, label_id)
);

-- Activity Log
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  action VARCHAR(50) NOT NULL,  -- created, moved, edited, assigned, labeled, etc.
  details JSONB,  -- flexible: { from_column: "To Do", to_column: "Done" }
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  type VARCHAR(50) NOT NULL,  -- card_assigned, card_moved, etc.
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_boards_workspace ON boards(workspace_id);
CREATE INDEX idx_columns_board ON columns(board_id);
CREATE INDEX idx_cards_column ON cards(column_id);
CREATE INDEX idx_cards_board ON cards(board_id);
CREATE INDEX idx_cards_position ON cards(position);
CREATE INDEX idx_card_assignees_card ON card_assignees(card_id);
CREATE INDEX idx_card_assignees_user ON card_assignees(user_id);
CREATE INDEX idx_activities_board ON activities(board_id);
CREATE INDEX idx_activities_card ON activities(card_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
```

---

## API Routes Structure

```
/auth
  POST   /register
  POST   /login
  POST   /refresh-token
  GET    /me

/workspaces
  POST   /                       (any user)
  GET    /me                     (any user)
  GET    /:id                     (member)
  PUT    /:id                     (owner/admin)
  DELETE /:id                     (owner)
  POST   /:id/invite             (owner/admin)
  GET    /:id/members             (member)
  DELETE /:id/members/:userId     (owner/admin)
  PUT    /:id/members/:userId/role (owner)

/boards
  POST   /                       (member)
  GET    /workspace/:workspaceId  (member)
  GET    /:id                     (member)
  PUT    /:id                     (owner/admin)
  DELETE /:id                     (owner)

/columns
  POST   /                       (member)
  GET    /board/:boardId          (member)
  PUT    /:id                     (member)
  DELETE /:id                     (owner/admin)
  PUT    /reorder                 (member)

/cards
  POST   /                       (member)
  GET    /column/:columnId        (member)
  GET    /:id                     (member)
  PUT    /:id                     (member)
  DELETE /:id                     (owner/admin)
  PUT    /move                    (member)
  PUT    /reorder                 (member)

/labels
  POST   /                       (member)
  GET    /workspace/:workspaceId  (member)
  PUT    /:id                     (member)
  DELETE /:id                     (owner/admin)

/cards/:cardId/assignees
  POST   /                        (member)
  GET    /                        (member)
  DELETE /:userId                  (member)

/cards/:cardId/labels
  POST   /                        (member)
  DELETE /:labelId                 (member)

/activity
  GET    /board/:boardId           (member)
  GET    /card/:cardId             (member)

/notifications
  GET    /me                       (any user)
  PUT    /:id/read                 (owner)
  PUT    /read-all                 (owner)
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
| ws | WebSocket server |
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
| @dnd-kit | Drag-and-drop |

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
collaborative-task-management/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── env.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── workspaces/
│   │   │   ├── boards/
│   │   │   ├── columns/
│   │   │   ├── cards/
│   │   │   ├── labels/
│   │   │   ├── activity/
│   │   │   └── notifications/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── rbac.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── websocket/
│   │   │   └── socket.js
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── app.js
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
      POSTGRES_DB: task_manager
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
      DATABASE_URL: postgres://postgres:postgres@postgres:5432/task_manager
      JWT_SECRET: dev-secret-key-change-in-prod
      JWT_REFRESH_SECRET: dev-refresh-secret-change-in-prod
      NODE_ENV: development
    volumes:
      - ./backend/src:/app/src
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
DATABASE_URL=postgres://postgres:postgres@localhost:5432/task_manager

# JWT
JWT_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=development

# WebSocket
WS_PORT=5001

# Frontend
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5001
```

---

## Development Workflow

### Git Branching Strategy
```
main (production-ready)
  └── develop (integration branch)
       ├── feature/auth
       ├── feature/workspaces
       ├── feature/boards
       ├── feature/cards
       ├── feature/activity
       └── feature/websocket
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
| **DB Lead** | Schema design, migrations, seed data, position/ordering logic |
| **Backend Lead** | Auth, RBAC, middleware, API structure |
| **Backend Dev 1** | Workspaces, Boards, Columns modules |
| **Backend Dev 2** | Cards, Labels, Activity, Notifications modules |
| **Frontend Lead** | React UI, DnD, WebSocket integration, state management |

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
  "email": "user@test.com",
  "password": "User123!",
  "name": "Ravi Kumar"
}

// Response 201
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@test.com",
      "name": "Ravi Kumar"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

#### POST /workspaces
```json
// Request
{
  "name": "Product Team",
  "description": "Product development board",
  "icon": "🚀"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Product Team",
    "ownerId": "uuid"
  }
}
```

#### POST /cards
```json
// Request
{
  "columnId": "uuid",
  "boardId": "uuid",
  "title": "Implement login page",
  "description": "Build the login UI with form validation",
  "dueDate": "2025-02-01T00:00:00Z"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Implement login page",
    "position": 0
  }
}
```

#### PUT /cards/move
```json
// Request
{
  "cardId": "uuid",
  "toColumnId": "uuid",
  "position": 2
}

// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "columnId": "uuid",
    "position": 2
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

#### Workspaces
| Field | Rules |
|-------|-------|
| name | Required, 3-100 chars |
| description | Optional, max 500 chars |
| icon | Optional, 1-10 chars (emoji) |

#### Cards
| Field | Rules |
|-------|-------|
| title | Required, 1-255 chars |
| description | Optional, max 5000 chars |
| columnId | Required, valid UUID |
| boardId | Required, valid UUID |
| dueDate | Optional, ISO 8601 date |
| assigneeIds | Optional, array of UUIDs |
| labelIds | Optional, array of UUIDs |

---

## Auth Details

### JWT Payload Structure
```json
// Access Token
{
  "sub": "user-uuid",
  "email": "user@test.com",
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
│   │   ├── cards/
│   │   │   ├── cards.service.test.js
│   │   │   └── cards.integration.test.js
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
| owner@test.com | Owner123! | workspace owner |
| member@test.com | Member123! | workspace member |

### Sample Seed Data
- 1 workspace with owner + 2 members
- 2 boards (Sprint Board, Backlog)
- 4 columns per board (To Do, In Progress, Review, Done)
- 10 cards with labels and assignees
- 5 activity log entries
- 3 labels (Bug, Feature, Urgent)

---

## File Storage

### Local Development
- No file uploads in MVP
- Avatar URLs stored as external links

### Production (Cloudinary)
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Upload Limits
| Type | Max Size | Allowed Formats |
|------|----------|-----------------|
| User Avatar | 2MB | jpg, png, webp |
