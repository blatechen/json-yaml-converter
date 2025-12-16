import { test, expect } from '@playwright/test';

test.describe('JSON to POJO Converter', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/convert/json-pojo');
    });

    test('should convert JSON to Java POJO', async ({ page }) => {
        const jsonInput = '{"id": 1, "userName": "testUser"}';

        await page.locator('.input-panel textarea.editor').fill(jsonInput);

        // Click Convert button (primary button)
        await page.locator('button.btn.primary').click();

        // Verify Output
        const output = page.locator('.output-panel pre.editor');
        await expect(output).toContainText('public class MyClass');
        await expect(output).toContainText('private Integer id;');
        await expect(output).toContainText('private String userName;');

        // Check status
        await expect(page.locator('.status.success')).toContainText('轉換成功');
    });

    test('should handle invalid JSON', async ({ page }) => {
        await page.locator('.input-panel textarea.editor').fill('{invalid');
        await page.locator('button.btn.primary').click();

        await expect(page.locator('.status.error')).toContainText('轉換失敗');
    });
});
