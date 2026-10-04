import React from 'react';

/**
 * Seasonal Halloween ambience: drifting embers and a few bats crossing the page.
 *
 * Decorative and CSS-only — no state, no timers, nothing to clean up — so it
 * costs nothing at runtime and the site's global reduced-motion rule neutralises
 * the animations for anyone who asked for less motion. The positions are
 * hand-tuned rather than random so the field never reshuffles between renders.
 * It is pointer-events-none and hidden from assistive tech.
 */
const EMBERS: { left: string; delay: string; duration: string }[] = [
  { left: '4%', delay: '0s', duration: '11s' },
  { left: '12%', delay: '3.5s', duration: '14s' },
  { left: '21%', delay: '7s', duration: '12s' },
  { left: '30%', delay: '1.5s', duration: '15s' },
  { left: '41%', delay: '5s', duration: '13s' },
  { left: '52%', delay: '9s', duration: '16s' },
  { left: '61%', delay: '2.5s', duration: '12s' },
  { left: '70%', delay: '6.5s', duration: '14s' },
  { left: '80%', delay: '10s', duration: '15s' },
  { left: '89%', delay: '4s', duration: '13s' },
  { left: '96%', delay: '8s', duration: '11s' },
];

const BATS: { top: string; delay: string; duration: string; width: string }[] = [
  { top: '14%', delay: '0s', duration: '26s', width: '26px' },
  { top: '27%', delay: '9s', duration: '34s', width: '19px' },
  { top: '8%', delay: '17s', duration: '30s', width: '31px' },
];

const BatShape: React.FC = () => (
  <svg viewBox="0 0 64 32" fill="currentColor" aria-hidden="true">
    <path d="M32 8c-2 0-3 1-4 3-3-3-8-5-13-5 3 3 4 7 3 12 4-1 8-4 10-8 1 4 3 6 4 6s3-2 4-6c2 4 6 7 10 8-1-5 0-9 3-12-5 0-10 2-13 5-1-2-2-3-4-3z" />
  </svg>
);

export const SpookyAtmosphere: React.FC = () => (
  <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[40] overflow-hidden">
    {EMBERS.map((ember, index) => (
      <span
        key={`ember-${index}`}
        className="ember"
        style={{ left: ember.left, animationDelay: ember.delay, animationDuration: ember.duration }}
      />
    ))}
    {BATS.map((bat, index) => (
      <span
        key={`bat-${index}`}
        className="bat"
        style={{
          top: bat.top,
          width: bat.width,
          animationDelay: bat.delay,
          animationDuration: bat.duration,
        }}
      >
        <BatShape />
      </span>
    ))}
  </div>
);
