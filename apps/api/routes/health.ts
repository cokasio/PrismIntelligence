/**
 * Health Check Routes
 * System health monitoring and status endpoints
 */

import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware/error-handler';
import { performance } from 'perf_hooks';
import os from 'os';
import process from 'process';

const router = Router();

// Initialize Supabase client for health checks
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: any;
}

interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  services: HealthCheckResult[];
  system: {
    memory: {
      used: number;
      free: number;
      total: number;
      usage: number;
    };
    cpu: {
      usage: number;
      loadAverage: number[];
    };
    disk?: {
      usage: number;
    };
  };
}

/**
 * GET /health
 * Basic health check endpoint
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now();
  
  // Check all critical services
  const services = await Promise.allSettled([
    checkDatabase(),
    checkAIServices(),
    checkFileSystem(),
    checkMemory(),
    checkExternalServices()
  ]);

  const healthResults: HealthCheckResult[] = services.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        service: ['database', 'ai_services', 'filesystem', 'memory', 'external'][index],
        status: 'unhealthy',
        error: result.reason?.message || 'Unknown error'
      };
    }
  });

  // Determine overall status
  const overallStatus = determineOverallStatus(healthResults);
  
  // Get system metrics
  const systemMetrics = getSystemMetrics();
  
  const responseTime = performance.now() - startTime;

  const healthReport: SystemHealth = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    services: healthResults,
    system: systemMetrics
  };

  // Set appropriate status code
  const statusCode = overallStatus === 'healthy' ? 200 : 
                    overallStatus === 'degraded' ? 200 : 503;

  // Log health check
  logger.info('Health check completed', {
    status: overallStatus,
    responseTime,
    servicesChecked: healthResults.length
  });

  res.status(statusCode).json(healthReport);
}));

/**
 * GET /health/live
 * Kubernetes liveness probe endpoint
 */
router.get('/live', asyncHandler(async (req: Request, res: Response) => {
  // Simple check - if we can respond, we're alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}));

/**
 * GET /health/ready
 * Kubernetes readiness probe endpoint
 */
router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Check critical dependencies for readiness
    await Promise.all([
      checkDatabase(),
      checkCriticalServices()
    ]);

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness check failed', error);
    
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * GET /health/detailed
 * Detailed health information for monitoring systems
 */
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now();
  
  // Comprehensive health checks
  const detailedChecks = await Promise.allSettled([
    checkDatabaseDetailed(),
    checkAIServicesDetailed(),
    checkCacheHealth(),
    checkWebSocketHealth(),
    checkQueueHealth(),
    checkLoggerHealth()
  ]);

  const results = detailedChecks.map((result, index) => {
    const services = ['database', 'ai_services', 'cache', 'websocket', 'queue', 'logger'];
    
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        service: services[index],
        status: 'unhealthy',
        error: result.reason?.message
      };
    }
  });

  const responseTime = performance.now() - startTime;

  res.json({
    status: determineOverallStatus(results),
    timestamp: new Date().toISOString(),
    responseTime,
    checks: results,
    system: getDetailedSystemMetrics(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      environment: process.env.NODE_ENV
    }
  });
}));

/**
 * Check database health
 */
async function checkDatabase(): Promise<HealthCheckResult> {
  const startTime = performance.now();
  
  try {
    // Simple query to test database connectivity
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .limit(1);

    if (error) throw error;

    const responseTime = performance.now() - startTime;

    return {
      service: 'database',
      status: responseTime > 1000 ? 'degraded' : 'healthy',
      responseTime,
      details: {
        type: 'postgresql',
        provider: 'supabase'
      }
    };
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Database connection failed'
    };
  }
}

/**
 * Check AI services health
 */
async function checkAIServices(): Promise<HealthCheckResult> {
  const startTime = performance.now();
  
  try {
    // Check if API keys are configured
    const requiredKeys = ['ANTHROPIC_API_KEY', 'GOOGLE_AI_API_KEY', 'OPENAI_API_KEY'];
    const missingKeys = requiredKeys.filter(key => !process.env[key]);

    if (missingKeys.length > 0) {
      return {
        service: 'ai_services',
        status: 'degraded',
        responseTime: performance.now() - startTime,
        details: {
          missingKeys,
          configuredServices: requiredKeys.length - missingKeys.length
        }
      };
    }

    return {
      service: 'ai_services',
      status: 'healthy',
      responseTime: performance.now() - startTime,
      details: {
        configuredServices: requiredKeys.length
      }
    };
  } catch (error) {
    return {
      service: 'ai_services',
      status: 'unhealthy',
      responseTime: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'AI services check failed'
    };
  }
}

/**
 * Check filesystem health
 */
async function checkFileSystem(): Promise<HealthCheckResult> {
  const startTime = performance.now();
  
  try {
    const fs = require('fs').promises;
    const testFile = '/tmp/health-check.txt';
    
    // Test write/read/delete
    await fs.writeFile(testFile, 'health check');
    const content = await fs.readFile(testFile, 'utf8');
    await fs.unlink(testFile);

    if (content !== 'health check') {
      throw new Error('File content mismatch');
    }

    return {
      service: 'filesystem',
      status: 'healthy',
      responseTime: performance.now() - startTime
    };
  } catch (error) {
    return {
      service: 'filesystem',
      status: 'unhealthy',
      responseTime: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Filesystem check failed'
    };
  }
}

/**
 * Check memory usage
 */
async function checkMemory(): Promise<HealthCheckResult> {
  const usage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  
  const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;
  const heapUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (memoryUsagePercent > 90 || heapUsagePercent > 90) {
    status = 'unhealthy';
  } else if (memoryUsagePercent > 80 || heapUsagePercent > 80) {
    status = 'degraded';
  }

  return {
    service: 'memory',
    status,
    responseTime: 0,
    details: {
      systemMemoryUsage: memoryUsagePercent,
      heapUsage: heapUsagePercent,
      rss: usage.rss,
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      external: usage.external
    }
  };
}

/**
 * Check external services
 */
async function checkExternalServices(): Promise<HealthCheckResult> {
  // For now, just return healthy if we have the required env vars
  const externalServices = ['CLOUDMAILIN_ID_1', 'SUPABASE_URL'];
  const configured = externalServices.filter(service => process.env[service]);

  return {
    service: 'external',
    status: configured.length === externalServices.length ? 'healthy' : 'degraded',
    responseTime: 0,
    details: {
      configuredServices: configured.length,
      totalServices: externalServices.length
    }
  };
}

/**
 * Additional detailed checks
 */
async function checkDatabaseDetailed(): Promise<HealthCheckResult> {
  const basic = await checkDatabase();
  
  if (basic.status === 'unhealthy') return basic;

  try {
    // Check database performance with multiple queries
    const start = performance.now();
    
    const checks = await Promise.all([
      supabase.from('companies').select('count'),
      supabase.from('properties').select('count'),
      supabase.from('tenants').select('count')
    ]);

    const responseTime = performance.now() - start;

    return {
      ...basic,
      responseTime,
      details: {
        ...basic.details,
        tableChecks: checks.length,
        avgResponseTime: responseTime / checks.length
      }
    };
  } catch (error) {
    return {
      ...basic,
      status: 'degraded',
      error: 'Detailed database checks failed'
    };
  }
}

async function checkAIServicesDetailed(): Promise<HealthCheckResult> {
  // This would make actual test calls to AI services
  // For now, return the basic check
  return checkAIServices();
}

async function checkCacheHealth(): Promise<HealthCheckResult> {
  // Placeholder for Redis/cache health check
  return {
    service: 'cache',
    status: 'healthy',
    responseTime: 0,
    details: { note: 'Cache not implemented yet' }
  };
}

async function checkWebSocketHealth(): Promise<HealthCheckResult> {
  // Check if WebSocket server is running
  return {
    service: 'websocket',
    status: 'healthy',
    responseTime: 0,
    details: { note: 'WebSocket health check not implemented' }
  };
}

async function checkQueueHealth(): Promise<HealthCheckResult> {
  // Placeholder for job queue health
  return {
    service: 'queue',
    status: 'healthy',
    responseTime: 0,
    details: { note: 'Queue not implemented yet' }
  };
}

async function checkLoggerHealth(): Promise<HealthCheckResult> {
  try {
    logger.info('Logger health check');
    
    return {
      service: 'logger',
      status: 'healthy',
      responseTime: 0
    };
  } catch (error) {
    return {
      service: 'logger',
      status: 'unhealthy',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Logger check failed'
    };
  }
}

async function checkCriticalServices(): Promise<void> {
  // Only check absolutely critical services for readiness
  await checkDatabase();
}

/**
 * Determine overall system status
 */
function determineOverallStatus(results: HealthCheckResult[]): 'healthy' | 'degraded' | 'unhealthy' {
  const unhealthy = results.filter(r => r.status === 'unhealthy');
  const degraded = results.filter(r => r.status === 'degraded');

  if (unhealthy.length > 0) return 'unhealthy';
  if (degraded.length > 0) return 'degraded';
  return 'healthy';
}

/**
 * Get system metrics
 */
function getSystemMetrics() {
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    memory: {
      used: usedMem,
      free: freeMem,
      total: totalMem,
      usage: (usedMem / totalMem) * 100
    },
    cpu: {
      usage: process.cpuUsage().user / 1000000, // Convert to seconds
      loadAverage: os.loadavg()
    }
  };
}

/**
 * Get detailed system metrics
 */
function getDetailedSystemMetrics() {
  const basic = getSystemMetrics();
  
  return {
    ...basic,
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      version: process.version,
      memoryUsage: process.memoryUsage()
    },
    os: {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      hostname: os.hostname(),
      cpus: os.cpus().length
    }
  };
}

export default router;