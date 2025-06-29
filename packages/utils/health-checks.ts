/**
 * Individual service health check functions
 * These focused functions test specific system components
 * Each one is designed to be fast but thorough
 */

import { createClient } from 'redis';
import { supabase } from '../services/database';
import { config } from '../config';
import { logger } from './logger';

/**
 * Check database connectivity and basic functionality
 * This verifies we can both connect and perform operations
 */
export async function checkDatabase(): Promise<'healthy' | 'unhealthy'> {
  try {
    // Simple query that should always work if database is accessible
    const { data, error } = await supabase
      .from('companies')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      logger.warn('Database health check failed', { error });
      return 'unhealthy';
    }
    
    return 'healthy';
  } catch (error) {
    logger.error('Database connection failed', { error });
    return 'unhealthy';
  }
}

/**
 * Check Redis connectivity and responsiveness
 * Redis is critical for queue management and caching
 */
export async function checkRedis(): Promise<'healthy' | 'unhealthy'> {
  let client;
  
  try {
    client = createClient({
      url: config.redis.url
    });
    
    await client.connect();
    
    // Test basic read/write operations
    const testKey = 'health_check_' + Date.now();
    await client.set(testKey, 'ok', { EX: 10 }); // Expires in 10 seconds
    const result = await client.get(testKey);
    
    if (result !== 'ok') {
      return 'unhealthy';
    }
    
    return 'healthy';
  } catch (error) {
    logger.error('Redis health check failed', { error });
    return 'unhealthy';
  } finally {
    if (client) {
      await client.quit();
    }
  }
}
