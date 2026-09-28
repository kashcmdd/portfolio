// Must stay in sync with SITE_ORIGIN in scripts/generate-journal-pages.mjs and
// scripts/generate-rss.mjs. Share links are absolute, so they cannot be built
// from window.location: a link shared from a local dev server or from a
// preview build would carry that origin to the recipient.
export const SITE_ORIGIN = 'https://kashcmdd.github.io';
export const BASE_PATH = '/portfolio-dev/';

export const articleUrl = (id: string) =>
  `${SITE_ORIGIN}${BASE_PATH}journal/${id}/`;

export const projectUrl = (id: string) => `${SITE_ORIGIN}${BASE_PATH}projects/${id}/`;

export const resumeUrl = () => `${SITE_ORIGIN}${BASE_PATH}resume/`;

const shareText = (title: string) => `${title} — WarriorOG`;

export const shareTargets = (url: string, title: string) => ({
  x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText(title)
  )}&url=${encodeURIComponent(url)}`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
});
