import { test, expect } from '@playwright/test';
import { setupDefaultMocks } from './helpers/default-mocks';

test('directs users to eth-phishing-detect to dispute a block, including issue template parameters', async ({
  context,
  page,
}) => {
  await setupDefaultMocks(context, { phishingError: true });
  const querystring = new URLSearchParams({
    hostname: 'test.com',
    href: 'https://test.com',
  });
  await page.goto(`/#${querystring}`);

  await page.getByRole('link', { name: 'report a detection problem' }).click();
  // Wait for dynamic configuration check
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(
    'https://github.com/MetaMask/eth-phishing-detect/issues/new?title=[Legitimate%20Site%20Blocked]%20https%3A%2F%2Ftest.com&body=https%3A%2F%2Ftest.com',
  );
});
