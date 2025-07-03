/**
 * Jest Configuration for Prism Intelligence
 * Fixed TypeScript support and proper test setup
 */

module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',
  
  // Test environment
  testEnvironment: 'node',
  
  // Root directory
  rootDir: '../',
  
  // Supported file extensions
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  
  // Transform files with ts-jest (updated configuration)
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        target: 'es2019',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        strict: false,
        noEmit: true,
      },
    }],
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
    '/backup-before-reorganization-20250629-111041/', // Exclude backup folder
  ],
  
  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/dashboard-nextjs/src/$1',
    '^@api/(.*)$': '<rootDir>/apps/api/$1',
    '^@logic/(.*)$': '<rootDir>/apps/logic-layer/$1',
    '^@rl/(.*)$': '<rootDir>/apps/reinforcement-learning/$1',
    '^@agents/(.*)$': '<rootDir>/apps/agent-coordination/$1',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Coverage configuration
  collectCoverage: false, // Disabled by default for faster runs
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'apps/**/*.ts',
    '!apps/**/*.d.ts',
    '!apps/**/node_modules/**',
    '!apps/**/dist/**',
    '!apps/**/build/**',
    '!apps/**/*.config.ts',
    '!apps/**/migrations/**',
    '!apps/**/*.test.ts',
    '!apps/**/*.spec.ts',
  ],
  
  // Test timeout (30 seconds)
  testTimeout: 30000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Verbose output for debugging
  verbose: true,
  
  // Error handling
  errorOnDeprecated: false, // Allow deprecated APIs for now
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect handles that prevent Jest from exiting
  detectOpenHandles: false,
  
  // Max worker processes
  maxWorkers: '50%',
};