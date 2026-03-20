import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // 1. Log the full error for the developer, but just the message
  console.error(`[Error] ${err.name}: ${err.message}`);

  // 2. Determine the status code
  // Default to 500, but check for common custom status fields
  let statusCode = err.status || err.statusCode || 500;

  // 3. Handle Mongoose-specific errors (The "Refinery" context)
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Extract specific Mongoose validation messages
    message = Object.values(err.errors).map((val: any) => val.message).join(', ');
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for field: ${err.path}`;
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // 4. Send Response
  res.status(statusCode).json({
    success: false,
    error: message,
    // Only reveal stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};