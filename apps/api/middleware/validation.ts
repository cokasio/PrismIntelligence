/**
 * Input Validation Middleware
 * Comprehensive validation and sanitization for all inputs
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body, param, query } from 'express-validator';
import xss from 'xss';
import DOMPurify from 'isomorphic-dompurify';
import { ApiError } from '../utils/api-error';
import { logger } from '../utils/logger';
import path from 'path';

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
  /(--|\/\*|\*\/|;|'|"|`|\\)/g,
  /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
  /(\bAND\b\s*\d+\s*=\s*\d+)/gi,
  /(\bWHERE\b.*=.*)/gi
];

// NoSQL injection patterns
const NOSQL_INJECTION_PATTERNS = [
  /\$where/gi,
  /\$ne/gi,
  /\$gt/gi,
  /\$lt/gi,
  /\$gte/gi,
  /\$lte/gi,
  /\$in/gi,
  /\$nin/gi,
  /\$exists/gi,
  /\$regex/gi
];

// Path traversal patterns
const PATH_TRAVERSAL_PATTERNS = [
  /\.\./g,
  /\.\.\\/, 
  /%2e%2e/gi,
  /%252e%252e/gi,
  /\.\//g,
  /\.\\/, 
];

// Validate request handler
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.type === 'field' ? error.path : error.type,
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }));

      logger.warn('Validation failed', {
        errors: errorMessages,
        path: req.path,
        method: req.method
      });

      throw new ApiError(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        { validationErrors: errorMessages }
      );
    }

    next();
  };
};

// Sanitize HTML input
export function sanitizeHtml(input: string): string {
  // Use DOMPurify for comprehensive HTML sanitization
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false
  });

  // Additional XSS protection
  return xss(clean, {
    whiteList: {
      a: ['href', 'title'],
      b: [],
      i: [],
      em: [],
      strong: [],
      p: [],
      br: []
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style']
  });
}

// Check for SQL injection
export function checkSqlInjection(input: string): boolean {
  if (typeof input !== 'string') return false;
  
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

// Check for NoSQL injection
export function checkNoSqlInjection(input: any): boolean {
  const inputStr = JSON.stringify(input);
  return NOSQL_INJECTION_PATTERNS.some(pattern => pattern.test(inputStr));
}

// Check for path traversal
export function checkPathTraversal(input: string): boolean {
  if (typeof input !== 'string') return false;
  
  return PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(input));
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  // Remove path components
  const basename = path.basename(filename);
  
  // Remove dangerous characters
  return basename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255); // Limit length
}

// SQL injection prevention middleware
export function preventSqlInjection(req: Request, res: Response, next: NextFunction) {
  const checkValue = (value: any, location: string, key: string) => {
    if (typeof value === 'string' && checkSqlInjection(value)) {
      logger.warn('SQL injection attempt detected', {
        location,
        key,
        value: value.substring(0, 100),
        ip: req.ip,
        path: req.path
      });
      throw new ApiError('Invalid input detected', 400, 'SQL_INJECTION_DETECTED');
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([k, v]) => {
        checkValue(v, location, `${key}.${k}`);
      });
    }
  };

  // Check all input sources
  ['body', 'query', 'params'].forEach(location => {
    const data = req[location as keyof Request];
    if (data && typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        checkValue(value, location, key);
      });
    }
  });

  next();
}

// NoSQL injection prevention middleware
export function preventNoSqlInjection(req: Request, res: Response, next: NextFunction) {
  if (checkNoSqlInjection(req.body)) {
    logger.warn('NoSQL injection attempt detected', {
      body: JSON.stringify(req.body).substring(0, 200),
      ip: req.ip,
      path: req.path
    });
    throw new ApiError('Invalid input detected', 400, 'NOSQL_INJECTION_DETECTED');
  }

  next();
}

// Path traversal prevention middleware
export function preventPathTraversal(req: Request, res: Response, next: NextFunction) {
  const checkPath = (value: any, location: string) => {
    if (typeof value === 'string' && checkPathTraversal(value)) {
      logger.warn('Path traversal attempt detected', {
        location,
        value: value.substring(0, 100),
        ip: req.ip,
        path: req.path
      });
      throw new ApiError('Invalid path detected', 400, 'PATH_TRAVERSAL_DETECTED');
    }
  };

  // Check params and query for path-like values
  ['params', 'query'].forEach(location => {
    const data = req[location as keyof Request];
    if (data && typeof data === 'object') {
      Object.values(data).forEach(value => {
        checkPath(value, location);
      });
    }
  });

  next();
}

// File upload validation
export function validateFileUpload(options: {
  allowedTypes?: string[];
  maxSize?: number;
  required?: boolean;
} = {}) {
  const {
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    maxSize = 10 * 1024 * 1024, // 10MB default
    required = false
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    
    if (!files || (Array.isArray(files) && files.length === 0)) {
      if (required) {
        throw new ApiError('File upload required', 400, 'FILE_REQUIRED');
      }
      return next();
    }

    const fileArray = Array.isArray(files) ? files : Object.values(files).flat();

    fileArray.forEach(file => {
      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        throw new ApiError(
          `File type '${file.mimetype}' not allowed. Allowed types: ${allowedTypes.join(', ')}`,
          400,
          'INVALID_FILE_TYPE'
        );
      }

      // Check file size
      if (file.size > maxSize) {
        throw new ApiError(
          `File size exceeds limit of ${maxSize / (1024 * 1024)}MB`,
          400,
          'FILE_TOO_LARGE'
        );
      }

      // Sanitize filename
      file.filename = sanitizeFilename(file.originalname);
    });

    next();
  };
}

// Common validation rules
export const ValidationRules = {
  // Auth validations
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  
  // Common field validations
  required: (field: string) => body(field)
    .notEmpty()
    .withMessage(`${field} is required`),
  
  uuid: (field: string) => param(field)
    .isUUID()
    .withMessage(`Invalid ${field} format`),
  
  mongoId: (field: string) => param(field)
    .isMongoId()
    .withMessage(`Invalid ${field} format`),
  
  numeric: (field: string) => body(field)
    .isNumeric()
    .withMessage(`${field} must be numeric`),
  
  date: (field: string) => body(field)
    .isISO8601()
    .withMessage(`${field} must be a valid date`),
  
  url: (field: string) => body(field)
    .isURL()
    .withMessage(`${field} must be a valid URL`),
  
  // Pagination
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  
  // Search
  search: query('q')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters')
    .customSanitizer(value => sanitizeHtml(value))
};

// Sanitize all inputs middleware
export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Basic sanitization
      value = value.trim();
      
      // Remove null bytes
      value = value.replace(/\0/g, '');
      
      // HTML sanitization for text fields
      if (value.length < 1000 && !/<[^>]+>/.test(value)) {
        // Short text without HTML - basic escape
        value = value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      } else if (/<[^>]+>/.test(value)) {
        // Contains HTML - full sanitization
        value = sanitizeHtml(value);
      }
    } else if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    } else if (value && typeof value === 'object') {
      const sanitized: any = {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          sanitized[key] = sanitizeValue(value[key]);
        }
      }
      return sanitized;
    }
    
    return value;
  };

  // Sanitize body, query, and params
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query) as any;
  if (req.params) req.params = sanitizeValue(req.params) as any;

  next();
}

// Combined validation middleware
export function validationMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    // Apply all security checks
    try {
      sanitizeInputs(req, res, () => {});
      preventSqlInjection(req, res, () => {});
      preventNoSqlInjection(req, res, () => {});
      preventPathTraversal(req, res, () => {});
      next();
    } catch (error) {
      next(error);
    }
  };
}