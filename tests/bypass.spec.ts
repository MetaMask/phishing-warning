import { test, expect } from '@playwright/test';
import { setupDefaultMocks } from './helpers/default-mocks';
import { setupStreamInitialization } from './helpers/stream-initialization';

test.beforeEach(async ({ context }) => {
  await setupDefaultMocks(context);
});

test('allows the user to bypass the warning and add the site origin to the allowlist', async ({
  page,
}) => {
  const postMessageLogs = await setupStreamInitialization(page);
  const querystring = new URLSearchParams({
    href: 'https://test.com',
  });
  await page.goto(`/#${querystring}`);

  await page.locator('css=#unsafe-continue').click();

  await expect(page).toHaveURL('https://test.com');
  await expect(postMessageLogs.length).toBe(1);
  await expect(postMessageLogs[0].message).toStrictEqual({
    data: {
      id: expect.any(Number),
      jsonrpc: '2.0',
      method: 'safelistPhishingDomain',
      params: ['https://test.com/'],
    },
    name: 'metamask-phishing-safelist',
  });
});

test('allows the user to bypass the warning with URL path and sends full href', async ({
  page,
}) => {
  const postMessageLogs = await setupStreamInitialization(page);
  const testUrl = 'https://test-phishing-domain.invalid/path';
  const hashParams = new URLSearchParams({
    href: testUrl,
  });

  await page.goto(`/#${hashParams}`);
  await page.locator('css=#unsafe-continue').click();

  await expect(postMessageLogs.length).toBe(1);
  await expect(postMessageLogs[0].message).toStrictEqual({
    data: {
      id: expect.any(Number),
      jsonrpc: '2.0',
      method: 'safelistPhishingDomain',
      params: [testUrl],
    },
    name: 'metamask-phishing-safelist',
  });
});

test('allows bypass with complex URL including query parameters and fragments', async ({
  page,
}) => {
  const postMessageLogs = await setupStreamInitialization(page);
  const complexUrl =
    'https://test-complex.invalid/path?param=value&other=test#section';
  const hashParams = new URLSearchParams({
    href: complexUrl,
  });

  await page.goto(`/#${hashParams}`);
  await page.locator('css=#unsafe-continue').click();

  await expect(postMessageLogs.length).toBe(1);
  await expect(postMessageLogs[0].message).toStrictEqual({
    data: {
      id: expect.any(Number),
      jsonrpc: '2.0',
      method: 'safelistPhishingDomain',
      params: [complexUrl],
    },
    name: 'metamask-phishing-safelist',
  });
});
