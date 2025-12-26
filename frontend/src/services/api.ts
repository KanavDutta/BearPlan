import axios from 'axios';
import type { Course, Deliverable, WeeklyAvailability, CourseInput, DeliverableInput } from '../types';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Course API
export const courseApi = {
  getAll: () => api.get<Course[]>('/courses'),
  getById: (id: number) => api.get<Course>(`/courses/${id}`),
  create: (data: CourseInput) => api.post<Course>('/courses', data),
  update: (id: number, data: Partial<CourseInput>) => api.put<Course>(`/courses/${id}`, data),
  delete: (id: number) => api.delete(`/courses/${id}`),
};

// Deliverable API
export const deliverableApi = {
  getAll: (courseId?: number) => {
    const url = courseId ? `/deliverables?courseId=${courseId}` : '/deliverables';
    return api.get<Deliverable[]>(url);
  },
  getById: (id: number) => api.get<Deliverable>(`/deliverables/${id}`),
  create: (data: DeliverableInput) => api.post<Deliverable>('/deliverables', data),
  update: (id: number, data: Partial<DeliverableInput>) => api.put<Deliverable>(`/deliverables/${id}`, data),
  delete: (id: number) => api.delete(`/deliverables/${id}`),
};

// Availability API
export const availabilityApi = {
  get: () => api.get<WeeklyAvailability>('/availability'),
  set: (data: WeeklyAvailability) => api.post<WeeklyAvailability>('/availability', data),
};
