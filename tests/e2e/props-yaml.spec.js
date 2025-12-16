import { test, expect } from '@playwright/test';

test.describe('Properties <-> YAML Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/convert/props-yaml');
  });

  test('should convert Properties to YAML', async ({ page }) => {
    const propsInput = 'server.port=8080\nspring.datasource.url=jdbc:mysql://localhost/db';
    // Select the textarea in the properties panel
    // Using simple selectors based on class structure
    await page.locator('.properties-panel textarea.editor').fill(propsInput);

    // Click Convert Properties to YAML
    // The button has a specific title
    await page.locator('button[title="Properties → YAML"]').click();

    // Verify YAML output
    // Verify YAML output
    const yamlOutput = page.locator('.yaml-panel textarea.editor');
    const expectedYaml = 'server:\n  port: 8080\nspring:\n  datasource:\n    url: jdbc:mysql://localhost/db\n';
    await expect(yamlOutput).toHaveValue(expectedYaml);

    // Check status
    await expect(page.locator('.properties-panel .status')).toContainText('轉換成功');
  });

  test('should convert YAML to Properties', async ({ page }) => {
    const yamlInput = `
server:
  port: 9090
app:
  name: test-app
`;
    await page.locator('.yaml-panel textarea.editor').fill(yamlInput);

    // Click Convert YAML to Properties
    await page.locator('button[title="YAML → Properties"]').click();

    // Verify Properties output
    const propsOutput = page.locator('.properties-panel textarea.editor');
    await expect(propsOutput).toHaveValue(/server\.port=9090/);
    await expect(propsOutput).toHaveValue(/app\.name=test-app/);

    // Check status
    await expect(page.locator('.yaml-panel .status')).toContainText('轉換成功');
  });
});
