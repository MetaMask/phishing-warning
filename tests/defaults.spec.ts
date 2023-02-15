import { test, expect } from '@playwright/test';
import config from '../playwright.config';
import { setupDefaultMocks } from './helpers/default-mocks';

test.beforeEach(async ({ context }) => {
  await setupDefaultMocks(context);
});

test('has title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('MetaMask Phishing Detection');
});

test('renders the title', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Deceptive site ahead' }),
  ).toBeVisible();
});

test('shows a blank suspect link', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('css=#suspect-link')).toBeEmpty();
});

test('shows an empty list of detection projects', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('css=#detection-repo')).toHaveText(
    'Ethereum Phishing Detector and PhishFort',
  );
});

test('opens CryptoScamDB in a new tab', async ({ page }) => {
  await page.goto('/');

  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Learn more' }).click();
  const popup = await popupPromise;

  await expect(popup).toHaveURL('https://cryptoscamdb.org/search');
});

test('does nothing when the user tries to bypass the warning', async ({
  page,
}) => {
  await page.goto('/');

  await page.locator('css=#unsafe-continue').click();

  await expect(page).toHaveURL('/');
  await expect(page.isClosed()).toBe(false);
});

test('closes the window when the user clicks "Back to safety"', async ({
  page,
}) => {
  // Calling `replace` here instead of `goto` to ensure that the page loads with a browser history
  // of length 1. Using `goto` would result in a length of 2, because Playwright starts each page
  // on `about:blank`.
  // We need a 1-length history so that the browser allows `window.close()` to work.
  const baseURL = config.use?.baseURL;
  await page.evaluate((url) => window.location.replace(url), `${baseURL}/`);

  const onClose = page.waitForEvent('close');
  await page.getByRole('button', { name: 'Back to safety' }).click();

  await onClose;
});

test('logs that the service worker is registered', async ({ page }) => {
  const infoLogs: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'log') {
      infoLogs.push(message.text());
    }
  });
  const expectedMessage = 'Service worker registered!';

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(infoLogs.length).toBe(1);
  expect(infoLogs[0]).toMatch(expectedMessage);
});
