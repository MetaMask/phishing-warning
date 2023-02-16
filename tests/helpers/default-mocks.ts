const emptyHtmlPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>title</title>
  </head>
  <body>
  </body>
</html>`;

/**
 * Setup default network mocks for Playwright tests.
 *
 * @param context - The browsing context.
 */
export async function setupDefaultMocks(context) {
  await context.route('https://github.com/**/*', (route) =>
    route.fulfill({
      body: emptyHtmlPage,
      contentType: 'text/html',
    }),
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
