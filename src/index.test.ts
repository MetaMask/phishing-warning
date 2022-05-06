import { readFileSync } from 'fs';
import path from 'path';
import { queryByText } from '@testing-library/dom';

const phishingHtml = readFileSync(path.join(__dirname, 'index.html'), {
  encoding: 'utf8',
});

/**
 * Returns a URL for the phishing warning page. Optionally a hostname and an
 * href can be included in the URL, encoded as a query string but included in
 * the "hash"/fragment portion of the URL.
 *
 * @param hostname - The hostname to include in the URL fragment.
 * @param href - The href to include in the URL fragment.
 * @returns The phishing warning page URL.
 */
function getUrl(hostname?: string, href?: string) {
  const baseUrl = 'https://metamask.github.io/phishing-warning/#';
  if (hostname && href) {
    return `${baseUrl}hostname=${encodeURIComponent(
      hostname,
    )}&href=${encodeURIComponent(href)}`;
  } else if (hostname) {
    return `${baseUrl}hostname=${encodeURIComponent(hostname)}`;
  } else if (href) {
    return `${baseUrl}href=${encodeURIComponent(href)}`;
  }
  return baseUrl;
}

/**
 * Replace `window.location` with a mock created with the given URL.
 *
 * @param url - The URL to create the mock location with.
 */
function mockLocation(url: string) {
  jest.spyOn(window, 'location', 'get').mockImplementation(() => {
    const fakeLocation = new URL(url);
    return fakeLocation as unknown as Location;
  });
}

describe('Phishing warning page', () => {
  let onDomContentLoad: EventListener | undefined;
  beforeEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = phishingHtml;
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
  });

  afterEach(() => {
    onDomContentLoad = undefined;
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
    mockLocation(getUrl('example.com', 'https://example.com'));

    await import('./index');
    // non-null assertion used because TypeScript doesn't know the event handler was run
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    onDomContentLoad!(new Event('DOMContentLoaded'));

    const newIssueLink = window.document.getElementById('new-issue-link');
    expect(newIssueLink?.getAttribute('href')).toBe(
      'https://github.com/MetaMask/eth-phishing-detect/issues/new?title=[Legitimate%20Site%20Blocked]%20example.com&body=https%3A%2F%2Fexample.com',
    );
  });

  it.todo(
    'should add site to safelist when the user continues at their own risk',
  );

  it.todo(
    'should redirect to the site after the user continues at their own risk',
  );

  it('should throw an error if the hostname is missing', async () => {
    mockLocation(getUrl(undefined, 'https://example.com'));

    await import('./index');
    // non-null assertion used because TypeScript doesn't know the event handler was run
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(() => onDomContentLoad!(new Event('DOMContentLoaded'))).toThrow('');
  });

  it('should throw an error if the href is missing', async () => {
    mockLocation(getUrl('example.com'));

    await import('./index');
    // non-null assertion used because TypeScript doesn't know the event handler was run
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(() => onDomContentLoad!(new Event('DOMContentLoaded'))).toThrow('');
  });

  it('should throw an error if the new issue link is missing', async () => {
    mockLocation(getUrl('example.com', 'https://example.com'));
    const newIssueLink = document.getElementById('new-issue-link');
    if (!newIssueLink) {
      throw new Error('Unable to locate new issue link');
    }
    newIssueLink.remove();

    await import('./index');
    // non-null assertion used because TypeScript doesn't know the event handler was run
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(() => onDomContentLoad!(new Event('DOMContentLoaded'))).toThrow('');
  });

  it('should throw an error if the continue link is missing', async () => {
    mockLocation(getUrl('example.com', 'https://example.com'));
    const continueLink = document.getElementById('unsafe-continue');
    if (!continueLink) {
      throw new Error('Unable to locate unsafe continue link');
    }
    continueLink.remove();

    await import('./index');
    // non-null assertion used because TypeScript doesn't know the event handler was run
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(() => onDomContentLoad!(new Event('DOMContentLoaded'))).toThrow('');
  });
});
