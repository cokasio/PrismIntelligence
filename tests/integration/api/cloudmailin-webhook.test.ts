/**
 * CloudMailin Webhook Integration Tests
 * Tests for receiving property reports via CloudMailin email service
 */

import request from 'supertest';
import app from '../../src/index';
import { queueService } from '../../src/services/queue';
import { emailService } from '../../src/services/email';

// Mock external services
jest.mock('../../src/services/queue');
jest.mock('../../src/services/email');

describe('CloudMailin Inbound Email Webhook', () => {
  const WEBHOOK_ENDPOINT = '/api/webhooks/cloudmailin';
  
  // Test data fixtures - CloudMailin format
  const createWebhookPayload = (overrides = {}) => ({
    to: 'tenant123@reports.yourdomain.com',
    from: 'property.manager@client.com',
    subject: 'Monthly Property Report - October 2024',
    plain: 'Please find attached the monthly report.',
    html: '<p>Please find attached the monthly report.</p>',
    headers: {
      'Message-ID': '<test123@cloudmailin.net>',
      'Date': new Date().toISOString(),
    },
    attachments: [
      {
        file_name: 'October-2024-Property-Report.pdf',
        content_type: 'application/pdf',
        size: 150000, // 150KB
        disposition: 'attachment',
        content: Buffer.from('test pdf content').toString('base64')
      }
    ],
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Report Processing', () => {
    it('should accept and process a valid property report PDF', async () => {
      const payload = createWebhookPayload();
      
      // Mock successful queue addition
      (queueService.addReportForProcessing as jest.Mock).mockResolvedValue({
        id: 'job-123',
        data: { reportId: 'report-456' }
      });

      const response = await request(app)
        .post(WEBHOOK_ENDPOINT)
        .set('Authorization', 'Bearer test-webhook-secret')
        .send(payload)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Report received and queued for processing',
        reportId: expect.stringMatching(/^report-\d+-[a-f0-9]+$/)
      });

      expect(queueService.addReportForProcessing).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant123',
          filename: 'October-2024-Property-Report.pdf',
          senderEmail: payload.from
        })
      );
    });

    it('should handle Excel reports (.xlsx)', async () => {
      const payload = createWebhookPayload({
        attachments: [{
          file_name: 'Property-Analysis-Q4-2024.xlsx',
          content_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 250000,
          disposition: 'attachment',
          content: Buffer.from('test excel content').toString('base64')
        }]
      });

      await request(app)
        .post(WEBHOOK_ENDPOINT)
        .set('Authorization', 'Bearer test-webhook-secret')
        .send(payload)
        .expect(200);

      expect(queueService.addReportForProcessing).toHaveBeenCalled();
    });

    it('should handle CSV reports', async () => {
      const payload = createWebhookPayload({
        attachments: [{
          file_name: 'rent-roll-november-2024.csv',
          content_type: 'text/csv',
          size: 50000,
          disposition: 'attachment',
          content: Buffer.from('Property,Rent,Status').toString('base64')
        }]
      });

      await request(app)
        .post(WEBHOOK_ENDPOINT)
        .set('Authorization', 'Bearer test-webhook-secret')
        .send(payload)
        .expect(200);

      expect(queueService.addReportForProcessing).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should reject emails without attachments', async () => {
      const payload = createWebhookPayload({
        attachments: []
      });

      await request(app)
        .post(WEBHOOK_ENDPOINT)
        .set('Authorization', 'Bearer test-webhook-secret')
        .send(payload)
        .expect(200); // Still returns 200 to CloudMailin

      expect(emailService.sendProcessingError).toHaveBeenCalledWith(
        payload.from,
        'no-report-id',
        'No attachment found',
        expect.stringContaining('Please attach a property report')
      );
    });

    it('should reject invalid file types', async () => {
      const payload = createWebhookPayload({
        attachments: [{
          file_name: 'vacation-photos.jpg',
          content_type: 'image/jpeg',
          size: 2000000,
          disposition: 'attachment',
          content: Buffer.from('fake image').toString('base64')
        }]
      });

      await request(app)
        .post(WEBHOOK_ENDPOINT)
        .set('Authorization', 'Bearer test-webhook-secret')
        .send(payload)
        .expect(200);

      expect(emailService.sendProcessingError).toHaveBeenCalledWith(
        payload.from,
        'no-report-id',
        'Invalid file type',
        expect.any(String)
      );
    });

    it('should handle oversized attachments gracefully', async () => {
      const payload = createWebhookPayload({
        attachments: [{
          file_name: 'massive-report.pdf',
          content_type: 'application/pdf',
          size: 26214400, // 25MB+
          disposition: 'attachment',
          content: 'x'.repeat(1000) // Don't need full content for test
        }]
      });

      await request(app)
        .post(WEBHOOK_ENDPOINT)
        .set('Authorization', 'Bearer test-webhook-secret')
        .send(payload)
        .expect(200);

      expect(emailService.sendProcessingError).toHaveBeenCalledWith(
        payload.from,
        'no-report-id',
        'File too large',
        expect.stringContaining('25MB')
      );
    });

    it('should reject unauthorized requests', async () => {
      const payload = createWebhookPayload();

      await request(app)
        .post(WEBHOOK_ENDPOINT)
        .send(payload) // No Authorization header
        .expect(401);
    });
  });

  describe('Multi-Tenant Support', () => {
    it('should extract tenant ID from recipient email (subdomain format)', async () => {
      const payload = createWebhookPayload({
        to: 'client456@reports.yourdomain.com'
      });

      await request(app)
        .post(WEBHOOK_ENDPOINT)
        .set('Authorization', 'Bearer test-webhook-secret')
        .send(payload)
        .expect(200);

      expect(queueService.addReportForProcessing).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'client456'
        })
      );
    });

    it('should extract tenant ID from plus addressing', async () => {
      const payload = createWebhookPayload({
        to: 'reports+tenant789@yourdomain.com'
      });

      await request(app)
        .post(WEBHOOK_ENDPOINT)
        .set('Authorization', 'Bearer test-webhook-secret')
        .send(payload)
        .expect(200);

      expect(queueService.addReportForProcessing).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant789'
        })
      );
    });

    it('should use default tenant for unrecognized format', async () => {
      const payload = createWebhookPayload({
        to: 'generic@yourdomain.com'
      });

      await request(app)
        .post(WEBHOOK_ENDPOINT)
        .set('Authorization', 'Bearer test-webhook-secret')
        .send(payload)
        .expect(200);

      expect(queueService.addReportForProcessing).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'default'
        })
      );
    });
  });

  describe('Multiple Attachments', () => {
    it('should process the first valid report when multiple files are attached', async () => {
      const payload = createWebhookPayload({
        attachments: [
          {
            file_name: 'cover-letter.docx',
            content_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            size: 30000,
            disposition: 'attachment',
            content: Buffer.from('doc content').toString('base64')
          },
          {
            file_name: 'October-Report.pdf',
            content_type: 'application/pdf',
            size: 150000,
            disposition: 'attachment',
            content: Buffer.from('pdf content').toString('base64')
          },
          {
            file_name: 'logo.png',
            content_type: 'image/png',
            size: 5000,
            disposition: 'attachment',
            content: Buffer.from('png content').toString('base64')
          }
        ]
      });

      await request(app)
        .post(WEBHOOK_ENDPOINT)
        .set('Authorization', 'Bearer test-webhook-secret')
        .send(payload)
        .expect(200);

      expect(queueService.addReportForProcessing).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'October-Report.pdf'
        })
      );
    });
  });

  describe('Performance', () => {
    it('should respond quickly even with large payloads', async () => {
      const largeContent = 'x'.repeat(1000000); // 1MB of base64
      const payload = createWebhookPayload({
        plain: 'x'.repeat(100000), // 100KB of text
        html: '<p>' + 'x'.repeat(100000) + '</p>',
        attachments: [{
          file_name: 'large-report.pdf',
          content_type: 'application/pdf',
          size: 5000000, // 5MB
          disposition: 'attachment',
          content: largeContent
        }]
      });

      const start = Date.now();
      
      await request(app)
        .post(WEBHOOK_ENDPOINT)
        .set('Authorization', 'Bearer test-webhook-secret')
        .send(payload)
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000); // Should respond in under 2 seconds
    });
  });
});

/**
 * To run these tests:
 * npm test tests/api/cloudmailin-webhook.test.ts
 * 
 * To generate more test cases with AI:
 * aider tests/api/cloudmailin-webhook.test.ts -m "Add tests for webhook retry logic and error recovery"
 */