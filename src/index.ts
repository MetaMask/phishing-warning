import pump from 'pump';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import ObjectMultiplex from 'obj-multiplex';

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

window.document.addEventListener('DOMContentLoaded', start);

/**
 * Initialize the phishing warning page.
 */
function start() {
  const metamaskStream = new WindowPostMessageStream({
    name: 'metamask-phishing-warning-page',
    target: 'metamask-contentscript',
  });

  // setup connectionStream multiplexing
  const mux = new ObjectMultiplex();
  pump(metamaskStream, mux, metamaskStream, (error) => [
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

  const newIssueLink = document.getElementById('new-issue-link');
  if (!newIssueLink) {
    throw new Error('Unable to locate new issue link');
  }

  const newIssueUrl = `https://github.com/MetaMask/eth-phishing-detect/issues/new`;
  const newIssueParams = `?title=[Legitimate%20Site%20Blocked]%20${encodeURIComponent(
    suspectHostname,
  )}&body=${encodeURIComponent(suspectHref)}`;
  newIssueLink.setAttribute('href', `${newIssueUrl}${newIssueParams}`);

  const continueLink = document.getElementById('unsafe-continue');
  if (!continueLink) {
    throw new Error('Unable to locate unsafe continue link');
  }

  continueLink.addEventListener('click', async () => {
    phishingSafelistStream.write({
      jsonrpc: '2.0',
      method: 'safelistPhishingDomain',
      params: [suspectHostname],
      id: createRandomId(),
    });

    window.location.href = suspectHref;
  });
}
