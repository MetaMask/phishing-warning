import { test, expect } from '@playwright/test';
import { setupDefaultMocks } from './helpers/default-mocks';
import { setupStreamInitialization } from './helpers/stream-initialization';

test.beforeEach(async ({ context }) => {
  await setupDefaultMocks(context);
});

test('throws an error about the href query parameter being invalid', async ({
  context,
  page,
}) => {
  const errorLogs: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errorLogs.push(message.text());
    }
  });
  const querystring = new URLSearchParams({ hostname: 'example.com' });

  await page.goto(`/#${querystring}`);

  expect(errorLogs.length).toBe(1);
  const browserName = context.browser()?.browserType().name();
  expect(errorLogs[0]).toMatch(
    browserName === 'firefox'
      ? 'Error' // for some reason the message is missing on Firefox
      : `Error: Invalid 'href' query parameter`,
  );
});

test('ignores attempts to dispute a block', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'report a detection problem' }).click();
  // Wait for dynamic configuration check
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL('/#');
});

test('does not allow user to bypass warning for invalid protocols', async ({
  page,
}) => {
  const postMessageLogs = await setupStreamInitialization(page);
  const infoLogs: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'log') {
      infoLogs.push(message.text());
    }
  });
  const querystring = new URLSearchParams({
    hostname: 'evil.com',
    // eslint-disable-next-line no-script-url
    href: 'javascript:console.log("test")',
  });
  const url = `/#${querystring}`;
  await page.goto(url);

  await page.locator('css=#unsafe-continue').click();

  await expect(page).toHaveURL(url);
  expect(
    infoLogs.some((log) =>
      log.includes('Disallowed Protocol, cannot continue.'),
    ),
  ).toBe(true);
  expect(postMessageLogs).toStrictEqual([]);
});
