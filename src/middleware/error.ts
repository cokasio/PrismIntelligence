/**
 * Error handling middleware for Prism Intelligence
 * This middleware transforms technical errors into user-friendly responses
 * Think of it as a professional translator for error messages
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Create a standardized API error
 * This ensures all errors follow the same structure
 */
export function createApiError(
  message: string, 
  statusCode: number = 500, 
  code?: string,
  details?: any
): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Global error handling middleware
 * This catches all errors and formats them consistently
 */
export function errorHandler(
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error for debugging
  logger.error('API Error', {
    url: req.url,
    method: req.method,
    error: error.message,
    stack: error.stack,
    statusCode: error.statusCode
  });

  // Determine status code
  const statusCode = error.statusCode || 500;
  
  // Create user-friendly error response
  const errorResponse = {
    success: false,
    error: {
      message: getErrorMessage(error, statusCode),
      code: error.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        details: error.details,
        stack: error.stack
      })
    }
  };

  res.status(statusCode).json(errorResponse);
}
