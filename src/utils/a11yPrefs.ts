export type ContrastPref = 'normal' | 'high';
export type TextSizePref = 'normal' | 'large' | 'xlarge';

export const A11Y_STORAGE_KEY = 'kashh:a11y';
export const A11Y_EVENT = 'kashh:a11y-change';

export interface A11yPrefs {
  contrast: ContrastPref;
  textSize: TextSizePref;
}

export const DEFAULT_A11Y_PREFS: A11yPrefs = {
  contrast: 'normal',
  textSize: 'normal',
};

const isContrast = (value: unknown): value is ContrastPref =>
  value === 'normal' || value === 'high';

const isTextSize = (value: unknown): value is TextSizePref =>
  value === 'normal' || value === 'large' || value === 'xlarge';

export const readA11yPrefs = (): A11yPrefs => {
  try {
    const raw = window.localStorage.getItem(A11Y_STORAGE_KEY);
    if (!raw) return DEFAULT_A11Y_PREFS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_A11Y_PREFS;
    const record = parsed as Record<string, unknown>;
    return {
      contrast: isContrast(record.contrast) ? record.contrast : 'normal',
      textSize: isTextSize(record.textSize) ? record.textSize : 'normal',
    };
  } catch {
    // Blocked or unavailable storage, and malformed JSON, both land here. These
    // are preferences: failing to read them must never stop the page rendering.
    return DEFAULT_A11Y_PREFS;
  }
};

export const writeA11yPrefs = (prefs: A11yPrefs) => {
  try {
    window.localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Not being able to remember the choice should not stop it applying now.
  }
  // A write fires "storage" in other tabs but not this one.
  window.dispatchEvent(new Event(A11Y_EVENT));
};

/**
 * The attributes are what the stylesheet keys off, so this is the single place
 * that knows the contract between the preference and the CSS. The pre-paint
 * script in index.html sets the same two attributes before React mounts, which
 * is why these are plain data attributes rather than React state alone.
 */
export const applyA11yPrefs = (prefs: A11yPrefs) => {
  const root = document.documentElement;
  if (prefs.contrast === 'high') root.setAttribute('data-contrast', 'high');
  else root.removeAttribute('data-contrast');
  if (prefs.textSize !== 'normal') root.setAttribute('data-textsize', prefs.textSize);
  else root.removeAttribute('data-textsize');
};

/**
 * The OS-level signals worth honouring on a first visit.
 *
 * Only contrast qualifies. `prefers-contrast: more` is an explicit request, and
 * "less"/"custom" are not evidence that someone wants this site flattened, so
 * the positive signal is the only one acted on.
 *
 * Text size deliberately has no automatic branch. There is no CSS media query
 * for the OS font-size preference, and the query that looks closest -
 * min-resolution - actually reports screen density, which is true of most
 * modern laptops and every phone. Honouring it would have quietly enlarged the
 * site by 12.5% for the majority of first-time visitors, which is a change they
 * never asked for. Larger text stays opt-in through the menu instead.
 */
export const systemA11yPrefs = (): A11yPrefs => {
  if (typeof window === 'undefined' || !window.matchMedia) return DEFAULT_A11Y_PREFS;
  const contrastQuery = window.matchMedia('(prefers-contrast: more)');
  return {
    contrast: contrastQuery.matches ? 'high' : 'normal',
    textSize: 'normal',
  };
};
