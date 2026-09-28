/**
 * Analytics consent: one place that reads, writes and announces the decision.
 *
 * localStorage alone was the wrong tool for this. It is only consulted when a
 * component mounts, so a visitor who accepted from the banner mid-session left
 * Analytics believing they had declined until the next full page load. Two
 * components also each hard-coded the same key and talked to storage
 * independently, which is exactly how the two drifted apart in the first place.
 *
 * A write therefore also dispatches a DOM event, and subscribers re-read the
 * stored value. That keeps localStorage as the single source of truth, so the
 * decision still survives reloads, without needing a provider for one boolean.
 */

const CONSENT_KEY = 'analytics_consent';
const CONSENT_EVENT = 'analytics-consent-change';

/**
 * Tri-state on purpose: `null` means "never asked", which is what the banner
 * needs and is not the same as a recorded decline.
 */
export function readAnalyticsConsent(): boolean | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    return stored === null ? null : stored === 'true';
  } catch {
    // Some private-browsing modes throw on access instead of returning null.
    // Reporting "never asked" makes the banner reappear, and every later write
    // silently fails, so no analytics load rather than an unconsented one.
    return null;
  }
}

export function writeAnalyticsConsent(consented: boolean): void {
  try {
    localStorage.setItem(CONSENT_KEY, consented ? 'true' : 'false');
  } catch {
    // Nothing to persist, but still notify so this session behaves correctly.
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** Subscribe to consent decisions. Returns an unsubscribe function. */
export function onAnalyticsConsentChange(
  listener: (consented: boolean) => void
): () => void {
  const handler = () => listener(readAnalyticsConsent() === true);
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}
