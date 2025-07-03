 string, message: string, metadata?: any) {
    const logData = {
      ...metadata,
      ...(this.context && { context: this.context })
    };

    logger.log(level, message, logData);
  }

  error(message: string, error?: Error | any, metadata?: any) {
    this.log('error', message, {
      ...metadata,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
          ...error
        }
      })
    });
  }

  warn(message: string, metadata?: any) {
    this.log('warn', message, metadata);
  }

  info(message: string, metadata?: any) {
    this.log('info', message, metadata);
  }

  http(message: string, metadata?: any) {
    this.log('http', message, metadata);
  }

  verbose(message: string, metadata?: any) {
    this.log('verbose', message, metadata);
  }

  debug(message: string, metadata?: any) {
    this.log('debug', message, metadata);
  }

  metrics(event: string, metadata?: any) {
    this.log('metrics', event, {
      ...metadata,
      timestamp: new Date().toISOString(),
      event
    });
  }

  // Performance timing helper
  startTimer(label: string): () => void {
    const start = Date.now();
    
    return () => {
      const duration = Date.now() - start;
      this.metrics('timing', {
        label,
        duration,
        unit: 'ms'
      });
    };
  }

  // Correlation ID helper
  withCorrelationId(correlationId: string): Logger {
    return new Logger(`${this.context}:${correlationId}`);
  }

  // Child logger with additional context
  child(context: string): Logger {
    return new Logger(this.context ? `${this.context}:${context}` : context);
  }
}

// Export singleton logger instance
export const logger = new Logger();

// Export logger class for creating contextual loggers
export { Logger as LoggerClass };

// Utility functions
export const createContextLogger = (context: string) => new Logger(context);

// Mask sensitive data in logs
export function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveKeys = [
    'password',
    'token',
    'apiKey',
    'secret',
    'authorization',
    'creditCard',
    'ssn',
    'email'
  ];

  const masked = { ...data };

  Object.keys(masked).forEach(key => {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key]);
    }
  });

  return masked;
}

// Export Winston logger for advanced usage
export { logger as winstonLogger };

export default logger;