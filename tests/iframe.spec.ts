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
      <iframe id="embedded-warning" src="${url}"></iframe>
    </body>
  </html>`;
}

const validQueryParams = new URLSearchParams({
  hostname: 'test.com',
  href: 'https://test.com',
});

const test = base.extend({
  page: async ({ baseURL, page }, use) => {
    await page.setContent(getPageWithIframe(`${baseURL}/#${validQueryParams}`));
    await use(page);
  },
});

const testWithInvalidInputs = base.extend({
  page: async ({ baseURL, page }, use) => {
    await page.setContent(getPageWithIframe(`${baseURL}/#`));
    await use(page);
  },
});

test.beforeEach(async ({ context }) => {
  await setupDefaultMocks(context);
});

test('does not allow the user to bypass the warning', async ({ page }) => {
  await expect(await page.getByRole('button').all()).toStrictEqual([]);
  await expect(await page.getByRole('checkbox').all()).toStrictEqual([]);
  await expect(await page.getByRole('combobox').all()).toStrictEqual([]);
  await expect(await page.getByRole('link').all()).toStrictEqual([]);
});

test('does not link to any external page', async ({ page }) => {
  await expect(await page.getByRole('link').all()).toStrictEqual([]);
});

test('opens the warning in a new tab with valid inputs preserved', async ({
  page,
}) => {
  const openInNewTab = await page
    .frameLocator('#embedded-warning')
    .getByRole('link', {
      name: 'Open this warning in a new tab',
    });
  await openInNewTab.scrollIntoViewIfNeeded();

  const popupPromise = page.waitForEvent('popup');
  await openInNewTab.click();
  const popup = await popupPromise;

  await expect(popup).toHaveTitle('MetaMask Phishing Detection');
  await expect(popup).toHaveURL(`/#${validQueryParams}`);
});

testWithInvalidInputs(
  'opens the warning in a new tab with invalid inputs preserved',
  async ({ page }) => {
    const openInNewTab = await page
      .frameLocator('#embedded-warning')
      .getByRole('link', {
        name: 'Open this warning in a new tab',
      });
    await openInNewTab.scrollIntoViewIfNeeded();

    const popupPromise = page.waitForEvent('popup');
    await openInNewTab.click();
    const popup = await popupPromise;

    await expect(popup).toHaveTitle('MetaMask Phishing Detection');
    await expect(popup).toHaveURL('/#');
  },
);
