/**
 * Global Error Handler Middleware for Express
 * Handles all errors in production with proper logging and user-friendly responses
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/api-error';

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    requestId?: string;
    timestamp: string;
    details?: any;
  };
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If response was already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Generate request ID for tracking
  const requestId = req.headers['x-request-id'] as string || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Log the error with full details
  logger.error('Request failed', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
      ...((err as ApiError).toJSON ? (err as ApiError).toJSON() : {})
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      body: req.body,
      ip: req.ip,
      userAgent: req.get('user-agent')
    },
    requestId,
    timestamp: new Date().toISOString()
  });

  // Determine status code and user-friendly message
  let statusCode = 500;
  let userMessage = 'An unexpected error occurred. Please try again later.';
  let errorCode = 'INTERNAL_ERROR';
  let details: any = undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    userMessage = err.message;
    errorCode = err.code;
    details = err.details;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    userMessage = 'Invalid request data';
    errorCode = 'VALIDATION_ERROR';
    details = parseValidationError(err);
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    userMessage = 'Authentication required';
    errorCode = 'UNAUTHORIZED';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    userMessage = 'You do not have permission to perform this action';
    errorCode = 'FORBIDDEN';
  } else if (err.message.includes('not found')) {
    statusCode = 404;
    userMessage = 'The requested resource was not found';
    errorCode = 'NOT_FOUND';
  }

  // In production, don't expose internal error details
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    details = undefined;
  } else if (process.env.NODE_ENV !== 'production') {
    // In development, include stack trace
    details = {
      ...details,
      stack: err.stack
    };
  }

  // Send error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: userMessage,
      code: errorCode,
      statusCode,
      requestId,
      timestamp: new Date().toISOString(),
      ...(details && { details })
    }
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * Not Found handler - catches all unmatched routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  const error = new ApiError('The requested endpoint does not exist', 404, 'ENDPOINT_NOT_FOUND');
  throw error;
}

/**
 * Async error wrapper - catches async errors and passes to error handler
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Parse validation errors into user-friendly format
 */
function parseValidationError(err: any): any {
  if (err.errors) {
    const errors: Record<string, string[]> = {};
    
    Object.keys(err.errors).forEach(field => {
      const fieldError = err.errors[field];
      errors[field] = Array.isArray(fieldError) 
        ? fieldError.map((e: any) => e.message || e)
        : [fieldError.message || fieldError];
    });
    
    return { validationErrors: errors };
  }
  
  return undefined;
}

/**
 * Request ID middleware - adds request ID to all requests
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.headers['x-request-id'] as string || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
}

/**
 * Error logging middleware - logs all errors before they reach the error handler
 */
export function errorLoggingMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
  // Log error metrics for monitoring
  logger.metrics('error_occurred', {
    error_type: err.name,
    error_message: err.message,
    status_code: (err as ApiError).statusCode || 500,
    path: req.path,
    method: req.method
  });

  next(err);
}