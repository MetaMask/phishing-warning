import { test, expect } from '@playwright/test';
import { setupDefaultMocks } from './helpers/default-mocks';
import { setupStreamInitialization } from './helpers/stream-initialization';

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
    'Listed on the blocklists of SEAL, ChainPatrol, or MetaMask',
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

test('redirects when the user clicks "Back to safety"', async ({ page }) => {
  const postMessageLogs = await setupStreamInitialization(page);
  const querystring = new URLSearchParams({
    href: 'https://test.com',
  });
  await page.goto(`/#${querystring}`);

  await page.getByRole('button', { name: 'Back to safety' }).click();
  await expect(postMessageLogs.length).toBe(1);
  await expect(postMessageLogs[0].message).toStrictEqual({
    data: {
      id: expect.any(Number),
      jsonrpc: '2.0',
      method: 'backToSafetyPhishingWarning',
      params: [],
    },
    name: 'metamask-phishing-safelist',
  });
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

test('redirects to X share page when clicked', async ({ page }) => {
  await page.goto('/');

  const [newPage] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByRole('link', {
        name: 'If you found this helpful, click here to share on X!',
      })
      .click(),
  ]);

  await expect(newPage).toHaveURL(
    'https://twitter.com/intent/tweet?text=MetaMask%20just%20protected%20me%20from%20a%20phishing%20attack!%20Remember%20to%20always%20stay%20vigilant%20when%20clicking%20on%20links.%20Learn%20more%20at&url=https://metamask.io',
  );
});
