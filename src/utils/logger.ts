/**
 * Logger Utility
 * This creates a centralized logging system for the entire application
 * Think of it as a smart recording device that knows what's important to capture
 */

import winston from 'winston';
import config from '../config';

/**
 * Define custom log levels with specific colors for easy visual scanning
 * Like a traffic light system - red for danger, yellow for caution, green for all good
 */
const customLevels = {
  levels: {
    error: 0,    // Critical problems that need immediate attention
    warn: 1,     // Potential issues that should be investigated
    info: 2,     // Important business events (report processed, email sent)
    http: 3,     // HTTP request logging
    debug: 4,    // Detailed information for debugging
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
  },
};

// Tell Winston about our custom colors
winston.addColors(customLevels.colors);

/**
 * Create different formatters for different environments
 * Development gets colorful, easy-to-read logs
 * Production gets structured JSON for log aggregation services
 */
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.errors({ stack: true }), // Include stack traces for errors
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    // Create a clean, readable format for development
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // If there's additional data, show it on the next line
    if (Object.keys(metadata).length > 0) {
      msg += `\n${JSON.stringify(metadata, null, 2)}`;
    }
    
    return msg;
  }),
);

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(), // JSON format for easy parsing by log tools
);

/**
 * Create the logger instance with intelligent defaults
 * This is the main logger that will be used throughout the application
 */
const logger = winston.createLogger({
  level: config.app.logLevel, // Use the level from our config
  levels: customLevels.levels,
  format: config.app.isDevelopment ? developmentFormat : productionFormat,
  
  // Define where logs should go
  transports: [
    // Always log to console
    new winston.transports.Console({
      stderrLevels: ['error'], // Errors go to stderr, others to stdout
    }),
  ],
  
  // Don't exit on uncaught errors (we'll handle them gracefully)
  exitOnError: false,
});

/**
 * Add file logging in production for persistence
 * This ensures logs aren't lost if the application crashes
 */
if (config.app.isProduction) {
  // Error logs go to a separate file for easy monitoring
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 10 * 1024 * 1024, // 10MB max file size
    maxFiles: 5, // Keep 5 backup files
    tailable: true, // Allow tailing the log file
  }));
  
  // All logs go to a combined file
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 10 * 1024 * 1024,
    maxFiles: 10,
    tailable: true,
  }));
}

/**
 * Create specialized loggers for different parts of the application
 * This helps identify where log messages come from
 */
export const createLogger = (service: string) => {
  return logger.child({ service });
};

/**
 * Helper function to log HTTP requests
 * Captures important details without logging sensitive data
 */
export const logHttpRequest = (req: any, res: any, responseTime: number) => {
  // Never log passwords or API keys!
  const sanitizedBody = { ...req.body };
  if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
  if (sanitizedBody.apiKey) sanitizedBody.apiKey = '[REDACTED]';
  
  logger.http({
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: Object.keys(sanitizedBody).length > 0 ? sanitizedBody : undefined,
  });
};

/**
 * Log unhandled errors (last resort error catching)
 * These are errors that weren't caught by normal error handling
 */
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  // Give the logger time to write before exiting
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Promise Rejection:', { reason, promise });
});

// Export the main logger as default
export default logger;

// Also export specific loggers for common services
export const dbLogger = createLogger('database');
export const apiLogger = createLogger('api');
export const aiLogger = createLogger('ai');
export const emailLogger = createLogger('email');
export const queueLogger = createLogger('queue');

/**
 * Example usage throughout your application:
 * 
 * import { apiLogger } from './utils/logger';
 * 
 * apiLogger.info('Processing report', { reportId: '123', filename: 'monthly.pdf' });
 * apiLogger.error('Failed to process report', { error: err.message, reportId: '123' });
 */