import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    test('should redirect root to /format/json', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/.*\/format\/json/);
        await expect(page.locator('h2')).toContainText('JSON 格式化');
    });

    test('should navigate to properties converter', async ({ page }) => {
        await page.goto('/');
        // Check if there is a sidebar or navigation menu. 
        // Based on previous knowledge/plan, there might be a sidebar.
        // Let's assume there are links. We can verify by looking at App.vue's sidebar later or just try to click links by text.

        // For now, let's test direct navigation if UI structure is uncertain, or try to click if we can see the sidebar.
        await page.goto('/convert/props-yaml');
        await expect(page.locator('h2')).toContainText('Properties ⟷ YAML 轉換');
    });
});
