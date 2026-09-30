/**
 * Allows only the schemes a portfolio link can legitimately use.
 *
 * Content-supplied URLs (a project's live/source/invite links, a testimonial's
 * source) end up in an href. React escapes the attribute, which stops a quote
 * breakout but not a `javascript:` value, so anything that is not http, https or
 * mailto becomes an empty string — the caller treats that as "no link" and
 * renders nothing. Relative URLs are allowed (they resolve into this site).
 */
export const safeHref = (value?: string): string => {
  const url = (value ?? '').trim();
  if (!url) return '';
  try {
    const protocol = new URL(url, 'https://example.invalid').protocol;
    return protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:' ? url : '';
  } catch {
    return '';
  }
};
