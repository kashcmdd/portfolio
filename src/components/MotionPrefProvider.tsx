import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'motion/react';

const STORAGE_KEY = 'kashh:motion';
const EVENT = 'kashh:motion-change';

type MotionPref = 'full' | 'reduced';

interface MotionPrefValue {
  pref: MotionPref;
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

export const MotionPrefProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pref, setPrefState] = useState<MotionPref>(readPref);

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

  const value = useMemo<MotionPrefValue>(
    () => ({ pref, setPref, toggle: () => setPref(pref === 'full' ? 'reduced' : 'full') }),
    [pref, setPref]
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
