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
 * @param page - The Playwright page object.
 * @returns An array of `postMessage` logs, excluding initialization.
 */
export async function setupStreamInitialization(
  page: Page,
): Promise<{ message: string; targetOrigin: string }[]> {
  const logs: { message: string; targetOrigin: string }[] = [];

  await page.exposeFunction(
    'logCall',
    (message: string, targetOrigin: string) =>
      logs.push({ message, targetOrigin }),
  );

  await page.addInitScript(() => {
    window.originalPostMessage = window.postMessage.bind(window);
    window.postMessage = (message, targetOrigin) => {
      if (message?.target === 'metamask-contentscript') {
        if (message.data === 'SYN') {
          window.originalPostMessage(
            { target: 'metamask-phishing-warning-page', data: 'ACK' },
            targetOrigin,
          );
        } else if (message.data !== 'ACK') {
          window.logCall(message.data, targetOrigin);
        }
        console.log(`Called with ${JSON.stringify(message)}`);
      }
    };
  });

  return logs;
}
