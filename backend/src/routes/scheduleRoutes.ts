import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../utils/db';
import { generateSchedule, saveSchedule } from '../services/schedulerService';

const router = Router();

// POST /api/schedule/generate - Generate and save a new schedule
router.post('/generate', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const schedule = await generateSchedule(startDate);
    await saveSchedule(schedule);
    
    res.json({ 
      message: 'Schedule generated successfully',
      sessions: schedule.length 
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/schedule - Get current week's schedule
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string)
      : new Date();
    
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    
    const result = await query(
      `SELECT 
        ss.id,
        ss.deliverable_id,
        ss.scheduled_date,
        ss.allocated_hours,
        ss.status,
        ss.actual_hours,
        d.name as deliverable_name,
        d.type as deliverable_type,
        c.name as course_name,
        c.code as course_code
       FROM schedule_sessions ss
       JOIN deliverables d ON ss.deliverable_id = d.id
       JOIN courses c ON d.course_id = c.id
       WHERE ss.scheduled_date >= $1 AND ss.scheduled_date < $2
       ORDER BY ss.scheduled_date ASC, c.name ASC`,
      [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/schedule/summary - Get weekly summary
router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string)
      : new Date();
    
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    
    const result = await query(
      `SELECT 
        scheduled_date,
        SUM(allocated_hours) as total_hours,
        COUNT(*) as session_count
       FROM schedule_sessions
       WHERE scheduled_date >= $1 AND scheduled_date < $2
       GROUP BY scheduled_date
       ORDER BY scheduled_date ASC`,
      [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
