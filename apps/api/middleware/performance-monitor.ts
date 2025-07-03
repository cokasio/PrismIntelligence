/**
 * Performance Monitor Middleware
 * Tracks request performance, database queries, and system metrics
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { performance } from 'perf_hooks';
import onFinished from 'on-finished';

interface PerformanceMetrics {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  memoryUsage: NodeJS.MemoryUsage;
  timestamp: Date;
  userAgent?: string;
  ip: string;
  userId?: string;
  queryCount?: number;
  queryTime?: number;
  cacheHits?: number;
  cacheMisses?: number;
}

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  result?: any;
  error?: string;
}

// Store for tracking metrics
const activeRequests = new Map<string, {
  startTime: number;
  startMemory: NodeJS.MemoryUsage;
  queries: QueryMetrics[];
}>();

const performanceStats = {
  totalRequests: 0,
  totalErrors: 0,
  averageResponseTime: 0,
  slowRequests: 0,
  peakMemoryUsage: 0,
  requestsPerMinute: 0
};

// Track requests per minute
const requestTimestamps: number[] = [];

/**
 * Performance monitoring middleware
 */
export function performanceMonitor(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  const startTime = performance.now();
  const startMemory = process.memoryUsage();

  // Store request start data
  activeRequests.set(requestId, {
    startTime,
    startMemory,
    queries: []
  });

  // Add request ID to request object
  (req as any).requestId = requestId;
  (req as any).startTime = startTime;

  // Set response header
  res.setHeader('X-Request-ID', requestId);

  // Track request timestamp for RPM calculation
  requestTimestamps.push(Date.now());
  
  // Clean old timestamps (older than 1 minute)
  const oneMinuteAgo = Date.now() - 60000;
  while (requestTimestamps.length > 0 && requestTimestamps[0] < oneMinuteAgo) {
    requestTimestamps.shift();
  }

  // Monitor response completion
  onFinished(res, (err, res) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    const endMemory = process.memoryUsage();
    
    const requestData = activeRequests.get(requestId);
    
    if (requestData) {
      // Calculate metrics
      const metrics: PerformanceMetrics = {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        memoryUsage: endMemory,
        timestamp: new Date(),
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userId: (req as any).user?.id,
        queryCount: requestData.queries.length,
        queryTime: requestData.queries.reduce((total, q) => total + q.duration, 0)
      };

      // Update global stats
      updatePerformanceStats(metrics);

      // Log performance data
      logPerformanceMetrics(metrics, requestData.queries, err);

      // Check for performance issues
      checkPerformanceThresholds(metrics);

      // Clean up
      activeRequests.delete(requestId);
    }
  });

  next();
}

/**
 * Database query monitoring wrapper
 */
export function monitorQuery<T>(
  requestId: string,
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  return queryFn()
    .then(result => {
      const duration = performance.now() - startTime;
      
      // Record query metrics
      const requestData = activeRequests.get(requestId);
      if (requestData) {
        requestData.queries.push({
          query: queryName,
          duration,
          timestamp: new Date(),
          result: typeof result === 'object' ? 'object' : result
        });
      }

      // Log slow queries
      if (duration > 1000) {
        logger.warn('Slow query detected', {
          requestId,
          queryName,
          duration,
          threshold: 1000
        });
      }

      return result;
    })
    .catch(error => {
      const duration = performance.now() - startTime;
      
      // Record failed query
      const requestData = activeRequests.get(requestId);
      if (requestData) {
        requestData.queries.push({
          query: queryName,
          duration,
          timestamp: new Date(),
          error: error.message
        });
      }

      // Log query error
      logger.error('Query failed', {
        requestId,
        queryName,
        duration,
        error: error.message
      });

      throw error;
    });
}

/**
 * Update global performance statistics
 */
function updatePerformanceStats(metrics: PerformanceMetrics): void {
  performanceStats.totalRequests++;
  
  if (metrics.statusCode >= 400) {
    performanceStats.totalErrors++;
  }

  // Update average response time (moving average)
  const alpha = 0.1; // Smoothing factor
  performanceStats.averageResponseTime = 
    (1 - alpha) * performanceStats.averageResponseTime + alpha * metrics.duration;

  // Track slow requests (>3 seconds)
  if (metrics.duration > 3000) {
    performanceStats.slowRequests++;
  }

  // Track peak memory usage
  const currentMemory = metrics.memoryUsage.heapUsed;
  if (currentMemory > performanceStats.peakMemoryUsage) {
    performanceStats.peakMemoryUsage = currentMemory;
  }

  // Update requests per minute
  performanceStats.requestsPerMinute = requestTimestamps.length;
}

/**
 * Log performance metrics
 */
function logPerformanceMetrics(
  metrics: PerformanceMetrics,
  queries: QueryMetrics[],
  error?: Error
): void {
  const logLevel = error ? 'error' : 
                  metrics.duration > 5000 ? 'warn' : 
                  metrics.duration > 1000 ? 'info' : 'debug';

  logger[logLevel]('Request completed', {
    ...metrics,
    queries: queries.map(q => ({
      name: q.query,
      duration: q.duration,
      error: q.error
    })),
    error: error?.message
  });
}

/**
 * Check performance thresholds and alert
 */
function checkPerformanceThresholds(metrics: PerformanceMetrics): void {
  // Memory usage warning
  const memoryUsagePercent = (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;
  if (memoryUsagePercent > 85) {
    logger.warn('High memory usage detected', {
      requestId: metrics.requestId,
      memoryUsagePercent,
      heapUsed: metrics.memoryUsage.heapUsed,
      heapTotal: metrics.memoryUsage.heapTotal
    });
  }

  // Slow request warning
  if (metrics.duration > 5000) {
    logger.warn('Very slow request detected', {
      requestId: metrics.requestId,
      path: metrics.path,
      duration: metrics.duration,
      threshold: 5000
    });
  }

  // High query count warning
  if (metrics.queryCount && metrics.queryCount > 10) {
    logger.warn('High query count detected', {
      requestId: metrics.requestId,
      path: metrics.path,
      queryCount: metrics.queryCount,
      totalQueryTime: metrics.queryTime
    });
  }

  // Error rate monitoring
  const errorRate = (performanceStats.totalErrors / performanceStats.totalRequests) * 100;
  if (errorRate > 5 && performanceStats.totalRequests > 10) {
    logger.warn('High error rate detected', {
      errorRate,
      totalErrors: performanceStats.totalErrors,
      totalRequests: performanceStats.totalRequests
    });
  }
}

/**
 * Get current performance statistics
 */
export function getPerformanceStats(): any {
  return {
    ...performanceStats,
    activeRequests: activeRequests.size,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
}

/**
 * Reset performance statistics
 */
export function resetPerformanceStats(): void {
  performanceStats.totalRequests = 0;
  performanceStats.totalErrors = 0;
  performanceStats.averageResponseTime = 0;
  performanceStats.slowRequests = 0;
  performanceStats.peakMemoryUsage = process.memoryUsage().heapUsed;
  
  requestTimestamps.length = 0;
  
  logger.info('Performance statistics reset');
}

/**
 * Memory usage monitoring
 */
export function startMemoryMonitoring(intervalMs: number = 30000): NodeJS.Timeout {
  return setInterval(() => {
    const usage = process.memoryUsage();
    const heapUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;
    
    // Log memory stats periodically
    logger.metrics('memory_usage', {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      heapUsagePercent,
      rss: usage.rss,
      external: usage.external
    });

    // Trigger garbage collection if memory usage is high
    if (heapUsagePercent > 90 && global.gc) {
      logger.warn('High memory usage, triggering GC', { heapUsagePercent });
      global.gc();
    }
  }, intervalMs);
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Response time middleware for specific routes
 */
export function trackResponseTime(routeName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = performance.now();
    
    onFinished(res, () => {
      const duration = performance.now() - startTime;
      
      logger.metrics('route_performance', {
        route: routeName,
        method: req.method,
        duration,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      });
    });
    
    next();
  };
}

/**
 * Database connection pool monitoring
 */
export function monitorConnectionPool(pool: any): void {
  setInterval(() => {
    if (pool && typeof pool.totalCount === 'number') {
      logger.metrics('connection_pool', {
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingClients: pool.waitingCount,
        timestamp: new Date().toISOString()
      });
    }
  }, 60000); // Every minute
}

/**
 * API endpoint performance summary
 */
export function getEndpointPerformance(): any {
  const summary = new Map();
  
  // This would collect data from stored metrics
  // For now, return placeholder
  return {
    endpoints: Array.from(summary.entries()).map(([path, stats]) => ({
      path,
      ...stats
    })),
    summary: {
      totalEndpoints: summary.size,
      averageResponseTime: performanceStats.averageResponseTime,
      slowestEndpoint: null, // Would calculate from real data
      fastestEndpoint: null   // Would calculate from real data
    }
  };
}