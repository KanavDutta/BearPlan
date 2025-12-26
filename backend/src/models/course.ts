import { z } from 'zod';

// Validation schemas
export const CourseInputSchema = z.object({
  name: z.string().min(1, 'Course name is required').max(100),
  code: z.string().max(20).optional()
});

export const CourseUpdateSchema = z.object({
  name: z.string().min(1, 'Course name is required').max(100).optional(),
  code: z.string().max(20).optional()
});

// Types
export type CourseInput = z.infer<typeof CourseInputSchema>;
export type CourseUpdate = z.infer<typeof CourseUpdateSchema>;

export interface Course {
  id: number;
  user_id: number;
  name: string;
  code: string | null;
  created_at: Date;
  updated_at: Date;
}
