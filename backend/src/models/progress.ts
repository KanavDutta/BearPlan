import { z } from 'zod';

// Validation schemas
export const ProgressUpdateSchema = z.object({
  session_id: z.number().int().positive(),
  status: z.enum(['completed', 'partial', 'missed']),
  actual_hours: z.number().min(0).optional()
}).refine(
  (data) => {
    // If status is partial, actual_hours must be provided
    if (data.status === 'partial' && data.actual_hours === undefined) {
      return false;
    }
    return true;
  },
  {
    message: 'actual_hours is required when status is partial',
    path: ['actual_hours']
  }
);

// Types
export type ProgressUpdate = z.infer<typeof ProgressUpdateSchema>;

export interface SessionProgress {
  session_id: number;
  deliverable_id: number;
  status: 'completed' | 'partial' | 'missed';
  actual_hours: number;
  updated_at: Date;
}
