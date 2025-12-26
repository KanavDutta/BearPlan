import { query } from '../utils/db';
import { generateSchedule, saveSchedule } from './schedulerService';

interface ProgressUpdate {
  session_id: number;
  status: 'completed' | 'partial' | 'missed';
  actual_hours?: number;
}

export async function updateProgressAndReplan(update: ProgressUpdate): Promise<void> {
  // Get the session details
  const sessionResult = await query(
    'SELECT * FROM schedule_sessions WHERE id = $1',
    [update.session_id]
  );
  
  if (sessionResult.rows.length === 0) {
    throw new Error('Session not found');
  }
  
  const session = sessionResult.rows[0];
  
  // Calculate actual hours based on status
  let actualHours = 0;
  if (update.status === 'completed') {
    actualHours = parseFloat(session.allocated_hours);
  } else if (update.status === 'partial') {
    actualHours = update.actual_hours || 0;
  } else if (update.status === 'missed') {
    actualHours = 0;
  }
  
  // Update the session status
  await query(
    `UPDATE schedule_sessions 
     SET status = $1, actual_hours = $2, updated_at = NOW() 
     WHERE id = $3`,
    [update.status, actualHours, update.session_id]
  );
  
  // Update the deliverable's hours_completed
  await query(
    `UPDATE deliverables 
     SET hours_completed = hours_completed + $1, updated_at = NOW() 
     WHERE id = $2`,
    [actualHours, session.deliverable_id]
  );
  
  // Delete all future schedule sessions (from tomorrow onwards)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  await query(
    'DELETE FROM schedule_sessions WHERE scheduled_date >= $1 AND status = $2',
    [tomorrow.toISOString().split('T')[0], 'planned']
  );
  
  // Regenerate schedule from tomorrow
  const newSchedule = await generateSchedule(tomorrow);
  await saveSchedule(newSchedule);
}

export async function getProgressHistory(deliverableId: number) {
  const result = await query(
    `SELECT 
      ss.id,
      ss.scheduled_date,
      ss.allocated_hours,
      ss.status,
      ss.actual_hours,
      ss.updated_at
     FROM schedule_sessions ss
     WHERE ss.deliverable_id = $1
       AND ss.status != 'planned'
     ORDER BY ss.scheduled_date DESC`,
    [deliverableId]
  );
  
  return result.rows;
}
