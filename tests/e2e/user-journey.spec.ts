/**
 * End-to-End Tests for User Journey
 * Tests complete user workflows in the Prism Intelligence platform
 */

import { test, expect, Page, Browser } from '@playwright/test';

test.describe('Prism Intelligence User Journey', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set up test environment
    await page.goto('http://localhost:3001');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Demo Interface', () => {
    test('should load the demo page successfully', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Check for main UI elements
      await expect(page.locator('[data-testid="cognitive-inbox"]')).toBeVisible();
      await expect(page.locator('[data-testid="agent-activity"]')).toBeVisible();
      await expect(page.locator('[data-testid="document-analysis"]')).toBeVisible();
    });

    test('should display demo scenarios', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Check for demo scenario buttons
      await expect(page.locator('text=Covenant Breach Alert')).toBeVisible();
      await expect(page.locator('text=At-Risk Tenant')).toBeVisible();
      await expect(page.locator('text=Maintenance Priority')).toBeVisible();
      await expect(page.locator('text=Revenue Optimization')).toBeVisible();
      await expect(page.locator('text=Compliance Alert')).toBeVisible();
    });

    test('should execute covenant breach scenario', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Click on Covenant Breach scenario
      await page.click('text=Covenant Breach Alert');
      
      // Wait for analysis to complete
      await page.waitForSelector('[data-testid="analysis-results"]', { timeout: 10000 });
      
      // Check for expected results
      await expect(page.locator('text=DSCR')).toBeVisible();
      await expect(page.locator('text=Mathematical Proof')).toBeVisible();
      await expect(page.locator('[data-testid="confidence-score"]')).toBeVisible();
    });

    test('should show agent debates', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Execute a scenario
      await page.click('text=At-Risk Tenant');
      
      // Wait for results
      await page.waitForSelector('[data-testid="analysis-results"]');
      
      // Check for "Why?" button and click it
      await expect(page.locator('[data-testid="why-button"]')).toBeVisible();
      await page.click('[data-testid="why-button"]');
      
      // Check for agent debate view
      await expect(page.locator('[data-testid="agent-debate"]')).toBeVisible();
      await expect(page.locator('text=FinanceBot')).toBeVisible();
      await expect(page.locator('text=TenantBot')).toBeVisible();
      await expect(page.locator('text=RiskBot')).toBeVisible();
    });
  });

  test.describe('Document Upload', () => {
    test('should upload and analyze document', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Find upload area
      const uploadArea = page.locator('[data-testid="upload-zone"]');
      await expect(uploadArea).toBeVisible();
      
      // Simulate file upload (we'll create a test file)
      const fileInput = page.locator('input[type="file"]');
      
      // Create a test file path (in a real test, you'd have actual test files)
      // For now, we'll test the UI elements
      await expect(fileInput).toBeAttached();
    });

    test('should show upload progress', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Test drag and drop area
      const dropZone = page.locator('[data-testid="upload-zone"]');
      await expect(dropZone).toContainText('Drop files here');
      
      // Test upload button
      await expect(page.locator('text=Upload Document')).toBeVisible();
    });
  });

  test.describe('Voice Interface', () => {
    test('should show voice interface elements', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Check for voice button
      await expect(page.locator('[data-testid="voice-button"]')).toBeVisible();
      
      // Check for voice status indicator
      await expect(page.locator('[data-testid="voice-status"]')).toBeVisible();
    });

    test('should display voice commands help', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Click voice help button
      await page.click('[data-testid="voice-help"]');
      
      // Check for voice commands modal
      await expect(page.locator('[data-testid="voice-commands-modal"]')).toBeVisible();
      await expect(page.locator('text=Available voice commands')).toBeVisible();
      await expect(page.locator('text=analyze this document')).toBeVisible();
    });

    test('should handle voice activation', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Click voice button (this won't actually record without permissions)
      await page.click('[data-testid="voice-button"]');
      
      // Check for listening state (or permission request)
      // In a real test environment with proper permissions
      const voiceStatus = page.locator('[data-testid="voice-status"]');
      await expect(voiceStatus).toBeVisible();
    });
  });

  test.describe('Cognitive Inbox', () => {
    test('should display inbox categories', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Check for category filters
      await expect(page.locator('text=Financial')).toBeVisible();
      await expect(page.locator('text=Tenant')).toBeVisible();
      await expect(page.locator('text=Maintenance')).toBeVisible();
      await expect(page.locator('text=Legal')).toBeVisible();
    });

    test('should filter by category', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Click on Financial category
      await page.click('text=Financial');
      
      // Check that financial items are highlighted/filtered
      await expect(page.locator('[data-testid="financial-items"]')).toBeVisible();
    });

    test('should show item details on selection', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Click on an inbox item
      const inboxItem = page.locator('[data-testid="inbox-item"]').first();
      await inboxItem.click();
      
      // Check for details panel
      await expect(page.locator('[data-testid="item-details"]')).toBeVisible();
    });
  });

  test.describe('Agent Activity Panel', () => {
    test('should show agent status', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Check for agent activity indicators
      await expect(page.locator('[data-testid="agent-activity"]')).toBeVisible();
      await expect(page.locator('text=FinanceBot')).toBeVisible();
      await expect(page.locator('text=TenantBot')).toBeVisible();
      await expect(page.locator('text=MaintenanceBot')).toBeVisible();
    });

    test('should show real-time agent updates', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Execute a scenario to trigger agent activity
      await page.click('text=Revenue Optimization');
      
      // Check for agent activity updates
      const agentActivity = page.locator('[data-testid="agent-activity"]');
      await expect(agentActivity).toBeVisible();
      
      // Wait for and check agent status changes
      await page.waitForSelector('[data-testid="agent-thinking"]', { timeout: 5000 });
    });
  });

  test.describe('Feedback and Learning', () => {
    test('should show feedback buttons', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Execute a scenario
      await page.click('text=Maintenance Priority');
      
      // Wait for results
      await page.waitForSelector('[data-testid="analysis-results"]');
      
      // Check for feedback buttons
      await expect(page.locator('[data-testid="accept-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="reject-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="edit-button"]')).toBeVisible();
    });

    test('should handle accept feedback', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Execute a scenario
      await page.click('text=Compliance Alert');
      await page.waitForSelector('[data-testid="analysis-results"]');
      
      // Click accept
      await page.click('[data-testid="accept-button"]');
      
      // Check for feedback confirmation
      await expect(page.locator('text=Feedback recorded')).toBeVisible();
    });

    test('should handle reject feedback with reason', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Execute a scenario
      await page.click('text=At-Risk Tenant');
      await page.waitForSelector('[data-testid="analysis-results"]');
      
      // Click reject
      await page.click('[data-testid="reject-button"]');
      
      // Check for feedback form
      await expect(page.locator('[data-testid="feedback-form"]')).toBeVisible();
      
      // Fill feedback reason
      await page.fill('[data-testid="feedback-reason"]', 'Analysis not accurate');
      await page.click('[data-testid="submit-feedback"]');
      
      // Check for confirmation
      await expect(page.locator('text=Feedback submitted')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:3001/demo');
      
      // Check for mobile-friendly layout
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Check that main elements are still accessible
      await expect(page.locator('[data-testid="cognitive-inbox"]')).toBeVisible();
    });

    test('should work on tablet viewport', async () => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('http://localhost:3001/demo');
      
      // Check that layout adapts properly
      await expect(page.locator('[data-testid="cognitive-inbox"]')).toBeVisible();
      await expect(page.locator('[data-testid="agent-activity"]')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Simulate network failure
      await page.route('**/api/**', route => route.abort());
      
      // Try to execute a scenario
      await page.click('text=Covenant Breach Alert');
      
      // Check for error message
      await expect(page.locator('text=Network error')).toBeVisible({ timeout: 10000 });
    });

    test('should show loading states', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Execute a scenario
      await page.click('text=Revenue Optimization');
      
      // Check for loading indicator
      await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
    });

    test('should handle API timeouts', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Simulate slow API response
      await page.route('**/api/**', route => {
        setTimeout(() => route.continue(), 10000);
      });
      
      // Execute a scenario
      await page.click('text=Maintenance Priority');
      
      // Check for timeout handling
      await expect(page.locator('text=Request timed out')).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Accessibility', () => {
    test('should be navigable with keyboard', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Check that focused element is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper ARIA labels', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Check for ARIA labels on important elements
      await expect(page.locator('[aria-label="Upload document"]')).toBeVisible();
      await expect(page.locator('[aria-label="Voice interface"]')).toBeVisible();
      await expect(page.locator('[aria-label="Cognitive inbox"]')).toBeVisible();
    });

    test('should have proper heading structure', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Check for proper heading hierarchy
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h2')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load within performance budget', async () => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:3001/demo');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have good Core Web Vitals', async () => {
      await page.goto('http://localhost:3001/demo');
      
      // Check for performance metrics (would need to implement actual measurement)
      // This is a placeholder for more sophisticated performance testing
      await page.waitForLoadState('networkidle');
      
      // In a real implementation, you'd measure:
      // - Largest Contentful Paint (LCP)
      // - First Input Delay (FID) 
      // - Cumulative Layout Shift (CLS)
    });
  });
});