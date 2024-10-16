import { test, expect } from '@playwright/test';
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
    page.getByRole('heading', { name: 'This website might be harmful' }),
  ).toBeVisible();
});

test('shows a blank suspect link', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('css=#suspect-link')).toBeEmpty();
});

test('shows an empty list of detection projects', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#detection-repo')).toHaveText(
    'Ethereum Phishing Detector, SEAL, ChainPatrol, and PhishFort.',
  );
});

test('does nothing when the user tries to bypass the warning', async ({
  page,
}) => {
  await page.goto('/');

  await page.locator('css=#unsafe-continue').click();

  await expect(page).toHaveURL('/');
  await expect(page.isClosed()).toBe(false);
});

test('redirects when the user clicks "My Portfolio"', async ({ page }) => {
  const querystring = new URLSearchParams({
    href: 'https://test.com',
  });
  await page.goto(`/#${querystring}`);

  // Click the "My Portfolio" button
  await page.getByRole('button', { name: 'My Portfolio' }).click();

  // Increase the timeout to 60 seconds
  await page.waitForURL(
    'https://portfolio.metamask.io/?metamaskEntry=phishing_page_portfolio_button&marketingEnabled=true',
    { timeout: 10000 },
  );

  // Ensure the final URL matches the expected portfolio page
  await expect(page.url()).toBe(
    'https://portfolio.metamask.io/?metamaskEntry=phishing_page_portfolio_button&marketingEnabled=true',
  );
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
