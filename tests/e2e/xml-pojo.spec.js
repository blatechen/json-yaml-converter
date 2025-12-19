import { test, expect } from '@playwright/test';

test.describe('XML to POJO Converter', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/convert/xml-pojo');
    });

    test('should convert XML to Java POJO (Traditional)', async ({ page }) => {
        const xmlInput = '<user id="1"><userName>testUser</userName></user>';

        await page.locator('.input-panel textarea.editor').fill(xmlInput);

        // Click Convert button (primary button)
        await page.locator('button.btn.primary').click();

        // Verify Output
        const output = page.locator('.output-panel pre.editor');
        await expect(output).toContainText('public class User');
        await expect(output).toContainText('private String id;');
        await expect(output).toContainText('private String userName;');
    });

    test('should convert XML to JAXB POJO', async ({ page }) => {
        const xmlInput = '<user id="1"><userName>testUser</userName></user>';

        await page.locator('.input-panel textarea.editor').fill(xmlInput);

        // Select JAXB style
        await page.locator('.style-select select').selectOption('jaxb');

        // Click Convert button
        await page.locator('button.btn.primary').click();

        // Verify Output for JAXB annotations
        const output = page.locator('.output-panel pre.editor');
        await expect(output).toContainText('import javax.xml.bind.annotation.*;');
        await expect(output).toContainText('@XmlRootElement(name = "user")');
        // id should be an attribute
        await expect(output).toContainText('@XmlAttribute(name = "id")');
        // userName should be an element
        await expect(output).toContainText('@XmlElement(name = "userName")');

        await expect(page.locator('.status.success')).toContainText('轉換成功');
    });

    test('should handle invalid XML', async ({ page }) => {
        await page.locator('.input-panel textarea.editor').fill('<invalid');
        await page.locator('button.btn.primary').click();

        await expect(page.locator('.status.error')).toContainText('轉換失敗');
    });
});
