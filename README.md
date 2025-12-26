# 🐻 BearPlan

**Dynamic workload planning for students**

BearPlan is a web app that generates and continuously replans weekly study schedules using deadline- and priority-based optimization.

---

## What it does

BearPlan helps students turn course requirements into a realistic, dynamic weekly study plan.

Instead of simply tracking deadlines, BearPlan helps students decide **what to work on and when**, based on:

- Assignment and exam deadlines
- Grade weight (impact on final grade)
- Estimated effort (hours required)
- Personal weekly availability

BearPlan continuously adapts the plan when progress changes, helping students stay on track even when things don't go as planned.

---

## How it works

### 1. Model your courses

Add courses (e.g., CMPUT 301, STAT 252) and break them down into deliverables:

- Assignments
- Labs
- Midterms
- Finals
- Revision tasks

Each deliverable includes:
- Due date
- Grade weight (%)
- Estimated hours of work
- Progress (hours completed)

### 2. Weekly availability

Specify how many hours you can realistically study each day or week. This becomes a hard constraint — BearPlan will never schedule more work than available time.

### 3. Scheduling engine

BearPlan generates a weekly plan using a priority-based scheduling algorithm.

Each task receives a **priority score** based on:
- **Urgency**: closer deadlines are prioritized
- **Impact**: higher grade weight matters more
- **Effort remaining**: larger unfinished tasks need earlier attention

The planner then:
- Iterates through each day of the week
- Fills available study hours with the highest-priority tasks
- Produces a clear daily plan (e.g., "Tue: 1.5h CMPUT 301 A1")

### 4. Progress tracking & automatic replanning

Mark planned work sessions as:
- Completed
- Partially completed
- Missed

When progress changes:
- Remaining work is recalculated
- Priorities are updated
- The schedule is automatically regenerated for remaining days

### 5. Grade projection

Based on completed work and entered scores, BearPlan computes:
- Current weighted grade
- Projected final grade
- Required scores on remaining components to reach a target grade

---

## What makes BearPlan different

Most student tools are static planners or grade calculators.

BearPlan treats studying as a **scheduling and optimization problem**, combining:
- Constraint-based planning
- Priority scoring
- Dynamic replanning
- **Weekly health insights** (workload analysis, deadline risk detection)
- **"What If?" grade simulations** (required scores for target grades)
- **Visual progress tracking** with completion bars

It focuses on **decision-making**, not just tracking.

---

## Key Features

✨ **Intelligent Scheduling**
- Priority-based algorithm: `(urgency × 0.5) + (impact × 0.3) + (effort × 0.2)`
- Respects your weekly availability constraints
- Automatic replanning when progress changes

📊 **Weekly Health Insights**
- Workload status (Balanced/Heavy/Light)
- Deadline risk detection
- Recommended focus days
- Heaviest course identification

🎯 **Grade Projections**
- Real-time weighted grade calculations
- Projected final grades
- "What If?" calculator showing required scores
- Actionable study recommendations

📈 **Visual Progress**
- Completion bars on scheduled sessions
- Color-coded urgency indicators
- Status tracking (completed/partial/missed)

---

## Example flow

1. Add CMPUT 301
2. Add "Assignment 1 (10%, due Jan 20, 8h)"
3. Set availability: 2h weekdays, 4h Saturday
4. BearPlan generates a weekly plan
5. You miss a study session → BearPlan automatically redistributes the work

---

## Tech stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Scheduling**: Custom priority-based algorithm

---

## Getting started

```bash
# Clone the repo
git clone https://github.com/yourusername/bearplan.git
cd bearplan

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## Roadmap

**v1 (MVP)**
- Course and deliverable management
- Weekly availability settings
- Basic priority-based scheduling
- Manual progress tracking

**v2**
- Grade projection and "what-if" scenarios
- Calendar integration (Google Calendar, iCal)
- Mobile app

**v3**
- Study session reminders
- Analytics and insights
- Collaborative study groups

---

## Contributing

Contributions welcome! Open an issue or submit a PR.

---

## License

MIT
