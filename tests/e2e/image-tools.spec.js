import { test, expect } from '@playwright/test';

test.describe('Image Tools', () => {

    test.describe('Image to Base64', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/image/base64');
        });

        test('should upload image and generate base64', async ({ page }) => {
            // Create a dummy image buffer (1x1 PNG)
            const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

            // Upload file
            // Note: We need to point to the input element that accepts files.
            // In Vue component: <input type="file" accept="image/*" multiple hidden @change="handleFileUpload">
            // It is hidden, but Playwright setInputFiles handles this usually if we target it or its label.
            // However, usually it's safer to target the input directly even if hidden.
            await page.locator('.section-actions input[type="file"]').setInputFiles({
                name: 'test-image.png',
                mimeType: 'image/png',
                buffer: buffer
            });

            // Assert preview appears
            await expect(page.locator('.image-preview-item')).toBeVisible();
            await expect(page.locator('.preview-filename')).toHaveText('test-image.png');

            // Assert Base64 output is present
            // The output-text inputs are readonly
            const dataUrlInput = page.locator('.output-row:has-text("Data URL") input');
            await expect(dataUrlInput).toHaveValue(/data:image\/png;base64,.+/);
        });
    });

    test.describe('OCR Recognition', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/image/ocr');
        });

        test('should upload image and start processing', async ({ page }) => {
            // This test mainly verifies the UI flow, as actual OCR (Tesseract.js) might be slow or flaky in headless/CI without proper trained data caching or might not run fully.
            // We'll verify the file is accepted and the list item is created.

            const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

            await page.locator('.section-actions input[type="file"]').setInputFiles({
                name: 'ocr-test.png',
                mimeType: 'image/png',
                buffer: buffer
            });

            // Verify item appears in list
            await expect(page.locator('.image-preview-item')).toBeVisible();
            await expect(page.locator('.preview-filename')).toHaveText('ocr-test.png');

            // Check for processing state or result
            // The preview output initially is empty or "(辨識中...)"
            // Depending on speed, it might finish or stay processing.
            // We assume at least the item is added.
            // We can check if "progress-container" shows up or status changes.

            // If Tesseract load fails (network), it might show error toast.
            // But we just want to ensure the upload flow works.

            // We don't check status strictly as it depends on network (Tesseract download)
            // Just ensure the UI reacted to the file upload.
            const resultItem = page.locator('.image-preview-item').first();
            await expect(resultItem).toBeVisible();
        });
    });
});
