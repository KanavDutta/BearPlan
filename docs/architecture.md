# BearPlan Architecture

## System Overview

BearPlan follows a **client-server architecture** with a React frontend and Node.js backend.

```
┌─────────────────┐
│  React Frontend │
│   (TypeScript)  │
└────────┬────────┘
         │ REST API
         │
┌────────▼────────┐
│  Express API    │
│   (Node.js)     │
└────────┬────────┘
         │
┌────────▼────────┐
│   PostgreSQL    │
│    Database     │
└─────────────────┘
```

---

## Frontend

**Tech**: React + TypeScript + Vite

**Key components:**
- `CourseList`: display and manage courses
- `DeliverableForm`: add/edit assignments, exams, etc.
- `WeeklyPlan`: display generated schedule
- `ProgressTracker`: mark sessions complete/missed
- `GradeProjection`: show current and projected grades

**State management**: React Context or Zustand

---

## Backend

**Tech**: Node.js + Express + TypeScript

**API endpoints:**

```
POST   /api/courses              Create course
GET    /api/courses              List all courses
PUT    /api/courses/:id          Update course
DELETE /api/courses/:id          Delete course

POST   /api/deliverables         Create deliverable
GET    /api/deliverables         List deliverables (filter by course)
PUT    /api/deliverables/:id     Update deliverable
DELETE /api/deliverables/:id     Delete deliverable

POST   /api/availability         Set weekly availability
GET    /api/availability         Get current availability

GET    /api/schedule             Generate weekly plan
POST   /api/progress             Update task progress (triggers replan)

GET    /api/grades/:courseId     Get grade projection for course
```

**Core modules:**
- `scheduler.ts`: priority calculation and scheduling logic
- `gradeCalculator.ts`: weighted grade computation
- `replanner.ts`: handles progress updates and reschedules

---

## Database Schema

**courses**
```sql
id          SERIAL PRIMARY KEY
user_id     INTEGER NOT NULL
name        VARCHAR(100) NOT NULL
code        VARCHAR(20)
created_at  TIMESTAMP DEFAULT NOW()
```

**deliverables**
```sql
id              SERIAL PRIMARY KEY
course_id       INTEGER REFERENCES courses(id)
name            VARCHAR(200) NOT NULL
type            VARCHAR(50)  -- 'assignment', 'exam', 'lab', etc.
due_date        DATE NOT NULL
grade_weight    DECIMAL(5,2) NOT NULL
estimated_hours DECIMAL(5,2) NOT NULL
hours_completed DECIMAL(5,2) DEFAULT 0
score           DECIMAL(5,2) -- actual grade received (nullable)
created_at      TIMESTAMP DEFAULT NOW()
```

**availability**
```sql
id          SERIAL PRIMARY KEY
user_id     INTEGER NOT NULL
day_of_week INTEGER NOT NULL  -- 0=Sun, 1=Mon, ..., 6=Sat
hours       DECIMAL(4,2) NOT NULL
```

**schedule_sessions** (generated plan)
```sql
id              SERIAL PRIMARY KEY
deliverable_id  INTEGER REFERENCES deliverables(id)
scheduled_date  DATE NOT NULL
allocated_hours DECIMAL(4,2) NOT NULL
status          VARCHAR(20) DEFAULT 'planned'  -- 'planned', 'completed', 'missed'
created_at      TIMESTAMP DEFAULT NOW()
```

---

## Scheduling Flow

1. **User updates progress** → `POST /api/progress`
2. Backend updates `hours_completed` in database
3. Backend triggers replanner
4. Replanner:
   - Fetches all incomplete deliverables
   - Fetches weekly availability
   - Runs scheduling algorithm
   - Clears future schedule sessions
   - Inserts new schedule sessions
5. Frontend fetches updated schedule → `GET /api/schedule`

---

## Deployment

**Frontend**: Vercel or Netlify  
**Backend**: Railway, Render, or Fly.io  
**Database**: Supabase (PostgreSQL) or Railway

---

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Zod
- Rate limiting on API endpoints
- CORS configuration for frontend origin

---

## Future Considerations

- **Real-time updates**: WebSocket for live schedule changes
- **Caching**: Redis for frequently accessed schedules
- **Background jobs**: Cron jobs for daily schedule regeneration
- **Analytics**: Track user behavior and algorithm effectiveness
