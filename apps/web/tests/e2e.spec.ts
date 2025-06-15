import { test, expect } from '@playwright/test';

test.describe('Zaqathon E2E Tests', () => {
  test('should display orders on homepage', async ({ page }) => {
    // Start from the index page
    await page.goto('http://localhost:3000');
    
    // Check for main heading
    await expect(page.locator('h1')).toContainText('Zaqathon');
    
    // Should have order cards section
    await expect(page.locator('text=Recent Orders')).toBeVisible();
  });

  test('should navigate to order details', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for orders to load and click on first order if available
    await page.waitForSelector('[data-testid="order-item"]', { timeout: 10000 });
    
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    if (await firstOrder.count() > 0) {
      await firstOrder.click();
      
      // Should navigate to order details page
      await expect(page.url()).toMatch(/\/orders\/[a-f0-9-]+/);
      await expect(page.locator('text=Order Details')).toBeVisible();
    }
  });

  test('should download PDF when available', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Navigate to first order
    await page.waitForSelector('[data-testid="order-item"]', { timeout: 10000 });
    const firstOrder = page.locator('[data-testid="order-item"]').first();
    
    if (await firstOrder.count() > 0) {
      await firstOrder.click();
      
      // Look for download button
      const downloadButton = page.locator('text=Download PDF');
      if (await downloadButton.isVisible()) {
        // Set up download promise
        const downloadPromise = page.waitForEvent('download');
        
        // Click download
        await downloadButton.click();
        
        // Wait for download
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/order-.*\.pdf/);
      }
    }
  });
});
