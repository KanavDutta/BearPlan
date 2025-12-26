import { Router, Request, Response, NextFunction } from 'express';
import { CourseInputSchema, CourseUpdateSchema } from '../models/course';
import { query } from '../utils/db';

const router = Router();
const USER_ID = 1;

// POST /api/courses - Create a new course
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = CourseInputSchema.parse(req.body);
    const result = await query(
      'INSERT INTO courses (user_id, name, code) VALUES ($1, $2, $3) RETURNING *',
      [USER_ID, validatedData.name, validatedData.code || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// GET /api/courses - Get all courses
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      'SELECT * FROM courses WHERE user_id = $1 ORDER BY created_at DESC',
      [USER_ID]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/courses/:id - Get a specific course
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid course ID' });
      return;
    }

    const result = await query(
      'SELECT * FROM courses WHERE id = $1 AND user_id = $2',
      [id, USER_ID]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/courses/:id - Update a course
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid course ID' });
      return;
    }

    const validatedData = CourseUpdateSchema.parse(req.body);
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (validatedData.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(validatedData.name);
    }
    if (validatedData.code !== undefined) {
      updates.push(`code = $${paramCount++}`);
      values.push(validatedData.code);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    updates.push(`updated_at = NOW()`);
    values.push(id, USER_ID);

    const result = await query(
      `UPDATE courses SET ${updates.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/courses/:id - Delete a course
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid course ID' });
      return;
    }

    const result = await query(
      'DELETE FROM courses WHERE id = $1 AND user_id = $2',
      [id, USER_ID]
    );
    
    if ((result.rowCount || 0) === 0) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
