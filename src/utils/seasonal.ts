/**
 * Halloween theming is live through October.
 *
 * This gates the decorative layer only — the drifting ambience, the hero fog
 * and cobwebs, the ember tint on the background footage and the seasonal
 * loading words. The accent palette is not switched at runtime: it is restored
 * by a single commit merged on the first of November, which also retires this
 * helper. Keeping the two paths separate is deliberate; the journal entry for
 * the theme explains why a runtime theme system is the wrong tool here.
 *
 * `now` is injectable so the October boundary can be checked without waiting
 * for the calendar.
 */
export const isHalloweenSeason = (now: Date = new Date()): boolean => now.getMonth() === 9;
