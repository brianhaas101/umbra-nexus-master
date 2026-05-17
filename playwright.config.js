/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './tests/browser',
  testMatch: '**/*.spec.js',
  timeout: 30000,
  use: {
    browserName: 'chromium',
    headless: true
  }
};
