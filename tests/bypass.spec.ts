import { test, expect } from '@playwright/test';
import { setupDefaultMocks } from './helpers/default-mocks';
import { setupStreamInitialization } from './helpers/stream-initialization';

test.beforeEach(async ({ context }) => {
  await setupDefaultMocks(context);
});

test('allows the user to bypass the warning and add the site to the allowlist', async ({
  page,
}) => {
  const postMessageLogs = await setupStreamInitialization(page);
  const querystring = new URLSearchParams({
    hostname: 'test.com',
    href: 'https://test.com',
  });
  await page.goto(`/#${querystring}`);

  await page.locator('css=#unsafe-continue').click();

  await expect(page).toHaveURL('https://test.com');
  await expect(postMessageLogs.length).toBe(1);
  await expect([postMessageLogs[0].message]).toStrictEqual([
    {
      data: {
        id: expect.any(Number),
        jsonrpc: '2.0',
        method: 'safelistPhishingDomain',
        params: ['test.com'],
      },
      name: 'metamask-phishing-safelist',
    },
  ]);
});
