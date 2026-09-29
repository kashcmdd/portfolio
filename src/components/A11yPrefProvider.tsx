import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  A11Y_EVENT,
  A11Y_STORAGE_KEY,
  DEFAULT_A11Y_PREFS,
  applyA11yPrefs,
  readA11yPrefs,
  systemA11yPrefs,
  writeA11yPrefs,
  type A11yPrefs,
  type ContrastPref,
  type TextSizePref,
} from '../utils/a11yPrefs';

interface A11yPrefValue {
  prefs: A11yPrefs;
  setContrast: (value: ContrastPref) => void;
  setTextSize: (value: TextSizePref) => void;
  reset: () => void;
  isDefault: boolean;
}

const A11yPrefContext = createContext<A11yPrefValue | null>(null);

export const useA11yPrefs = (): A11yPrefValue => {
  const value = useContext(A11yPrefContext);
  if (!value) throw new Error('useA11yPrefs must be used inside A11yPrefProvider');
  return value;
};

export const A11yPrefProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<A11yPrefs>(readA11yPrefs);

  const update = useCallback((next: A11yPrefs) => {
    setPrefs(next);
    applyA11yPrefs(next);
    writeA11yPrefs(next);
  }, []);

  useEffect(() => {
    // A stored choice wins. With nothing stored, the OS settings are a better
    // starting guess than the site defaults, and they are only consulted once
    // so a later OS change does not silently override someone who has chosen.
    const stored = readA11yPrefs();
    const isStored =
      stored.contrast !== DEFAULT_A11Y_PREFS.contrast ||
      stored.textSize !== DEFAULT_A11Y_PREFS.textSize;
    const resolved = isStored ? stored : systemA11yPrefs();
    setPrefs(resolved);
    applyA11yPrefs(resolved);

    const sync = () => setPrefs(readA11yPrefs());
    // Other tabs receive the write via "storage"; this tab needs the custom
    // event, because "storage" never fires in the tab that made the change.
    window.addEventListener('storage', sync);
    window.addEventListener(A11Y_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(A11Y_EVENT, sync);
    };
  }, []);

  const value = useMemo<A11yPrefValue>(
    () => ({
      prefs,
      setContrast: (contrast) => update({ ...prefs, contrast }),
      setTextSize: (textSize) => update({ ...prefs, textSize }),
      reset: () => {
        update(DEFAULT_A11Y_PREFS);
        try {
          window.localStorage.removeItem(A11Y_STORAGE_KEY);
        } catch {
          // Nothing to do: the default has already been applied in memory.
        }
      },
      isDefault:
        prefs.contrast === DEFAULT_A11Y_PREFS.contrast &&
        prefs.textSize === DEFAULT_A11Y_PREFS.textSize,
    }),
    [prefs, update]
  );

  return <A11yPrefContext.Provider value={value}>{children}</A11yPrefContext.Provider>;
};
