import { Router, Request, Response, NextFunction } from 'express';
import { WeeklyAvailabilitySchema } from '../models/availability';
import { query, getClient } from '../utils/db';

const router = Router();
const USER_ID = 1;

// POST /api/availability - Set weekly availability (upsert)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const client = await getClient();
  
  try {
    const validatedData = WeeklyAvailabilitySchema.parse(req.body);
    
    await client.query('BEGIN');
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const results = [];
    
    for (let i = 0; i < days.length; i++) {
      const dayName = days[i] as keyof typeof validatedData;
      const hours = validatedData[dayName];
      
      const result = await client.query(
        `INSERT INTO availability (user_id, day_of_week, hours) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (user_id, day_of_week) 
         DO UPDATE SET hours = $3, updated_at = NOW() 
         RETURNING *`,
        [USER_ID, i, hours]
      );
      
      results.push(result.rows[0]);
    }
    
    await client.query('COMMIT');
    
    // Convert to friendly format
    const availability: any = {};
    results.forEach((record) => {
      availability[days[record.day_of_week]] = parseFloat(record.hours);
    });
    
    res.json(availability);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// GET /api/availability - Get weekly availability
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      'SELECT * FROM availability WHERE user_id = $1 ORDER BY day_of_week',
      [USER_ID]
    );
    
    if (result.rows.length === 0) {
      res.json({
        sunday: 0,
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0
      });
      return;
    }
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const availability: any = {};
    
    result.rows.forEach((record) => {
      availability[days[record.day_of_week]] = parseFloat(record.hours);
    });
    
    // Fill in missing days with 0
    days.forEach(day => {
      if (availability[day] === undefined) {
        availability[day] = 0;
      }
    });
    
    res.json(availability);
  } catch (error) {
    next(error);
  }
});

export default router;
