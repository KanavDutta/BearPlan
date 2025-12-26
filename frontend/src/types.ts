export interface Course {
  id: number;
  user_id: number;
  name: string;
  code: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseInput {
  name: string;
  code?: string;
}

export interface Deliverable {
  id: number;
  course_id: number;
  course_name?: string;
  name: string;
  type: string;
  due_date: string;
  grade_weight: number;
  estimated_hours: number;
  hours_completed: number;
  hours_remaining: number;
  score: number | null;
  created_at: string;
  updated_at: string;
}

export interface DeliverableInput {
  course_id: number;
  name: string;
  type: string;
  due_date: string;
  grade_weight: number;
  estimated_hours: number;
  score?: number | null;
}

export interface WeeklyAvailability {
  sunday: number;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
}
