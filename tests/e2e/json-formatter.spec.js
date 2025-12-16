import { test, expect } from '@playwright/test';

test.describe('JSON Formatter', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/format/json');
    });

    test('should format valid JSON', async ({ page }) => {
        const input = '{"name":"test","value":123}';
        const expected = '{\n  "name": "test",\n  "value": 123\n}';

        // Assuming there is a textarea for input. We might need to inspect the DOM to find specific selectors.
        // Generally looking for a textarea or an editor.
        // Let's assume standard textarea or a div with class 'editor' or similar. 
        // I'll use a locator that likely targets the input area.

        // If it's a code editor (like Monaco/CodeMirror), 'fill' might not work directly.
        // But let's try generic selectors first.
        // Given the previous task history mentioned "JSON formatter that accepts pasted content", 
        // let's look for a textarea.
        await page.locator('textarea').first().fill(input);

        // Click format button
        await page.locator('.btn.primary').click();

        // Check output. Assuming output is in the same textarea or a second one.
        // If it's a single pane formatter, the value updates.
        // If it's dual pane, check the second one.
        // Let's wait for component inspection or assume a standard behavior.
        // For now, I will assume the value in the textarea changes.

        await expect(page.locator('textarea').first()).toHaveValue(expected);
    });

    test('should show error for invalid JSON', async ({ page }) => {
        const input = '{"name": "broken"'; // Missing closing brace
        await page.locator('textarea').first().fill(input);
        await page.locator('.btn.primary').click();

        // Expect error message
        // Usually an alert or a red text.
        // Check if error panel has 'show' class which controls visibility and is visible
        const errorPanel = page.locator('.error-panel');
        await expect(errorPanel).toHaveClass(/show/);
        await expect(errorPanel).toBeVisible();
        await expect(page.locator('.error-title')).toContainText('JSON 格式錯誤');
    });
});
