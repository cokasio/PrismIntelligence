/**
 * Jest Test Setup for Prism Intelligence
 * Minimal test configuration
 */

import { jest } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.USE_MOCK_AI = 'true';
process.env.DEMO_MODE = 'true';

// Global timeout for all tests
jest.setTimeout(30000);

// Setup global test helpers
(global as any).mockDocument = {
  id: 'test-doc-1',
  name: 'test-document.pdf',
  type: 'pdf',
  size: 1024,
  content: 'Test document content',
  metadata: {
    pages: 1,
    author: 'Test Author'
  }
};

(global as any).mockAnalysisResult = {
  agentId: 'claude-finance',
  agentName: 'FinanceBot',
  analysis: 'Mock analysis result',
  insights: ['Mock insight 1', 'Mock insight 2'],
  recommendations: ['Mock recommendation'],
  confidence: 0.95,
  evidence: ['Mock evidence'],
  reasoning: ['Mock reasoning step'],
  timestamp: new Date().toISOString()
};

// Mock fetch for API calls
(global as any).fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
    text: () => Promise.resolve('mock response'),
    headers: new Map()
  })
);

// Error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});