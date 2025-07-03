/**
 * Security Middleware for Express
 * Implements comprehensive security measures for production
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/api-error';
import crypto from 'crypto';

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdnjs.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'wss:', 'https:'],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'"],
      workerSrc: ["'self'", 'blob:'],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
});

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed
    if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
      // In development, allow all origins
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    logger.warn('CORS blocked request', { origin, allowedOrigins });
    callback(new ApiError('Not allowed by CORS', 403, 'CORS_ERROR'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-API-Key'],
  exposedHeaders: ['X-Request-ID', 'X-Rate-Limit-Remaining', 'X-Rate-Limit-Reset'],
  maxAge: 86400 // 24 hours
};

// Rate limiting configurations
export const rateLimiters = {
  // General API rate limit
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      throw new ApiError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
    }
  }),

  // Strict rate limit for auth endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    skipSuccessfulRequests: true,
    message: 'Too many authentication attempts, please try again later.',
    handler: (req, res) => {
      logger.warn('Auth rate limit exceeded', {
        ip: req.ip,
        path: req.path
      });
      throw new ApiError('Too many authentication attempts', 429, 'AUTH_RATE_LIMIT_EXCEEDED');
    }
  }),

  // AI analysis rate limit
  aiAnalysis: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each user to 50 AI analyses per hour
    keyGenerator: (req) => req.user?.id || req.ip,
    message: 'AI analysis quota exceeded, please try again later.',
    handler: (req, res) => {
      logger.warn('AI analysis rate limit exceeded', {
        userId: req.user?.id,
        ip: req.ip
      });
      throw new ApiError('AI analysis quota exceeded', 429, 'AI_RATE_LIMIT_EXCEEDED');
    }
  })
};

// Request size limits
export const requestSizeLimits = {
  json: '10mb',
  urlencoded: '10mb',
  raw: '50mb', // For file uploads
  text: '1mb'
};

// IP-based access control
export function ipAccessControl(
  whitelist: string[] = [],
  blacklist: string[] = []
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.connection.remoteAddress || '';

    // Check blacklist first
    if (blacklist.length > 0 && blacklist.includes(clientIp)) {
      logger.warn('Blacklisted IP attempted access', { ip: clientIp });
      throw new ApiError('Access denied', 403, 'IP_BLACKLISTED');
    }

    // Check whitelist if configured
    if (whitelist.length > 0 && !whitelist.includes(clientIp)) {
      logger.warn('Non-whitelisted IP attempted access', { ip: clientIp });
      throw new ApiError('Access denied', 403, 'IP_NOT_WHITELISTED');
    }

    next();
  };
}

// API Key validation middleware
export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    throw new ApiError('API key required', 401, 'API_KEY_REQUIRED');
  }

  // Validate API key format
  if (!/^[a-zA-Z0-9]{32,}$/.test(apiKey)) {
    throw new ApiError('Invalid API key format', 401, 'INVALID_API_KEY_FORMAT');
  }

  // In production, validate against database
  // For now, check against environment variable
  const validApiKeys = (process.env.VALID_API_KEYS || '').split(',').map(k => k.trim());
  
  if (!validApiKeys.includes(apiKey)) {
    logger.warn('Invalid API key used', { apiKey: apiKey.substring(0, 8) + '...' });
    throw new ApiError('Invalid API key', 401, 'INVALID_API_KEY');
  }

  // Add API key info to request
  (req as any).apiKey = apiKey;
  next();
}

// CSRF protection for state-changing operations
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET requests and API endpoints
  if (req.method === 'GET' || req.path.startsWith('/api/')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string || req.body?._csrf;
  const sessionToken = (req.session as any)?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    throw new ApiError('Invalid CSRF token', 403, 'CSRF_ERROR');
  }

  next();
}

// Generate CSRF token
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Content type validation
export function validateContentType(
  allowedTypes: string[] = ['application/json']
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip for GET requests
    if (req.method === 'GET' || req.method === 'DELETE') {
      return next();
    }

    const contentType = req.headers['content-type'];
    
    if (!contentType) {
      throw new ApiError('Content-Type header required', 400, 'MISSING_CONTENT_TYPE');
    }

    const isAllowed = allowedTypes.some(type => contentType.includes(type));
    
    if (!isAllowed) {
      throw new ApiError(
        `Content-Type '${contentType}' not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        400,
        'INVALID_CONTENT_TYPE'
      );
    }

    next();
  };
}

// Security event logging
export function logSecurityEvent(
  event: string,
  req: Request,
  details?: any
): void {
  logger.warn('Security event', {
    event,
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
    userId: (req as any).user?.id,
    details
  });
}

// Sanitize user input
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove null bytes
    input = input.replace(/\0/g, '');
    
    // Trim whitespace
    input = input.trim();
    
    // Prevent directory traversal
    input = input.replace(/\.\./g, '');
    
    // Remove control characters
    input = input.replace(/[\x00-\x1F\x7F]/g, '');
  } else if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  } else if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        // Sanitize key as well
        const sanitizedKey = sanitizeInput(key);
        sanitized[sanitizedKey] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  
  return input;
}

// Combined security middleware
export function securityMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Remove sensitive headers
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    
    // Add request ID if not present
    if (!req.headers['x-request-id']) {
      req.headers['x-request-id'] = crypto.randomUUID();
    }
    
    next();
  };
}