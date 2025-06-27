/**
 * Error message helper functions
 * These functions translate technical errors into user-friendly messages
 * Think of these as customer service representatives for error handling
 */

import { ApiError } from './error';

/**
 * Convert technical errors into user-friendly messages
 * This function takes confusing technical language and makes it understandable
 */
export function getErrorMessage(error: ApiError, statusCode: number): string {
  // Handle specific error types with helpful messages
  switch (statusCode) {
    case 400:
      return getValidationErrorMessage(error);
    case 401:
      return 'Authentication required. Please check your API key or login credentials.';
    case 403:
      return 'Access denied. You don\'t have permission to perform this action.';
    case 404:
      return 'The requested resource was not found. Please check the URL and try again.';
    case 413:
      return 'File too large. Please reduce the file size and try again.';
    case 429:
      return 'Too many requests. Please wait a moment before trying again.';
    case 500:
      return 'Internal server error. Our team has been notified and is working on a fix.';
    case 502:
      return 'Service temporarily unavailable. Please try again in a few minutes.';
    case 503:
      return 'Service under maintenance. Please check back shortly.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Handle validation errors with specific guidance
 * These errors often have multiple issues that need to be addressed
 */
function getValidationErrorMessage(error: ApiError): string {
  if (error.code === 'VALIDATION_ERROR' && error.details) {
    // If we have specific validation details, format them helpfully
    const issues = Array.isArray(error.details) ? error.details : [error.details];
    return `Please check the following: ${issues.join(', ')}`;
  }
  
  return error.message || 'The request contains invalid data. Please check your input and try again.';
}
