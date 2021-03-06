import { readFileSync } from 'fs';
import path from 'path';
import { queryByText } from '@testing-library/dom';

import { BASE_URL } from '../test/constants';

const phishingHtml = readFileSync(
  path.resolve(__dirname, '..', 'static', 'index.html'),
  {
    encoding: 'utf8',
  },
);

/**
 * Returns a URL for the phishing warning page. Optionally a hostname and an
 * href can be included in the URL, encoded as a query string but included in
 * the "hash"/fragment portion of the URL.
 *
 * @param hostname - The hostname to include in the URL fragment.
 * @param href - The href to include in the URL fragment.
 * @param newIssueUrl - Optional, the url for the new issue link
 * to include in in the URL fragment.
 * @returns The phishing warning page URL.
 */
function getUrl(hostname?: string, href?: string, newIssueUrl?: string) {
  if (hostname && href && newIssueUrl) {
    return `${BASE_URL}hostname=${encodeURIComponent(
      hostname,
    )}&href=${encodeURIComponent(href)}&newIssueUrl=${encodeURIComponent(
      newIssueUrl,
    )}`;
  } else if (hostname && href) {
    return `${BASE_URL}hostname=${encodeURIComponent(
      hostname,
    )}&href=${encodeURIComponent(href)}`;
  } else if (hostname) {
    return `${BASE_URL}hostname=${encodeURIComponent(hostname)}`;
  } else if (href) {
    return `${BASE_URL}href=${encodeURIComponent(href)}`;
  }
  return BASE_URL;
}

describe('Phishing warning page', () => {
  let onDomContentLoad: EventListener | undefined;

  beforeAll(async () => {
    jest
      .spyOn(window.document, 'addEventListener')
      .mockImplementation(
        (event: string, eventHandler: EventListenerOrEventListenerObject) => {
          if (
            event === 'DOMContentLoaded' &&
            typeof eventHandler === 'function'
          ) {
            onDomContentLoad = eventHandler;
          }
        },
      );
    await import('./index');
  });

  beforeEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = phishingHtml;
  });

  afterEach(() => {
    // onDomContentLoad = undefined;
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  it('should render page', async () => {
    const container = window.document.getElementsByTagName('body')[0];
    expect(
      queryByText(container, 'MetaMask Phishing Detection'),
    ).not.toBeNull();
  });

  it('should have correct default "New issue" link', () => {
    const newIssueLink = window.document.getElementById('new-issue-link');
    expect(newIssueLink?.getAttribute('href')).toBe(
      'https://github.com/metamask/eth-phishing-detect/issues/new',
    );
  });

  it('should correctly construct "New issue" link', async () => {
    window.document.location.href = getUrl(
      'example.com',
      'https://example.com',
    );

    // non-null assertion used because TypeScript doesn't know the event handler was run
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    onDomContentLoad!(new Event('DOMContentLoaded'));

    const newIssueLink = window.document.getElementById('new-issue-link');
    expect(newIssueLink?.getAttribute('href')).toBe(
      'https://github.com/MetaMask/eth-phishing-detect/issues/new?title=[Legitimate%20Site%20Blocked]%20example.com&body=https%3A%2F%2Fexample.com',
    );
  });

  it('should have the correct "New issue" link if a newIssueUrl is specified in the hash query string', async () => {
    window.document.location.href = getUrl(
      'example.com',
      'https://example.com',
      'https://example.com',
    );

    // non-null assertion used because TypeScript doesn't know the event handler was run
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    onDomContentLoad!(new Event('DOMContentLoaded'));

    const newIssueLink = window.document.getElementById('new-issue-link');
    expect(newIssueLink?.getAttribute('href')).toBe(
      'https://example.com?title=[Legitimate%20Site%20Blocked]%20example.com&body=https%3A%2F%2Fexample.com',
    );
  });

  it.todo(
    'should add site to safelist when the user continues at their own risk',
  );

  it.todo(
    'should redirect to the site after the user continues at their own risk',
  );

  it('should show a different message if the URL contains an unsupported protocol', async () => {
    window.document.location.href = getUrl(
      'example.com',
      // eslint-disable-next-line no-script-url
      'javascript:alert("example")',
    );

    await import('./index');
    // non-null assertion used because TypeScript doesn't know the event handler was run
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    onDomContentLoad!(new Event('DOMContentLoaded'));

    const redirectWarningMessage = window.document.getElementById(
      'redirect-warning-message',
    );
    expect(redirectWarningMessage?.innerText).toBe(
      "This URL does not use a supported protocol so we won't give you the option to skip this warning.",
    );
  });

  it('should throw an error if the hostname is missing', async () => {
    window.document.location.href = getUrl(undefined, 'https://example.com');

    // non-null assertion used because TypeScript doesn't know the event handler was run
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(() => onDomContentLoad!(new Event('DOMContentLoaded'))).toThrow(
      "Missing 'hostname' query parameter",
    );
  });

  it('should throw an error if the href is missing', async () => {
    window.document.location.href = getUrl('example.com');

    // non-null assertion used because TypeScript doesn't know the event handler was run
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(() => onDomContentLoad!(new Event('DOMContentLoaded'))).toThrow(
      "Missing 'href' query parameter",
    );
  });

  it('should throw an error if the new issue link is missing', async () => {
    window.document.location.href = getUrl(
      'example.com',
      'https://example.com',
    );
    const newIssueLink = document.getElementById('new-issue-link');
    if (!newIssueLink) {
      throw new Error('Unable to locate new issue link');
    }
    newIssueLink.remove();

    // non-null assertion used because TypeScript doesn't know the event handler was run
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(() => onDomContentLoad!(new Event('DOMContentLoaded'))).toThrow(
      'Unable to locate new issue link',
    );
  });

  it('should throw an error if the continue link is missing', async () => {
    window.document.location.href = getUrl(
      'example.com',
      'https://example.com',
    );
    const continueLink = document.getElementById('unsafe-continue');
    if (!continueLink) {
      throw new Error('Unable to locate unsafe continue link');
    }
    continueLink.remove();

    // non-null assertion used because TypeScript doesn't know the event handler was run
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(() => onDomContentLoad!(new Event('DOMContentLoaded'))).toThrow(
      'Unable to locate unsafe continue link',
    );
  });
});
