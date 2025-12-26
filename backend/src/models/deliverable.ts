import { z } from 'zod';

// Validation schemas
export const DeliverableInputSchema = z.object({
  course_id: z.number().int().positive(),
  name: z.string().min(1, 'Deliverable name is required').max(200),
  type: z.string().min(1).max(50),
  due_date: z.string().refine((date) => {
    const dueDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate >= today;
  }, 'Due date must be in the future'),
  grade_weight: z.number().min(0).max(100, 'Grade weight must be between 0 and 100'),
  estimated_hours: z.number().positive('Estimated hours must be positive'),
  score: z.number().min(0).max(100).optional().nullable()
});

export const DeliverableUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.string().min(1).max(50).optional(),
  due_date: z.string().refine((date) => {
    const dueDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate >= today;
  }, 'Due date must be in the future').optional(),
  grade_weight: z.number().min(0).max(100).optional(),
  estimated_hours: z.number().positive().optional(),
  hours_completed: z.number().min(0).optional(),
  score: z.number().min(0).max(100).optional()
});

// Types
export type DeliverableInput = z.infer<typeof DeliverableInputSchema>;
export type DeliverableUpdate = z.infer<typeof DeliverableUpdateSchema>;

export interface Deliverable {
  id: number;
  course_id: number;
  name: string;
  type: string;
  due_date: string;
  grade_weight: number;
  estimated_hours: number;
  hours_completed: number;
  hours_remaining: number;
  score: number | null;
  created_at: Date;
  updated_at: Date;
}
