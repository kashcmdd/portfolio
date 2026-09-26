import type { KeyboardEvent } from 'react';

// The card components are motion.div elements with an onClick rather than real
// buttons, so they have to answer Enter and Space themselves to be usable
// without a mouse.
export const activateOnKey =
  (action: () => void) =>
  (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    action();
  };
