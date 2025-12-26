import { Router, Request, Response, NextFunction } from 'express';
import { DeliverableInputSchema, DeliverableUpdateSchema } from '../models/deliverable';
import { query } from '../utils/db';

const router = Router();

// POST /api/deliverables - Create a new deliverable
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = DeliverableInputSchema.parse(req.body);
    const result = await query(
      `INSERT INTO deliverables (course_id, name, type, due_date, grade_weight, estimated_hours, score) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        validatedData.course_id,
        validatedData.name,
        validatedData.type,
        validatedData.due_date,
        validatedData.grade_weight,
        validatedData.estimated_hours,
        validatedData.score ?? null
      ]
    );
    
    const deliverable = result.rows[0];
    deliverable.hours_remaining = deliverable.estimated_hours - deliverable.hours_completed;
    
    res.status(201).json(deliverable);
  } catch (error) {
    next(error);
  }
});

// GET /api/deliverables - Get all deliverables (optionally filtered by course_id)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = req.query.courseId ? parseInt(req.query.courseId as string) : null;
    
    let result;
    if (courseId) {
      result = await query(
        `SELECT d.*, c.name as course_name 
         FROM deliverables d 
         JOIN courses c ON d.course_id = c.id 
         WHERE d.course_id = $1 
         ORDER BY d.due_date ASC`,
        [courseId]
      );
    } else {
      result = await query(
        `SELECT d.*, c.name as course_name 
         FROM deliverables d 
         JOIN courses c ON d.course_id = c.id 
         ORDER BY d.due_date ASC`
      );
    }
    
    const deliverables = result.rows.map(d => ({
      ...d,
      hours_remaining: d.estimated_hours - d.hours_completed
    }));
    
    res.json(deliverables);
  } catch (error) {
    next(error);
  }
});

// GET /api/deliverables/:id - Get a specific deliverable
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid deliverable ID' });
      return;
    }

    const result = await query(
      `SELECT d.*, c.name as course_name 
       FROM deliverables d 
       JOIN courses c ON d.course_id = c.id 
       WHERE d.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Deliverable not found' });
      return;
    }

    const deliverable = result.rows[0];
    deliverable.hours_remaining = deliverable.estimated_hours - deliverable.hours_completed;
    
    res.json(deliverable);
  } catch (error) {
    next(error);
  }
});

// PUT /api/deliverables/:id - Update a deliverable
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid deliverable ID' });
      return;
    }

    const validatedData = DeliverableUpdateSchema.parse(req.body);
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (validatedData.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(validatedData.name);
    }
    if (validatedData.type !== undefined) {
      updates.push(`type = $${paramCount++}`);
      values.push(validatedData.type);
    }
    if (validatedData.due_date !== undefined) {
      updates.push(`due_date = $${paramCount++}`);
      values.push(validatedData.due_date);
    }
    if (validatedData.grade_weight !== undefined) {
      updates.push(`grade_weight = $${paramCount++}`);
      values.push(validatedData.grade_weight);
    }
    if (validatedData.estimated_hours !== undefined) {
      updates.push(`estimated_hours = $${paramCount++}`);
      values.push(validatedData.estimated_hours);
    }
    if (validatedData.hours_completed !== undefined) {
      updates.push(`hours_completed = $${paramCount++}`);
      values.push(validatedData.hours_completed);
    }
    if (validatedData.score !== undefined) {
      updates.push(`score = $${paramCount++}`);
      values.push(validatedData.score);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE deliverables SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Deliverable not found' });
      return;
    }

    const deliverable = result.rows[0];
    deliverable.hours_remaining = deliverable.estimated_hours - deliverable.hours_completed;
    
    res.json(deliverable);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/deliverables/:id - Delete a deliverable
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid deliverable ID' });
      return;
    }

    const result = await query(
      'DELETE FROM deliverables WHERE id = $1',
      [id]
    );
    
    if ((result.rowCount || 0) === 0) {
      res.status(404).json({ error: 'Deliverable not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
