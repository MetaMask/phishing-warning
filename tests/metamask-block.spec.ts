import { test, expect } from '@playwright/test';
import {
  defaultPhishingConfig,
  setupDefaultMocks,
} from './helpers/default-mocks';

test('directs users to eth-phishing-detect to dispute a block, including issue template parameters', async ({
  context,
  page,
}) => {
  await setupDefaultMocks(context, {
    phishingConfig: { ...defaultPhishingConfig, blacklist: ['test.com'] },
  });
  const querystring = new URLSearchParams({
    hostname: 'test.com',
    href: 'https://test.com',
  });
  await page.goto(`/#${querystring}`);

  await page.getByRole('link', { name: 'report a detection problem' }).click();
  // Wait for dynamic configuration check
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(
    'https://github.com/MetaMask/eth-phishing-detect/issues/new?title=[Legitimate%20Site%20Blocked]%20test.com&body=https%3A%2F%2Ftest.com%2F',
  );
});

test('correctly matches unicode domains', async ({ context, page }) => {
  await setupDefaultMocks(context, {
    phishingConfig: {
      ...defaultPhishingConfig,
      blacklist: ['xn--metamsk-en4c.io'],
    },
  });
  const url = 'https://metamạsk.io';
  const querystring = new URLSearchParams({
    hostname: url,
    href: url,
  });

  await page.goto(`/#${querystring}`);

  await page.getByRole('link', { name: 'report a detection problem' }).click();
  // Wait for dynamic configuration check
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(
    'https://github.com/MetaMask/eth-phishing-detect/issues/new?title=[Legitimate%20Site%20Blocked]%20metam%E1%BA%A1sk.io&body=https%3A%2F%2Fmetam%E1%BA%A1sk.io%2F',
  );
});

test('correctly matches unicode domains with path', async ({ context, page }) => {
  await setupDefaultMocks(context, {
    phishingConfig: {
      ...defaultPhishingConfig,
      blacklist: ['xn--metamsk-en4c.io'],
    },
  });
  const url = 'https://metamạsk.io/somepath?query=string';
  const querystring = new URLSearchParams({
    hostname: url,
    href: url,
  });

  await page.goto(`/#${querystring}`);

  await page.getByRole('link', { name: 'report a detection problem' }).click();
  // Wait for dynamic configuration check
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(
    'https://github.com/MetaMask/eth-phishing-detect/issues/new?title=[Legitimate%20Site%20Blocked]%20metam%E1%BA%A1sk.io&body=https%3A%2F%2Fmetam%E1%BA%A1sk.io%2F',
  );
});
