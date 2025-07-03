import { toast } from 'sonner'

// Error types
export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    statusCode: number
    requestId?: string
    timestamp: string
    details?: any
  }
}

export interface ErrorWithRetry {
  error: Error
  retry: () => void
  attempts: number
}

// Error message mapping for user-friendly messages
const errorMessageMap: Record<string, string> = {
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  AUTHENTICATION_REQUIRED: 'Please log in to continue.',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  AI_SERVICE_ERROR: 'AI analysis temporarily unavailable. Please try again.',
  EXTERNAL_SERVICE_ERROR: 'External service is currently unavailable.',
  DATABASE_ERROR: 'Unable to save data. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
  INTERNAL_ERROR: 'Something went wrong. Please try again later.'
}

// Parse API error response
export function parseApiError(error: any): ApiErrorResponse['error'] {
  // Check if it's already a parsed API error
  if (error?.error?.message) {
    return error.error
  }

  // Check for network errors
  if (error.message === 'Failed to fetch' || error.code === 'NETWORK_ERROR') {
    return {
      message: errorMessageMap.NETWORK_ERROR,
      code: 'NETWORK_ERROR',
      statusCode: 0,
      timestamp: new Date().toISOString()
    }
  }

  // Parse response errors
  if (error.response) {
    const { data, status } = error.response
    
    if (data?.error) {
      return {
        ...data.error,
        statusCode: status
      }
    }

    return {
      message: data?.message || error.message || 'An error occurred',
      statusCode: status,
      timestamp: new Date().toISOString()
    }
  }

  // Default error
  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
    timestamp: new Date().toISOString()
  }
}

// Get user-friendly error message
export function getUserFriendlyMessage(error: ApiErrorResponse['error']): string {
  // Check for mapped messages
  if (error.code && errorMessageMap[error.code]) {
    return errorMessageMap[error.code]
  }

  // Check for specific status codes
  switch (error.statusCode) {
    case 401:
      return errorMessageMap.AUTHENTICATION_REQUIRED
    case 403:
      return errorMessageMap.INSUFFICIENT_PERMISSIONS
    case 404:
      return errorMessageMap.NOT_FOUND
    case 429:
      return errorMessageMap.RATE_LIMIT_EXCEEDED
    case 500:
    case 502:
    case 503:
      return errorMessageMap.INTERNAL_ERROR
    default:
      return error.message
  }
}

// Show error toast
export function showErrorToast(error: any, options?: {
  title?: string
  action?: {
    label: string
    onClick: () => void
  }
}) {
  const parsedError = parseApiError(error)
  const message = getUserFriendlyMessage(parsedError)

  toast.error(options?.title || 'Error', {
    description: message,
    action: options?.action,
    duration: 5000
  })

  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', parsedError)
  }
}

// Retry mechanism
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    backoff?: boolean
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    onRetry
  } = options

  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      if (attempt === maxAttempts) {
        throw error
      }

      // Don't retry certain errors
      const parsedError = parseApiError(error)
      if (
        parsedError.statusCode === 401 ||
        parsedError.statusCode === 403 ||
        parsedError.statusCode === 404 ||
        parsedError.code === 'VALIDATION_ERROR'
      ) {
        throw error
      }

      // Calculate delay with exponential backoff
      const retryDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay

      if (onRetry) {
        onRetry(attempt, error)
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }

  throw lastError!
}

// Error recovery suggestions
export function getErrorRecoverySuggestions(error: ApiErrorResponse['error']): string[] {
  const suggestions: string[] = []

  switch (error.code) {
    case 'NETWORK_ERROR':
      suggestions.push('Check your internet connection')
      suggestions.push('Try refreshing the page')
      suggestions.push('Check if you\'re behind a firewall')
      break
    
    case 'AUTHENTICATION_REQUIRED':
      suggestions.push('Log in to your account')
      suggestions.push('Check if your session has expired')
      break
    
    case 'RATE_LIMIT_EXCEEDED':
      const retryAfter = error.details?.retryAfter
      if (retryAfter) {
        suggestions.push(`Wait ${retryAfter} seconds before trying again`)
      } else {
        suggestions.push('Wait a few minutes before trying again')
      }
      suggestions.push('Reduce the frequency of your requests')
      break
    
    case 'AI_SERVICE_ERROR':
      suggestions.push('Try a simpler query')
      suggestions.push('Check if the document format is supported')
      suggestions.push('Try again in a few moments')
      break
    
    case 'VALIDATION_ERROR':
      if (error.details?.validationErrors) {
        Object.entries(error.details.validationErrors).forEach(([field, errors]) => {
          if (Array.isArray(errors)) {
            errors.forEach(err => suggestions.push(`${field}: ${err}`))
          }
        })
      } else {
        suggestions.push('Check all required fields are filled')
        suggestions.push('Ensure data formats are correct')
      }
      break
    
    default:
      suggestions.push('Try refreshing the page')
      suggestions.push('Contact support if the problem persists')
  }

  return suggestions
}

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers() {
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      showErrorToast(event.reason, {
        title: 'Unexpected Error',
        action: {
          label: 'Reload',
          onClick: () => window.location.reload()
        }
      })

      // Prevent default browser behavior
      event.preventDefault()
    })

    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error)
      
      // Don't show toast for script loading errors
      if (!event.filename?.includes('.js')) {
        showErrorToast(event.error, {
          title: 'Application Error'
        })
      }
    })
  }
}

// Error context hook
import { createContext, useContext, useState, ReactNode } from 'react'

interface ErrorContextValue {
  errors: Map<string, Error>
  addError: (key: string, error: Error) => void
  removeError: (key: string) => void
  clearErrors: () => void
  hasError: (key: string) => boolean
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined)

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState(new Map<string, Error>())

  const addError = (key: string, error: Error) => {
    setErrors(prev => new Map(prev).set(key, error))
  }

  const removeError = (key: string) => {
    setErrors(prev => {
      const next = new Map(prev)
      next.delete(key)
      return next
    })
  }

  const clearErrors = () => {
    setErrors(new Map())
  }

  const hasError = (key: string) => {
    return errors.has(key)
  }

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearErrors, hasError }}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within ErrorProvider')
  }
  return context
}