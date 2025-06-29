/**
 * Health check utilities for monitoring system status
 * These functions help other services determine if the application is healthy
 * Think of this as a built-in diagnostic system for your application
 */

import { Request, Response } from 'express';
import { supabase } from '../services/database';
import { logger } from './logger';
import { createClient } from 'redis';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    ai: 'healthy' | 'unhealthy';
  };
  message?: string;
}

/**
 * Comprehensive health check endpoint
 * This verifies all critical systems are functioning
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor(process.uptime()),
    checks: {
      database: 'unhealthy',
      redis: 'unhealthy',
      ai: 'unhealthy'
    }
  };

  try {
    // Check database connectivity
    result.checks.database = await checkDatabase();
    
    // Check Redis connectivity  
    result.checks.redis = await checkRedis();
    
    // Check AI service availability
    result.checks.ai = await checkAI();
    
    // Determine overall status
    const healthyChecks = Object.values(result.checks).filter(status => status === 'healthy').length;
    const totalChecks = Object.keys(result.checks).length;
    
    if (healthyChecks === totalChecks) {
      result.status = 'healthy';
    } else if (healthyChecks === 0) {
      result.status = 'unhealthy';
    } else {
      result.status = 'degraded';
      result.message = 'Some services are unavailable';
    }
    
  } catch (error) {
    logger.error('Health check failed', { error });
    result.status = 'unhealthy';
    result.message = 'Health check encountered an error';
  }

  // Set appropriate HTTP status code
  const statusCode = result.status === 'healthy' ? 200 : 
                    result.status === 'degraded' ? 207 : 503;
  
  res.status(statusCode).json(result);
}
