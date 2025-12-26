import { Router, Request, Response, NextFunction } from 'express';
import { calculateCourseGrades, calculateRequiredScores } from '../services/gradeService';
import { z } from 'zod';

const router = Router();

const TargetGradeSchema = z.object({
  targetGrade: z.number().min(0).max(100)
});

// GET /api/grades/:courseId - Get grade projection for a course
router.get('/:courseId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = parseInt(req.params.courseId);
    
    if (isNaN(courseId)) {
      res.status(400).json({ error: 'Invalid course ID' });
      return;
    }
    
    const gradeData = await calculateCourseGrades(courseId);
    res.json(gradeData);
  } catch (error) {
    next(error);
  }
});

// POST /api/grades/:courseId/target - Calculate required scores for target grade
router.post('/:courseId/target', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = parseInt(req.params.courseId);
    
    if (isNaN(courseId)) {
      res.status(400).json({ error: 'Invalid course ID' });
      return;
    }
    
    const validatedData = TargetGradeSchema.parse(req.body);
    const result = await calculateRequiredScores(courseId, validatedData.targetGrade);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
