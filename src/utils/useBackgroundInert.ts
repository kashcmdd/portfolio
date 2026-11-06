import { useEffect } from 'react';

/**
 * Makes the page behind an open dialog inert.
 *
 * The focus trap keeps Tab inside the dialog, but a screen reader or a crawler
 * still sees the page behind it as one document, and an axe scan happily
 * reports contrast and name problems in content the visitor cannot reach. The
 * `inert` attribute removes it from focus and the accessibility tree together
 * with `aria-hidden`, which is the behaviour a modal is supposed to have.
 *
 * Call this before `useFocusTrap`: effects clean up in declaration order, so
 * removing `inert` first lets the focus trap put focus back on the trigger
 * afterwards instead of trying to focus an inert element.
 */
export const useBackgroundInert = (active: boolean) => {
  useEffect(() => {
    if (!active) return;

    const page = document.getElementById('page-content');
    if (!page) return;

    const wasInert = page.hasAttribute('inert');
    const previousHidden = page.getAttribute('aria-hidden');

    page.setAttribute('inert', '');
    page.setAttribute('aria-hidden', 'true');

    return () => {
      if (!wasInert) page.removeAttribute('inert');
      if (previousHidden === null) page.removeAttribute('aria-hidden');
      else page.setAttribute('aria-hidden', previousHidden);
    };
  }, [active]);
};
