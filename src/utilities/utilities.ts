import { PageParameters } from '../types';
import { ACCEPTED_PROTOCOLS_DISPUTE_URL } from '../constants';

/**
 * Returns boolean true if the URL uses the HTTPS protocol false otherwise.
 *
 * @param url - The URL to check.
 * @returns Boolean indicating if HTTPS is used.
 */
export function usesAcceptedProtocol(url: string) {
  try {
    const parsedUrl = new URL(url);
    return ACCEPTED_PROTOCOLS_DISPUTE_URL.includes(parsedUrl.protocol);
  } catch (e) {
    return false;
  }
}

/**
 * Builds a URL string that is used as the location to dispute a phishing warning.
 *
 * @param PageParameters - The parameters to use when building the URL.
 * @param PageParameters.hostname - The hostname of the phishing site.
 * @param PageParameters.href - The complete url the user was blocked from visiting.
 * @param PageParameters.newIssueUrl - The page where the user can dispute a phishing warning.
 * @returns String of url.
 */
export function buildNewIssueURL({
  hostname,
  href,
  newIssueUrl,
}: PageParameters) {
  const encodedHostname = encodeURIComponent(hostname);
  const encodedHref = encodeURIComponent(href);

  return `${newIssueUrl}?title=[Legitimate%20Site%20Blocked]%20${encodedHostname}&body=${encodedHref}`;
}
