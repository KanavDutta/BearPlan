import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ZodError } from 'zod';
import courseRoutes from './routes/courseRoutes';
import deliverableRoutes from './routes/deliverableRoutes';
import availabilityRoutes from './routes/availabilityRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import progressRoutes from './routes/progressRoutes';
import gradeRoutes from './routes/gradeRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/courses', courseRoutes);
app.use('/api/deliverables', deliverableRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/grades', gradeRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${_req.method} ${_req.path} not found`
  });
});

// Error handling middleware
interface ErrorWithStatus extends Error {
  status?: number;
  details?: any;
}

app.use((err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Error:', err);
  
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: err.errors
    });
    return;
  }
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: err.name || 'Error',
    message: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`BearPlan backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
