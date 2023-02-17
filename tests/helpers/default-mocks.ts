import type { BrowserContext } from '@playwright/test';

const emptyHtmlPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>title</title>
  </head>
  <body>
  </body>
</html>`;

export const defaultPhishingConfig: {
  version: number;
  tolerance: number;
  fuzzylist: string[];
  whitelist: string[];
  blacklist: string[];
} = {
  version: 2,
  tolerance: 2,
  fuzzylist: [],
  whitelist: [],
  blacklist: [],
};

/**
 * Setup default network mocks for Playwright tests.
 *
 * @param context - The browsing context.
 * @param options - Additional mock options.
 * @param options.phishingConfig - The phishing configuration to return.
 * @param options.phishingError - Whether to return an error for the phishing configuration.
 */
export async function setupDefaultMocks(
  context: BrowserContext,
  { phishingConfig = defaultPhishingConfig, phishingError = false } = {},
) {
  await context.route('https://github.com/**/*', (route) =>
    route.fulfill({
      body: emptyHtmlPage,
      contentType: 'text/html',
    }),
  );

  await context.route(
    'https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/config.json',
    (route) =>
      route.fulfill(
        phishingError
          ? { status: 500 }
          : {
              json: phishingConfig,
            },
      ),
  );

  await context.route('https://cryptoscamdb.org/**/*', (route) =>
    route.fulfill({
      body: emptyHtmlPage,
      contentType: 'text/html',
    }),
  );

  await context.route('https://test.com/**/*', (route) =>
    route.fulfill({
      body: emptyHtmlPage,
      contentType: 'text/html',
    }),
  );
}
