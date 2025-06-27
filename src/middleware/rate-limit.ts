/**
 * Rate limiting middleware for Prism Intelligence
 * This protects the system from being overwhelmed by too many requests
 * Think of this as a thoughtful bouncer managing the flow of requests
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { createApiError } from './error';

/**
 * Create a rate limiter for API endpoints
 * This ensures fair usage and prevents system overload
 */
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || 'Too many requests from this IP, please try again later',
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    
    // Custom handler for rate limit exceeded
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        url: req.url,
        userAgent: req.get('User-Agent')
      });
      
      const error = createApiError(
        'Too many requests. Please wait before trying again.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
      
      res.status(429).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
          timestamp: new Date().toISOString(),
          retryAfter: Math.ceil(options.windowMs / 1000)
        }
      });
    },
    
    // Add helpful headers
    standardHeaders: true,
    legacyHeaders: false
  });
};

/**
 * Predefined rate limiters for different endpoint types
 * These provide sensible defaults for common use cases
 */
export const rateLimiters = {
  // General API endpoints - moderate limits
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'Too many API requests. Please wait 15 minutes before trying again.'
  }),
  
  // File upload endpoints - stricter limits due to processing overhead
  upload: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 uploads per 5 minutes
    message: 'Too many file uploads. Please wait 5 minutes before uploading again.'
  }),
  
  // Health check endpoints - very generous limits
  health: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    skipSuccessfulRequests: true
  })
};
