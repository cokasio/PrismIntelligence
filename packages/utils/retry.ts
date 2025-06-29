import { logger } from './logger';

/**
 * Retries a function with exponential backoff.
 * @param fn The async function to retry.
 * @param retries The maximum number of retries.
 * @param initialDelay The initial delay in milliseconds.
 * @param logContext Additional context for logging.
 * @returns The result of the function if it succeeds.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  initialDelay = 1000,
  logContext: object = {}
): Promise<T> {
  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === retries - 1) {
        logger.error('Final attempt failed. Rethrowing error.', { ...logContext, error: error.message });
        throw error;
      }

      const isRateLimitError = error && error.status === 429;
      
      if (isRateLimitError) {
        logger.warn(`Rate limit hit. Retrying in ${delay}ms...`, { ...logContext, attempt: i + 1 });
      } else {
        logger.warn(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`, { ...logContext, error: error.message, attempt: i + 1 });
      }
      
      await new Promise(res => setTimeout(res, delay));
      delay *= 2; // Exponentially increase the delay
    }
  }
  // This line should be unreachable due to the throw in the catch block.
  throw new Error('Retry logic failed unexpectedly.');
}