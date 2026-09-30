import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'motion/react';

const STORAGE_KEY = 'kashh:motion';
const EVENT = 'kashh:motion-change';
const OS_QUERY = '(prefers-reduced-motion: reduce)';

type MotionPref = 'full' | 'reduced';

interface MotionPrefValue {
  pref: MotionPref;
  /**
   * True when motion should be suppressed by either route: the in-app toggle or
   * the operating system setting. Components that animate outside Framer Motion
   * — the GSAP timelines and the autoplaying videos — read this so they honour
   * both, instead of only the toggle.
   */
  reduced: boolean;
  setPref: (pref: MotionPref) => void;
  toggle: () => void;
}

const MotionPrefContext = createContext<MotionPrefValue | null>(null);

const readPref = (): MotionPref => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'reduced' ? 'reduced' : 'full';
  } catch {
    // Private browsing and blocked storage both throw here. Animations are a
    // preference, never a requirement, so the default is simply the full set.
    return 'full';
  }
};

const readOsReduced = (): boolean => {
  try {
    return window.matchMedia(OS_QUERY).matches;
  } catch {
    return false;
  }
};

export const MotionPrefProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pref, setPrefState] = useState<MotionPref>(readPref);
  const [osReduced, setOsReduced] = useState(readOsReduced);

  const setPref = useCallback((next: MotionPref) => {
    setPrefState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not being able to remember the choice should not stop it applying now.
    }
    // Other tabs are listening for the storage event; same-tab listeners need
    // this one.
    window.dispatchEvent(new Event(EVENT));
  }, []);

  useEffect(() => {
    const sync = () => setPrefState(readPref());
    // A write from this tab also fires storage in *other* tabs, not this one.
    window.addEventListener('storage', sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  // Follow the OS setting live, so flipping it in system preferences applies
  // without a reload.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(OS_QUERY);
    const onChange = (event: MediaQueryListEvent) => setOsReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // CSS animations cannot read React state, so the explicit toggle is mirrored
  // onto <html>. The stylesheet keys off this attribute for the in-app choice
  // and off the media query for the OS choice; between them, both routes quiet
  // the CSS-driven motion (gradient shifts, pulses, the bobbing overlay).
  useEffect(() => {
    const root = document.documentElement;
    if (pref === 'reduced') root.setAttribute('data-reduced-motion', 'true');
    else root.removeAttribute('data-reduced-motion');
  }, [pref]);

  const value = useMemo<MotionPrefValue>(
    () => ({
      pref,
      reduced: pref === 'reduced' || osReduced,
      setPref,
      toggle: () => setPref(pref === 'full' ? 'reduced' : 'full'),
    }),
    [pref, osReduced, setPref]
  );

  return (
    <MotionPrefContext.Provider value={value}>
      {/* "user" hands the decision back to the OS setting, so a visitor who
          never touches the palette still gets the behaviour they asked for in
          their system preferences. */}
      <MotionConfig reducedMotion={pref === 'reduced' ? 'always' : 'user'}>
        {children}
      </MotionConfig>
    </MotionPrefContext.Provider>
  );
};

export const useMotionPref = (): MotionPrefValue => {
  const context = useContext(MotionPrefContext);
  if (!context) throw new Error('useMotionPref must be used inside MotionPrefProvider');
  return context;
};
