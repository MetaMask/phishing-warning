import { test as base, expect } from '@playwright/test';
import { setupDefaultMocks } from './helpers/default-mocks';

/**
 * Return the markup for a basic HTML page that includes an iframe.
 *
 * @param url - The URL of the iframe.
 * @returns The markup for a page including the iframe.
 */
function getPageWithIframe(url?: string) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="utf-8">
      <title>title</title>
    </head>
    <body>
      <iframe src="${url}"></iframe>
    </body>
  </html>`;
}

export const test = base.extend({
  page: async ({ baseURL, page }, use) => {
    await page.setContent(getPageWithIframe(baseURL));
    await use(page);
  },
});

test.beforeEach(async ({ context }) => {
  await setupDefaultMocks(context);
});

test('does not render any buttons or links', async ({ page }) => {
  await expect(await page.getByRole('button').all()).toStrictEqual([]);
  await expect(await page.getByRole('link').all()).toStrictEqual([]);
});
