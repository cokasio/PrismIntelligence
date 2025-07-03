/**
 * Custom API Error Classes
 * Provides structured error handling with proper status codes and messages
 */

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      isOperational: this.isOperational,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}

// Specific error classes for common scenarios

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_REQUIRED');
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'INSUFFICIENT_PERMISSIONS');
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, 'RESOURCE_NOT_FOUND', { resource, identifier });
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter?: number) {
    super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED', { retryAfter });
  }
}

export class ExternalServiceError extends ApiError {
  constructor(service: string, originalError?: any) {
    super(
      `External service '${service}' is unavailable`,
      503,
      'EXTERNAL_SERVICE_ERROR',
      { service, originalError: originalError?.message }
    );
  }
}

export class DatabaseError extends ApiError {
  constructor(operation: string, originalError?: any) {
    super(
      `Database operation '${operation}' failed`,
      500,
      'DATABASE_ERROR',
      { operation, originalError: originalError?.message },
      false // Not operational - indicates system issue
    );
  }
}

export class AIServiceError extends ApiError {
  constructor(agent: string, originalError?: any) {
    super(
      `AI agent '${agent}' failed to process request`,
      503,
      'AI_SERVICE_ERROR',
      { agent, originalError: originalError?.message }
    );
  }
}

// Error factory functions for common scenarios

export const Errors = {
  validation: (message: string, details?: any) => 
    new ValidationError(message, details),
  
  authentication: (message?: string) => 
    new AuthenticationError(message),
  
  authorization: (message?: string) => 
    new AuthorizationError(message),
  
  notFound: (resource: string, identifier?: string) => 
    new NotFoundError(resource, identifier),
  
  conflict: (message: string, details?: any) => 
    new ConflictError(message, details),
  
  rateLimit: (retryAfter?: number) => 
    new RateLimitError(retryAfter),
  
  externalService: (service: string, error?: any) => 
    new ExternalServiceError(service, error),
  
  database: (operation: string, error?: any) => 
    new DatabaseError(operation, error),
  
  aiService: (agent: string, error?: any) => 
    new AIServiceError(agent, error),
  
  internal: (message: string = 'An internal error occurred') => 
    new ApiError(message, 500, 'INTERNAL_ERROR')
};

// Error assertion helpers

export function assertExists<T>(
  value: T | null | undefined,
  resource: string,
  identifier?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw Errors.notFound(resource, identifier);
  }
}

export function assertAuthorized(
  condition: boolean,
  message?: string
): asserts condition {
  if (!condition) {
    throw Errors.authorization(message);
  }
}

export function assertValid(
  condition: boolean,
  message: string,
  details?: any
): asserts condition {
  if (!condition) {
    throw Errors.validation(message, details);
  }
}

// Async error wrapper
export function wrapAsync<T>(
  promise: Promise<T>,
  errorTransform?: (error: any) => ApiError
): Promise<T> {
  return promise.catch(error => {
    if (errorTransform) {
      throw errorTransform(error);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || 'An unexpected error occurred',
      500,
      'UNEXPECTED_ERROR',
      { originalError: error.message }
    );
  });
}