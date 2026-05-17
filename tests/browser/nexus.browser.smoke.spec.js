const { test, expect } = require('@playwright/test');

test('Nexus browser automation smoke test', async ({ page }) => {
  await page.setContent(`
    <!doctype html>
    <html>
      <head><title>Nexus Smoke</title></head>
      <body>
        <main id="nexus-root" data-runtime="locked">
          <h1>Nexus Browser Smoke Test</h1>
          <p id="status">browser-ready</p>
        </main>
      </body>
    </html>
  `);

  await expect(page.locator('#nexus-root')).toHaveAttribute('data-runtime', 'locked');
  await expect(page.locator('#status')).toHaveText('browser-ready');
});
