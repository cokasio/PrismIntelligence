/**
 * Jest Test Setup
 * Global setup for all Jest tests
 */

import { jest } from '@jest/globals';

// Global test environment setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.USE_MOCK_AI = 'true';
  process.env.LOG_LEVEL = 'error'; // Reduce log noise in tests
  
  // Mock console methods in tests to reduce noise
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

// Global test cleanup
afterAll(async () => {
  // Clean up any global resources
  jest.restoreAllMocks();
});

// Global test utilities
global.testUtils = {
  // Create mock parsed document
  createMockDocument: (overrides = {}) => ({
    type: 'pdf',
    format: 'pdf',
    extractedText: 'Sample document content for testing',
    structuredData: {},
    metadata: {
      companyId: 'test-company',
      filename: 'test-document.pdf',
      uploadedAt: new Date().toISOString(),
      ...overrides.metadata
    },
    tables: [],
    ...overrides
  }),
  
  // Create mock AI response
  createMockAIResponse: (agentType = 'financial', overrides = {}) => ({
    agentId: `mock-${agentType}`,
    agentName: `Mock ${agentType.charAt(0).toUpperCase() + agentType.slice(1)}Bot`,
    analysis: `Mock ${agentType} analysis complete`,
    insights: [],
    recommendations: ['Mock recommendation'],
    confidence: 0.85,
    evidence: [],
    reasoning: ['Mock reasoning step'],
    ...overrides
  }),
  
  // Wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Generate test data
  generateTestData: {
    companyId: () => `company-${Math.random().toString(36).substring(7)}`,
    userId: () => `user-${Math.random().toString(36).substring(7)}`,
    requestId: () => `req-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    filename: (ext = 'pdf') => `test-file-${Date.now()}.${ext}`,
  }
};

// Mock external dependencies
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => Promise.resolve({ data: null, error: null })),
      delete: jest.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }))
}));

// Mock Google Cloud Speech
jest.mock('@google-cloud/speech', () => ({
  SpeechClient: jest.fn(() => ({
    recognize: jest.fn(() => Promise.resolve([{
      results: [{
        alternatives: [{
          transcript: 'mock transcription',
          confidence: 0.9
        }]
      }]
    }])),
    streamingRecognize: jest.fn(() => ({
      on: jest.fn(),
      write: jest.fn(),
      end: jest.fn()
    }))
  }))
}));

// Mock Google Cloud Text-to-Speech
jest.mock('@google-cloud/text-to-speech', () => ({
  TextToSpeechClient: jest.fn(() => ({
    synthesizeSpeech: jest.fn(() => Promise.resolve([{
      audioContent: Buffer.from('mock audio data')
    }])),
    listVoices: jest.fn(() => Promise.resolve([{
      voices: [
        { name: 'en-US-Neural2-F', ssmlGender: 'FEMALE' },
        { name: 'en-US-Neural2-D', ssmlGender: 'MALE' }
      ]
    }]))
  }))
}));

// Mock file system operations
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(() => Promise.resolve()),
    readFile: jest.fn(() => Promise.resolve('mock file content')),
    unlink: jest.fn(() => Promise.resolve()),
    mkdir: jest.fn(() => Promise.resolve()),
    readdir: jest.fn(() => Promise.resolve(['file1.txt', 'file2.txt']))
  },
  createWriteStream: jest.fn(() => ({
    write: jest.fn(),
    end: jest.fn(),
    on: jest.fn()
  })),
  createReadStream: jest.fn(() => ({
    pipe: jest.fn(),
    on: jest.fn()
  }))
}));

// Mock natural language processing
jest.mock('natural', () => ({
  WordTokenizer: jest.fn(() => ({
    tokenize: jest.fn((text) => text.split(' '))
  })),
  BayesClassifier: jest.fn(() => ({
    addDocument: jest.fn(),
    train: jest.fn(),
    classify: jest.fn(() => 'mock_intent'),
    getClassifications: jest.fn(() => [
      { label: 'mock_intent', value: 0.9 }
    ])
  }))
}));

// Mock crypto operations for tests
jest.mock('crypto', () => ({
  randomBytes: jest.fn((size) => Buffer.alloc(size, 'mock')),
  createCipheriv: jest.fn(() => ({
    update: jest.fn(() => Buffer.from('encrypted')),
    final: jest.fn(() => Buffer.from('final')),
    getAuthTag: jest.fn(() => Buffer.from('tag'))
  })),
  createDecipheriv: jest.fn(() => ({
    setAuthTag: jest.fn(),
    update: jest.fn(() => Buffer.from('decrypted')),
    final: jest.fn(() => Buffer.from('final'))
  })),
  createHmac: jest.fn(() => ({
    update: jest.fn(() => ({
      digest: jest.fn(() => 'mock-hash')
    }))
  })),
  timingSafeEqual: jest.fn(() => true),
  randomUUID: jest.fn(() => 'mock-uuid-1234-5678-9012')
}));

// Error handling for unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Fail the test on unhandled promise rejection
  throw reason;
});

// Global error handler for tests
global.onError = (error) => {
  console.error('Global test error:', error);
  throw error;
};