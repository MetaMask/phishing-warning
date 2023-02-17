import type { Page } from '@playwright/test';

declare global {
  interface Window {
    logCall: (message: string, targetOrigin: string) => void;
    originalPostMessage: Window['postMessage'];
  }
}

/**
 * Mock `window.postMessage` to properly initialize the phishing warning streams, and log any
 * messages sent by the phishing warning page.
 *
 * The returned array will continue to grow over time as new logs are added.
 *
 * This is based on the "Mock Browser APIs" example in the Playwright documentation.
 *
 * @see {@link https://playwright.dev/docs/mock-browser-apis#verifying-api-calls}
 * @param page - The Playwright page object.
 * @returns An array of `postMessage` logs, excluding initialization.
 */
export async function setupStreamInitialization(
  page: Page,
): Promise<{ message: string; targetOrigin: string }[]> {
  const logs: { message: string; targetOrigin: string }[] = [];

  // This attaches a `logCall` function to `window` that will send a message to
  // Playwright to execute this function in the test runner Node.js process.
  await page.exposeFunction(
    'logCall',
    (message: string, targetOrigin: string) =>
      logs.push({ message, targetOrigin }),
  );

  // This function is executed in the browser, in the page under test
  await page.addInitScript(() => {
    window.originalPostMessage = window.postMessage.bind(window);
    window.postMessage = (message, targetOrigin) => {
      if (message?.target === 'metamask-contentscript') {
        if (message.data === 'SYN') {
          // The extension replies with "ACK" as part of establishing a connection
          window.originalPostMessage(
            { target: 'metamask-phishing-warning-page', data: 'ACK' },
            targetOrigin,
          );
          // The extension replies to "ACK" with another "ACK", which we can ignore
        } else if (message.data !== 'ACK') {
          window.logCall(message.data, targetOrigin);
        }
        console.log(`Called with ${JSON.stringify(message)}`);
      }
    };
  });

  return logs;
}
