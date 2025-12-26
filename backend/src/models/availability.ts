import { z } from 'zod';

// Validation schema
export const WeeklyAvailabilitySchema = z.object({
  sunday: z.number().min(0).max(24, 'Hours must be between 0 and 24'),
  monday: z.number().min(0).max(24, 'Hours must be between 0 and 24'),
  tuesday: z.number().min(0).max(24, 'Hours must be between 0 and 24'),
  wednesday: z.number().min(0).max(24, 'Hours must be between 0 and 24'),
  thursday: z.number().min(0).max(24, 'Hours must be between 0 and 24'),
  friday: z.number().min(0).max(24, 'Hours must be between 0 and 24'),
  saturday: z.number().min(0).max(24, 'Hours must be between 0 and 24')
});

// Types
export type WeeklyAvailability = z.infer<typeof WeeklyAvailabilitySchema>;

export interface AvailabilityRecord {
  id: number;
  user_id: number;
  day_of_week: number;
  hours: number;
  created_at: Date;
  updated_at: Date;
}
