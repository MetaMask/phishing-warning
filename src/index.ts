import { toASCII } from 'punycode/';
import { pipeline } from 'readable-stream';
import PhishingDetector from 'eth-phishing-detect/src/detector';
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
  const disallowedProtocols = ['javascript:'];
  const parsedSuspectHref = new URL(href);

  return disallowedProtocols.indexOf(parsedSuspectHref.protocol) < 0;
}

const newIssueUrls = {
  metamask: 'https://github.com/MetaMask/eth-phishing-detect/issues/new',
  phishfort: 'https://github.com/phishfort/phishfort-lists/issues/new',
};

const metamaskConfigUrl =
  'https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/config.json';

/**
 * Determines whether the given URL was blocked by our phishing configuration or not.
 *
 * @param href - The blocked URL.
 * @returns `true` if this URL is blocked by our phishing configuration, `false` otherwise.
 */
async function isBlockedByMetamask(href: string) {
  try {
    const response = await fetch(metamaskConfigUrl, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Received non-200 response: ${response.status}`);
    }
    const config = await response.json();
    const detector = new PhishingDetector([
      {
        allowlist: config.whitelist,
        blocklist: config.blacklist,
        fuzzylist: config.fuzzylist,
        tolerance: config.tolerance,
        name: 'MetaMask',
        version: config.version,
      },
    ]);
    const { hostname } = new URL(href);

    const punycodeHostname = toASCII(hostname);
    const phishingTestResponse = detector.check(punycodeHostname);
    console.debug('Phishing config test results:', phishingTestResponse);

    return phishingTestResponse.result;
  } catch (error) {
    console.error(error);
    // default to assuming that it is blocked by our configuration
    return true;
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
  const suspectHostname = hashQueryString.get('hostname');
  const suspectHref = hashQueryString.get('href');

  if (!suspectHostname) {
    throw new Error("Missing 'hostname' query parameter");
  } else if (!suspectHref) {
    throw new Error("Missing 'href' query parameter");
  }

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
    suspectHostname,
  )}&body=${encodeURIComponent(suspectHref)}`;

  newIssueLink.addEventListener('click', async () => {
    const listName = (await isBlockedByMetamask(suspectHref))
      ? 'metamask'
      : 'phishfort';
    window.location.href = `${newIssueUrls[listName]}${newIssueParams}`;
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
      params: [suspectHostname],
      id: createRandomId(),
    });

    window.location.href = suspectHref;
  });

  const backToSafetyLink = document.getElementById('back-to-safety');
  if (!backToSafetyLink) {
    throw new Error('Unable to locate back to safety link');
  }

  backToSafetyLink.addEventListener('click', async () => {
    phishingSafelistStream.write({
      jsonrpc: '2.0',
      method: 'backToSafetyPhishingWarning',
      params: [],
      id: createRandomId(),
    });
  });
}
