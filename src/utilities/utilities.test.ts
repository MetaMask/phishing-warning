import { usesAcceptedProtocol, buildNewIssueURL } from './utilities';

describe('usesAcceptedProtocol', () => {
  it('should return true for https urls', () => {
    expect(usesAcceptedProtocol('https://example.com')).toBe(true);
  });

  it('should return false for http urls', () => {
    expect(usesAcceptedProtocol('http://example.com')).toBe(false);
  });

  it('should return false for invalid urls', () => {
    expect(usesAcceptedProtocol('12345')).toBe(false);
  });

  it('should return false for urls with any other protocol', () => {
    expect(usesAcceptedProtocol('foo:bar.com')).toBe(false);
  });
});

describe('buildNewIssueURL', () => {
  const defaultParams = {
    hostname: 'example.com',
    href: 'https://example.com/',
    newIssueUrl: 'some-url.com',
  };

  it('url encodes hostname in new issue params', () => {
    const hostname = 'foobar.net/../../';
    const encodedHostname = 'foobar.net%2F..%2F..%2F';

    const url = buildNewIssueURL({
      ...defaultParams,
      hostname,
    });

    expect(url).toContain(encodedHostname);
    expect(url).not.toContain(hostname);
  });

  it('url encodes href', () => {
    const href = 'https://example.com/../../';
    const encodedHref = 'https%3A%2F%2Fexample.com%2F..%2F..%2F';

    const url = buildNewIssueURL({
      ...defaultParams,
      href,
    });

    expect(url).toContain(encodedHref);
    expect(url).not.toContain(href);
  });

  it('uses newIssueUrl to determine where to link to', () => {
    const url = buildNewIssueURL({
      ...defaultParams,
      newIssueUrl: 'https://foobar.com',
    });

    expect(url.startsWith('https://foobar.com')).toBe(true);

    const anotherUrl = buildNewIssueURL({
      ...defaultParams,
      newIssueUrl: 'https://anotherfoobar.com',
    });

    expect(anotherUrl.startsWith('https://anotherfoobar.com')).toBe(true);
  });
});
