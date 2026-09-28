import { useEffect, useRef } from 'react';

/**
 * Keeps keyboard focus inside a dialog while it is open, and puts focus back
 * where it was afterwards.
 *
 * A modal that leaks focus is not a modal to a screen reader user: they can
 * Tab straight out of it into the page behind, which is still visible and still
 * in the accessibility tree, so the two get read as one confusing document.
 * This is the standard fix and it is short enough to just write.
 *
 * Returns a ref for the dialog element. The element must carry role="dialog"
 * and aria-modal="true", which every caller already does.
 */
export const useFocusTrap = <T extends HTMLElement>(active: boolean) => {
  const containerRef = useRef<T>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Focus the dialog itself rather than its first control: announcing the
    // dialog's name before its contents is what a screen reader user needs, and
    // focusing a button first makes them tab through the header again.
    container.focus({ preventScroll: true });

    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
      'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
        // offsetParent is null for display:none, and a hidden control must not
        // be a tab stop.
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      // Returning focus is what makes closing feel like the dialog was never
      // anywhere else. Without it, focus falls back to <body> and a keyboard
      // user has to tab from the top of the page all over again.
      previouslyFocused.current?.focus?.({ preventScroll: true });
    };
  }, [active]);

  return containerRef;
};
