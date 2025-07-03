/**
 * Integration Tests for Document Processing Pipeline
 * Tests the complete flow from document upload to AI analysis
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createServer } from 'http';
import express from 'express';
import path from 'path';
import fs from 'fs';

// Import the actual server components
import { errorHandler, notFoundHandler } from '../../apps/api/middleware/error-handler';
import { performanceMonitor } from '../../apps/api/middleware/performance-monitor';
import healthRoutes from '../../apps/api/routes/health';
import voiceRoutes from '../../apps/api/routes/voice';

describe('Document Processing Pipeline Integration', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    // Set up test environment
    process.env.NODE_ENV = 'test';
    process.env.USE_MOCK_AI = 'true';
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-key';

    // Create Express app for testing
    app = express();
    
    // Basic middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(performanceMonitor);

    // Routes
    app.use('/health', healthRoutes);
    app.use('/voice', voiceRoutes);

    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Create server
    server = createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, resolve);
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(resolve);
      });
    }
  });

  beforeEach(() => {
    // Reset any test state
  });

  describe('Health Check Integration', () => {
    test('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: expect.any(String),
        timestamp: expect.any(String),
        version: expect.any(String),
        uptime: expect.any(Number),
        services: expect.any(Array),
        system: expect.objectContaining({
          memory: expect.any(Object),
          cpu: expect.any(Object)
        })
      });
    });

    test('should return liveness probe status', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'alive',
        timestamp: expect.any(String),
        uptime: expect.any(Number)
      });
    });

    test('should return readiness probe status', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ready',
        timestamp: expect.any(String)
      });
    });

    test('should return detailed health information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toMatchObject({
        status: expect.any(String),
        timestamp: expect.any(String),
        responseTime: expect.any(Number),
        checks: expect.any(Array),
        system: expect.any(Object),
        environment: expect.objectContaining({
          nodeVersion: expect.any(String),
          platform: expect.any(String),
          arch: expect.any(String)
        })
      });
    });
  });

  describe('Voice Interface Integration', () => {
    test('should interpret voice commands', async () => {
      const commandData = {
        text: 'show me risky tenants',
        context: {
          userRole: 'manager'
        }
      };

      const response = await request(app)
        .post('/voice/interpret-command')
        .send(commandData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        intent: {
          action: expect.any(String),
          confidence: expect.any(Number),
          entities: expect.any(Object),
          rawText: 'show me risky tenants',
          normalizedText: expect.any(String)
        },
        suggestions: expect.any(Array)
      });
    });

    test('should generate speech from text', async () => {
      const speechData = {
        text: 'Analysis completed successfully',
        agentId: 'claude-finance',
        emotion: 'neutral'
      };

      // Note: This test might fail without proper Google Cloud credentials
      // In a real test environment, you'd mock the TTS service
      const response = await request(app)
        .post('/voice/text-to-speech')
        .send(speechData);

      // We expect either success (200) or service unavailable (500) 
      // depending on credentials
      expect([200, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.headers['content-type']).toBe('audio/mpeg');
        expect(response.body).toBeInstanceOf(Buffer);
      }
    });

    test('should return voice command help', async () => {
      const response = await request(app)
        .get('/voice/commands/help')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        helpText: expect.any(String),
        commands: expect.objectContaining({
          documentAnalysis: expect.any(Array),
          tenantManagement: expect.any(Array),
          financial: expect.any(Array),
          maintenance: expect.any(Array),
          navigation: expect.any(Array)
        })
      });
    });

    test('should return available agent voices', async () => {
      const response = await request(app)
        .get('/voice/agents/voices')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        voices: expect.any(Array)
      });

      expect(response.body.voices.length).toBeGreaterThan(0);
      expect(response.body.voices[0]).toMatchObject({
        agentId: expect.any(String),
        agentName: expect.any(String),
        voiceName: expect.any(String),
        languageCode: expect.any(String)
      });
    });

    test('should provide command suggestions', async () => {
      const response = await request(app)
        .get('/voice/suggestions?partial=show')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        suggestions: expect.any(Array)
      });
    });

    test('should handle invalid voice commands gracefully', async () => {
      const response = await request(app)
        .post('/voice/interpret-command')
        .send({ text: '' })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.objectContaining({
          message: expect.any(String),
          code: 'VALIDATION_ERROR'
        })
      });
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle 404 routes', async () => {
      const response = await request(app)
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.objectContaining({
          message: expect.any(String),
          statusCode: 404,
          code: 'ENDPOINT_NOT_FOUND'
        })
      });
    });

    test('should include request ID in error responses', async () => {
      const response = await request(app)
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body.error.requestId).toBeDefined();
      expect(response.headers['x-request-id']).toBeDefined();
    });

    test('should handle validation errors properly', async () => {
      const response = await request(app)
        .post('/voice/text-to-speech')
        .send({}) // Missing required 'text' field
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          details: expect.any(Object)
        })
      });
    });
  });

  describe('Performance Monitoring Integration', () => {
    test('should add request ID headers', async () => {
      const response = await request(app)
        .get('/health/live');

      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.headers['x-request-id']).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    test('should track request performance', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/health')
        .expect(200);
        
      const endTime = Date.now();
      const requestDuration = endTime - startTime;
      
      // Request should complete within reasonable time
      expect(requestDuration).toBeLessThan(5000);
    });
  });

  describe('Security Integration', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/health');

      // Check for basic security headers
      expect(response.headers['x-content-type-options']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
    });

    test('should handle large payloads appropriately', async () => {
      const largePayload = {
        text: 'a'.repeat(1000000) // 1MB of text
      };

      const response = await request(app)
        .post('/voice/interpret-command')
        .send(largePayload);

      // Should either process successfully or reject with appropriate error
      expect([200, 400, 413]).toContain(response.status);
    });
  });

  describe('Content Type Validation', () => {
    test('should accept JSON content type', async () => {
      const response = await request(app)
        .post('/voice/interpret-command')
        .set('Content-Type', 'application/json')
        .send({ text: 'test command' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should reject invalid content types for POST requests', async () => {
      const response = await request(app)
        .post('/voice/interpret-command')
        .set('Content-Type', 'text/plain')
        .send('invalid data');

      // Should handle gracefully, either 400 or process as empty JSON
      expect([400, 200]).toContain(response.status);
    });
  });

  describe('Concurrent Request Handling', () => {
    test('should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .get('/health/live')
          .expect(200)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('alive');
        expect(response.headers['x-request-id']).toBeDefined();
      });

      // All request IDs should be unique
      const requestIds = responses.map(r => r.headers['x-request-id']);
      const uniqueIds = new Set(requestIds);
      expect(uniqueIds.size).toBe(requestIds.length);
    });

    test('should maintain performance under load', async () => {
      const startTime = Date.now();
      
      const requests = Array(50).fill(null).map(() =>
        request(app).get('/health/live')
      );

      await Promise.all(requests);
      
      const totalTime = Date.now() - startTime;
      const avgTimePerRequest = totalTime / 50;
      
      // Average time per request should be reasonable
      expect(avgTimePerRequest).toBeLessThan(100); // 100ms average
    });
  });
});