/**
 * Playwright Configuration for E2E Tests
 * End-to-end testing configuration for Prism Intelligence
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Timeout settings
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry settings
  retries: process.env.CI ? 2 : 0,
  
  // Parallel workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'coverage/playwright-report' }],
    ['json', { outputFile: 'coverage/playwright-results.json' }],
    ['junit', { outputFile: 'coverage/playwright-junit.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  
  // Global test configuration
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:3001',
    
    // Browser settings
    headless: !!process.env.CI,
    viewport: { width: 1280, height: 720 },
    
    // Capture settings
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Context options
    ignoreHTTPSErrors: true,
    
    // Action timeout
    actionTimeout: 10000,
    
    // Navigation timeout
    navigationTimeout: 30000,
    
    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },
  
  // Test output directory
  outputDir: 'coverage/playwright-artifacts',
  
  // Global setup and teardown
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  
  // Configure projects for major browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.spec\.ts/,
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /.*\.spec\.ts/,
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: /.*\.spec\.ts/,
    },
    
    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /.*\.mobile\.spec\.ts/,
    },
    
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      testMatch: /.*\.mobile\.spec\.ts/,
    },
    
    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
      testMatch: /.*\.tablet\.spec\.ts/,
    },
    
    // Accessibility tests
    {
      name: 'accessibility',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.a11y\.spec\.ts/,
    },
    
    // Performance tests
    {
      name: 'performance',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable performance metrics
        launchOptions: {
          args: ['--enable-precise-memory-info']
        }
      },
      testMatch: /.*\.performance\.spec\.ts/,
    },
  ],
  
  // Web server configuration
  webServer: [
    // Start the API server
    {
      command: 'npm run dev',
      cwd: './apps/api',
      port: 3000,
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: 'test',
        USE_MOCK_AI: 'true',
        PORT: '3000',
      },
    },
    
    // Start the frontend server
    {
      command: 'npm run dev',
      cwd: './apps/dashboard-nextjs',
      port: 3001,
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: 'test',
        NEXT_PUBLIC_API_URL: 'http://localhost:3000',
        PORT: '3001',
      },
    },
  ],
  
  // Test matching patterns
  testMatch: [
    '**/tests/e2e/**/*.spec.ts',
    '**/tests/e2e/**/*.test.ts',
  ],
  
  // Test ignore patterns
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
  ],
  
  // Metadata
  metadata: {
    platform: process.platform,
    nodeVersion: process.version,
    testSuite: 'Prism Intelligence E2E Tests',
  },
});