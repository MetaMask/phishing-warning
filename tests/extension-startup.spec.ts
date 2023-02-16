import { test, expect } from '@playwright/test';
import { setupDefaultMocks } from './helpers/default-mocks';

test.beforeEach(async ({ context }) => {
  await setupDefaultMocks(context);
});

test('logs that the service worker is registered', async ({ page }) => {
  const infoLogs: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'log') {
      infoLogs.push(message.text());
    }
  });
  const expectedMessage = 'Service worker registered!';

  await page.goto('/#extensionStartup');
  await page.waitForLoadState('networkidle');

  expect(infoLogs.length).toBe(1);
  expect(infoLogs[0]).toMatch(expectedMessage);
});

test('does not throw any error', async ({ page }) => {
  const errorLogs: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errorLogs.push(message.text());
    }
  });

  await page.goto('/#extensionStartup');

  expect(errorLogs.length).toBe(0);
});
