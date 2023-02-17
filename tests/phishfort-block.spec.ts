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
    newIssueUrl: 'https://github.com/phishfort/phishfort-lists/issues/new',
  });
  await page.goto(`/#${querystring}`);

  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'report a detection problem' }).click();
  const popup = await popupPromise;

  await expect(popup).toHaveURL(
    'https://github.com/phishfort/phishfort-lists/issues/new?title=[Legitimate%20Site%20Blocked]%20test.com&body=https%3A%2F%2Ftest.com',
  );
});

test('credits PhishFort for the block', async ({ page }) => {
  const querystring = new URLSearchParams({
    hostname: 'test.com',
    href: 'https://test.com',
    newIssueUrl: 'https://github.com/phishfort/phishfort-lists/issues/new',
  });
  await page.goto(`/#${querystring}`);

  await expect(page.locator('css=#detection-repo')).toHaveText('PhishFort');
});
