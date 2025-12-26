# BearPlan Scheduling Algorithm

## Overview

BearPlan uses a **priority-based greedy scheduling algorithm** to generate weekly study plans.

The algorithm respects hard constraints (available hours) while optimizing for urgency, impact, and effort distribution.

---

## Priority Score Formula

Each task receives a priority score:

```
priority = (urgency_score × w1) + (impact_score × w2) + (effort_score × w3)
```

### Components

**1. Urgency Score**
```
urgency_score = 1 / (days_until_due + 1)
```
- Tasks due sooner get higher scores
- The `+1` prevents division by zero for tasks due today

**2. Impact Score**
```
impact_score = grade_weight / 100
```
- Normalized grade weight (0 to 1)
- Higher weight = higher priority

**3. Effort Score**
```
effort_score = hours_remaining / total_estimated_hours
```
- Represents how much work is left
- Larger unfinished tasks get scheduled earlier

### Weights

Default weights (tunable):
```
w1 = 0.5  (urgency)
w2 = 0.3  (impact)
w3 = 0.2  (effort)
```

---

## Scheduling Process

### Input
- List of tasks with: `{due_date, grade_weight, hours_remaining}`
- Weekly availability: `{day: hours_available}`

### Algorithm

```
1. Calculate priority score for all tasks
2. Sort tasks by priority (descending)
3. For each day in the week:
     a. Get available hours for that day
     b. While hours remain:
          - Select highest-priority task
          - Allocate min(hours_remaining, available_hours) to task
          - Update task hours_remaining
          - If task complete, remove from list
     c. Move to next day
4. Return weekly schedule
```

### Constraints

- Never exceed daily available hours
- Tasks cannot be scheduled after their due date
- Minimum allocation per session: 0.5 hours (configurable)

---

## Replanning

When progress changes (completed, missed, or partial):

1. Recalculate `hours_remaining` for affected tasks
2. Recompute priority scores
3. Clear future schedule (keep past as history)
4. Re-run scheduling algorithm from current day forward

---

## Example

**Tasks:**
- A1: due in 3 days, 10% weight, 6h remaining
- A2: due in 7 days, 15% weight, 8h remaining
- Midterm prep: due in 5 days, 25% weight, 10h remaining

**Availability:**
- Mon-Fri: 2h/day
- Sat-Sun: 4h/day

**Priority scores:**
```
A1:       (1/4 × 0.5) + (0.10 × 0.3) + (1.0 × 0.2) = 0.355
A2:       (1/8 × 0.5) + (0.15 × 0.3) + (1.0 × 0.2) = 0.308
Midterm:  (1/6 × 0.5) + (0.25 × 0.3) + (1.0 × 0.2) = 0.358
```

**Schedule:**
- Mon: 2h Midterm prep
- Tue: 2h Midterm prep
- Wed: 2h Midterm prep
- Thu: 2h Midterm prep
- Fri: 2h Midterm prep (complete), then start A1
- Sat: 4h A1 (complete), then start A2
- Sun: 4h A2

---

## Future Enhancements

- **Machine learning**: learn from user behavior to adjust weights
- **Break time**: enforce minimum breaks between sessions
- **Task dependencies**: some tasks must be done before others
- **Difficulty adjustment**: factor in task complexity, not just hours
