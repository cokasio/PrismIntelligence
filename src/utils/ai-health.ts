/**
 * AI service health check function
 * This verifies that Claude API is accessible and responding
 * Critical because AI analysis is the core of Prism Intelligence
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { logger } from './logger';

/**
 * Check AI service availability and responsiveness
 * This ensures Claude can process analysis requests
 */
export async function checkAI(): Promise<'healthy' | 'unhealthy'> {
  try {
    const anthropic = new Anthropic({
      apiKey: config.ai.apiKey,
    });

    // Send a minimal test message to verify service availability
    // We use a simple request to minimize costs while still testing functionality
    const response = await anthropic.messages.create({
      model: config.ai.model,
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: 'Health check - please respond with "OK"'
        }
      ]
    });

    // Check if we got a meaningful response
    if (response.content && response.content.length > 0) {
      const textContent = response.content.find(block => block.type === 'text');
      if (textContent && 'text' in textContent && textContent.text.includes('OK')) {
        return 'healthy';
      }
    }

    logger.warn('AI service responded but content was unexpected', { 
      response: response.content 
    });
    return 'unhealthy';

  } catch (error) {
    logger.error('AI service health check failed', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return 'unhealthy';
  }
}
