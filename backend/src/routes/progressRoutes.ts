import { Router, Request, Response, NextFunction } from 'express';
import { ProgressUpdateSchema } from '../models/progress';
import { updateProgressAndReplan, getProgressHistory } from '../services/replanService';

const router = Router();

// POST /api/progress - Update session progress and trigger replanning
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = ProgressUpdateSchema.parse(req.body);
    
    await updateProgressAndReplan(validatedData);
    
    res.json({ 
      message: 'Progress updated and schedule replanned successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/progress/history/:deliverableId - Get progress history for a deliverable
router.get('/history/:deliverableId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deliverableId = parseInt(req.params.deliverableId);
    
    if (isNaN(deliverableId)) {
      res.status(400).json({ error: 'Invalid deliverable ID' });
      return;
    }
    
    const history = await getProgressHistory(deliverableId);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

export default router;
