import { toUnicode } from 'punycode/';
import { pipeline } from 'readable-stream';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import ObjectMultiplex from '@metamask/object-multiplex';

const MAX = Number.MAX_SAFE_INTEGER;

let idCounter = Math.round(Math.random() * MAX);

/**
 * Create a random ID.
 *
 * The ID returned is not actually "random", it is incremented by 1 each call.
 * But the starting number is random, which makes collision unlikely. This
 * should only be used in circumstances where the consequences of ID collision
 * are minimal, because it remains a real possibility.
 *
 * @returns A new ID.
 */
function createRandomId(): number {
  idCounter += 1;
  idCounter %= MAX;
  return idCounter;
}

/**
 * Check whether this page is being loaded during the extension startup, in an
 * attempt to ensure the service worker is installed.
 *
 * @returns Whether this appears to be an extension startup page load.
 */
function isExtensionStartup() {
  const { hash } = window.location;
  return hash === '#extensionStartup';
}

window.addEventListener('load', async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./service-worker.js');
      console.log('Service worker registered!');
    } catch (error) {
      console.warn('Error registering service worker:');
      console.warn(error);
    }
  }
});

// Skip stream initialization on extension startup (when this page is loaded
// in a hidden iframe), and in sub-frames. In both cases, the user interactions
// handled by the streams are not possible.
if (!isExtensionStartup()) {
  if (window.top === window.self) {
    window.document.addEventListener('DOMContentLoaded', start);
  } else {
    // The sub-frame case requires the "open in new tab" href to be set
    // dynamically because a relative `href` attribute would not preserve
    // the URL hash.
    window.document.addEventListener(
      'DOMContentLoaded',
      setupOpenSelfInNewTabLink,
    );
  }
}

/**
 * Setup the "Open in new tab" link.
 *
 * This is necessary so that the "open in new tab" link includes the current
 * URL hash. A statically-set relative `href` would drop the URL hash.
 */
function setupOpenSelfInNewTabLink() {
  const newTabLink = window.document.getElementById('open-self-in-new-tab');
  if (!newTabLink) {
    throw new Error('Unable to locate "Open in new tab" link');
  }
  newTabLink.setAttribute('href', window.location.href);
}

/**
 * Checks to see if the suspectHref is a valid format to forward on
 * Specifically checks the protocol of the passed href.
 *
 * @param href - The href value to check.
 * @returns Boolean on if its valid to attack to a href prop.
 */
function isValidSuspectHref(href: string) {
  /* eslint-disable-next-line */
  const disallowedProtocols = ['javascript:', 'data:', 'vbscript:'];
  const parsedSuspectHref = new URL(href);

  return disallowedProtocols.indexOf(parsedSuspectHref.protocol) < 0;
}

const newIssueUrl =
  'https://github.com/MetaMask/eth-phishing-detect/issues/new';

/**
 * Extract hostname and href from the query string.
 *
 * @returns The suspect hostname and href from the query string.
 * @param href - The href value to check.
 */
function getSuspect(href = ''): {
  suspectHostnameUnicode: string;
  suspectHref: string;
  suspectHrefUnicode: string;
  suspectOrigin: string;
} {
  try {
    const url = new URL(href);
    const unicodeHostname = toUnicode(url.hostname);
    const unicodeHref = `${url.protocol}//${unicodeHostname}${url.pathname}${url.search}${url.hash}`;
    return {
      suspectHostnameUnicode: unicodeHostname,
      suspectHref: url.href,
      suspectHrefUnicode: unicodeHref,
      suspectOrigin: url.origin,
    };
  } catch (error) {
    throw new Error(`Invalid 'href' query parameter`);
  }
}

/**
 * Initialize the phishing warning page streams.
 */
function start() {
  const metamaskStream = new WindowPostMessageStream({
    name: 'metamask-phishing-warning-page',
    target: 'metamask-contentscript',
  });

  // setup connectionStream multiplexing
  const mux = new ObjectMultiplex();
  pipeline(metamaskStream, mux, metamaskStream, (error) => [
    console.error('Disconnected', error),
  ]);
  const phishingSafelistStream = mux.createStream('metamask-phishing-safelist');

  const { hash } = new URL(window.location.href);
  const hashContents = hash.slice(1); // drop leading '#' from hash
  const hashQueryString = new URLSearchParams(hashContents);

  const {
    suspectHref,
    suspectHostnameUnicode,
    suspectHrefUnicode,
    suspectOrigin,
  } = getSuspect(hashQueryString.get('href'));

  const suspectLink = document.getElementById('suspect-link');
  if (!suspectLink) {
    throw new Error('Unable to locate suspect link');
  }
  suspectLink.innerText = suspectHref;

  const newIssueLink = document.getElementById('new-issue-link');
  if (!newIssueLink) {
    throw new Error('Unable to locate new issue link');
  }

  const newIssueParams = `?title=[Legitimate%20Site%20Blocked]%20${encodeURIComponent(
    suspectHostnameUnicode,
  )}&body=${encodeURIComponent(toUnicode(suspectHrefUnicode))}`;

  newIssueLink.addEventListener('click', async () => {
    window.location.href = `${newIssueUrl}${newIssueParams}`;
  });

  const continueLink = document.getElementById('unsafe-continue');
  if (!continueLink) {
    throw new Error('Unable to locate unsafe continue link');
  }

  continueLink.addEventListener('click', async () => {
    if (!isValidSuspectHref(suspectHref)) {
      console.log(`Disallowed Protocol, cannot continue.`);
      return;
    }

    phishingSafelistStream.write({
      jsonrpc: '2.0',
      method: 'safelistPhishingDomain',
      params: [suspectOrigin],
      id: createRandomId(),
    });

    window.location.href = suspectHref;
  });

  // To know when the event listener has been added, to mitigate an e2e race condition
  continueLink.setAttribute('data-testid', 'unsafe-continue-loaded');

  const portfolioLink = document.getElementById('portfolio-link');
  if (!portfolioLink) {
    throw new Error('Unable to locate portfolio link');
  }

  portfolioLink.addEventListener('click', async () => {
    phishingSafelistStream.write({
      jsonrpc: '2.0',
      method: 'backToSafetyPhishingWarning',
      params: [],
      id: createRandomId(),
    });
  });
}
