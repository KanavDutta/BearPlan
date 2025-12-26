import { query } from '../utils/db';

interface Deliverable {
  id: number;
  course_id: number;
  name: string;
  due_date: string;
  grade_weight: number;
  estimated_hours: number;
  hours_completed: number;
  hours_remaining: number;
}

interface WeeklyAvailability {
  [key: number]: number; // day_of_week -> hours
}

interface ScheduleSession {
  deliverable_id: number;
  scheduled_date: string;
  allocated_hours: number;
}

// Calculate priority score for a deliverable
function calculatePriority(deliverable: Deliverable, currentDate: Date): number {
  const dueDate = new Date(deliverable.due_date);
  const daysUntilDue = Math.max(0, Math.floor((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Urgency: closer deadlines get higher priority
  const urgencyScore = 1 / (daysUntilDue + 1);
  
  // Impact: higher grade weight = more important
  const impactScore = deliverable.grade_weight / 100;
  
  // Effort: more remaining work needs earlier attention
  const effortScore = deliverable.hours_remaining / deliverable.estimated_hours;
  
  // Weighted formula
  const priority = (urgencyScore * 0.5) + (impactScore * 0.3) + (effortScore * 0.2);
  
  return priority;
}

// Generate weekly schedule
export async function generateSchedule(startDate: Date): Promise<ScheduleSession[]> {
  const USER_ID = 1;
  
  // Get all incomplete deliverables with future due dates
  const deliverableResult = await query(
    `SELECT id, course_id, name, due_date, grade_weight, estimated_hours, hours_completed,
            (estimated_hours - hours_completed) as hours_remaining
     FROM deliverables 
     WHERE hours_completed < estimated_hours 
       AND due_date >= $1
       AND course_id IN (SELECT id FROM courses WHERE user_id = $2)
     ORDER BY due_date ASC`,
    [startDate.toISOString().split('T')[0], USER_ID]
  );
  
  const deliverables: Deliverable[] = deliverableResult.rows.map(row => ({
    ...row,
    hours_remaining: parseFloat(row.hours_remaining)
  }));
  
  if (deliverables.length === 0) {
    return [];
  }
  
  // Get weekly availability
  const availabilityResult = await query(
    'SELECT day_of_week, hours FROM availability WHERE user_id = $1 ORDER BY day_of_week',
    [USER_ID]
  );
  
  if (availabilityResult.rows.length === 0) {
    throw new Error('Please set your weekly availability first');
  }
  
  const availability: WeeklyAvailability = {};
  availabilityResult.rows.forEach(row => {
    availability[row.day_of_week] = parseFloat(row.hours);
  });
  
  // Calculate priorities for all deliverables
  const prioritizedDeliverables = deliverables
    .map(d => ({
      ...d,
      priority: calculatePriority(d, startDate)
    }))
    .sort((a, b) => b.priority - a.priority); // Sort by priority descending
  
  // Generate schedule for the week (7 days)
  const schedule: ScheduleSession[] = [];
  const workingDeliverables = prioritizedDeliverables.map(d => ({ ...d }));
  
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);
    const dayOfWeek = currentDate.getDay();
    
    let availableHours = availability[dayOfWeek] || 0;
    
    // Allocate hours to highest priority tasks
    for (const deliverable of workingDeliverables) {
      if (availableHours <= 0) break;
      if (deliverable.hours_remaining <= 0) continue;
      
      // Check if due date has passed
      const dueDate = new Date(deliverable.due_date);
      if (currentDate > dueDate) continue;
      
      // Allocate hours (either all remaining or what's available)
      const hoursToAllocate = Math.min(deliverable.hours_remaining, availableHours);
      
      schedule.push({
        deliverable_id: deliverable.id,
        scheduled_date: currentDate.toISOString().split('T')[0],
        allocated_hours: hoursToAllocate
      });
      
      deliverable.hours_remaining -= hoursToAllocate;
      availableHours -= hoursToAllocate;
    }
  }
  
  return schedule;
}

// Save schedule to database
export async function saveSchedule(sessions: ScheduleSession[]): Promise<void> {
  if (sessions.length === 0) return;
  
  // Clear existing future schedule
  const today = new Date().toISOString().split('T')[0];
  await query(
    'DELETE FROM schedule_sessions WHERE scheduled_date >= $1',
    [today]
  );
  
  // Insert new schedule
  for (const session of sessions) {
    await query(
      `INSERT INTO schedule_sessions (deliverable_id, scheduled_date, allocated_hours, status)
       VALUES ($1, $2, $3, 'planned')`,
      [session.deliverable_id, session.scheduled_date, session.allocated_hours]
    );
  }
}
