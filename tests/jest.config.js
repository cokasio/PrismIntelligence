/**
 * Jest Configuration for Prism Intelligence
 * Comprehensive test setup for unit, integration, and API tests
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Supported file extensions
  moduleFileExtensions: ['js', 'json', 'ts'],
  
  // Transform files with ts-jest
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts',
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/tests/e2e/', // E2E tests run with Playwright
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // Specific thresholds for critical files
    './apps/api/services/unified-ai-service.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './apps/api/services/integration-orchestrator.ts': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'apps/**/*.ts',
    '!apps/**/*.d.ts',
    '!apps/**/node_modules/**',
    '!apps/**/dist/**',
    '!apps/**/build/**',
    '!apps/**/*.config.ts',
    '!apps/**/migrations/**',
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/apps/dashboard-nextjs/src/$1',
    '^@api/(.*)$': '<rootDir>/apps/api/$1',
    '^@logic/(.*)$': '<rootDir>/apps/logic-layer/$1',
    '^@rl/(.*)$': '<rootDir>/apps/reinforcement-learning/$1',
    '^@agents/(.*)$': '<rootDir>/apps/agent-coordination/$1',
  },
  
  // Global variables available in tests
  globals: {
    'ts-jest': {
      tsconfig: {
        compilerOptions: {
          module: 'commonjs',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    },
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Test results processor
  testResultsProcessor: 'jest-sonar-reporter',
  
  // Additional Jest options for Node.js environment
  node: {
    globals: true,
    environment: 'node',
  },
  
  // Error handling
  errorOnDeprecated: true,
  
  // Watch plugins for development
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Projects for different test types
  projects: [
    // Unit tests
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
      testEnvironment: 'node',
    },
    
    // Integration tests
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/integration-setup.ts'],
    },
    
    // API tests
    {
      displayName: 'api',
      testMatch: ['<rootDir>/tests/api/**/*.test.ts'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/api-setup.ts'],
    },
  ],
  
  // Reporters
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Prism Intelligence Test Report',
      outputPath: 'coverage/test-report.html',
      includeFailureMsg: true,
      includeSuiteFailure: true,
    }],
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml',
      suiteName: 'Prism Intelligence Tests',
    }],
  ],
};