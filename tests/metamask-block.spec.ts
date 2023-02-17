import { test, expect } from '@playwright/test';
import { setupDefaultMocks } from './helpers/default-mocks';

test.beforeEach(async ({ context }) => {
  await setupDefaultMocks(context);
});

test('directs users to eth-phishing-detect to dispute a block, including issue template parameters', async ({
  page,
}) => {
  const querystring = new URLSearchParams({
    hostname: 'test.com',
    href: 'https://test.com',
    newIssueUrl: 'https://github.com/MetaMask/eth-phishing-detect/issues/new',
  });
  await page.goto(`/#${querystring}`);

  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'report a detection problem' }).click();
  const popup = await popupPromise;

  await expect(popup).toHaveURL(
    'https://github.com/MetaMask/eth-phishing-detect/issues/new?title=[Legitimate%20Site%20Blocked]%20test.com&body=https%3A%2F%2Ftest.com',
  );
});

test('credits Ethereum Phishing Detector for the block', async ({ page }) => {
  const querystring = new URLSearchParams({
    hostname: 'test.com',
    href: 'https://test.com',
    newIssueUrl: 'https://github.com/MetaMask/eth-phishing-detect/issues/new',
  });
  await page.goto(`/#${querystring}`);

  await expect(page.locator('css=#detection-repo')).toHaveText(
    'Ethereum Phishing Detector',
  );
});
