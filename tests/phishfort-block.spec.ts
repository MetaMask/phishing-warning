import { test, expect } from '@playwright/test';
import { setupDefaultMocks } from './helpers/default-mocks';

test.beforeEach(async ({ context }) => {
  await setupDefaultMocks(context);
});

test('directs users to PhishFort to dispute a block, including issue template parameters', async ({
  page,
}) => {
  const querystring = new URLSearchParams({
    hostname: 'test.com',
    href: 'https://test.com',
  });
  await page.goto(`/#${querystring}`);

  await page.getByRole('link', { name: 'report a detection problem' }).click();
  // Wait for dynamic configuration check
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(
    'https://github.com/phishfort/phishfort-lists/issues/new?title=[Legitimate%20Site%20Blocked]%20test.com&body=https%3A%2F%2Ftest.com%2F',
  );
});
