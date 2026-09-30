/**
 * Finishes the PWA assets after the bundle is written.
 *
 * Vite's publicDir copy already drops sw.js and manifest.json into dist/, so
 * this script only exists to re-point the manifest at the base declared in
 * vite.config.ts. A manifest still carrying the old prefix installs the wrong
 * site: start_url and scope decide what the launcher opens and which requests
 * the service worker is allowed to control, so a stale /portfolio/ value sends
 * the dev install straight to production.
 */
import { readFile, writeFile, access, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveConfig } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');

const exists = async (file) => access(file).then(() => true, () => false);

const config = await resolveConfig(
  { root, configFile: path.join(root, 'vite.config.ts') },
  'build'
);
const base = config.base || '/';

if (!(await exists(distDir))) {
  throw new Error('dist/ not found — run this after `vite build`');
}

// The checked-in manifest is written against this prefix. Swapping it for the
// resolved base is what makes the two unable to drift.
const SOURCE_PREFIX = '/portfolio/';

const manifestPath = path.join(distDir, 'manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const rewrite = (value) =>
  typeof value === 'string' ? value.split(SOURCE_PREFIX).join(base) : value;

const scoped = { ...manifest, start_url: rewrite(manifest.start_url), scope: rewrite(manifest.scope) };
scoped.icons = manifest.icons.map((icon) => ({ ...icon, src: rewrite(icon.src) }));
scoped.shortcuts = manifest.shortcuts.map((shortcut) => ({
  ...shortcut,
  url: rewrite(shortcut.url),
  icons: (shortcut.icons || []).map((icon) => ({ ...icon, src: rewrite(icon.src) })),
}));

if (scoped.start_url !== base || scoped.scope !== base) {
  throw new Error(
    `manifest start_url/scope did not resolve to base "${base}" — ` +
      `got "${scoped.start_url}" / "${scoped.scope}". ` +
      `Check that public/manifest.json still starts those with "${SOURCE_PREFIX}".`
  );
}

await writeFile(manifestPath, `${JSON.stringify(scoped, null, 2)}\n`, 'utf8');
console.log(`  manifest.json  start_url + scope -> ${base}`);

// sw.js derives its prefix from its own location at runtime, so its paths need
// no rewriting — but its cache names do need a build id. The hash is taken over
// the content-hashed asset filenames plus index.html, so it changes whenever the
// bundle does and the worker's activate step clears the previous caches.
const swSource = path.join(root, 'public', 'sw.js');
if (await exists(swSource)) {
  const assetNames = (await readdir(path.join(distDir, 'assets'))).sort().join(',');
  const indexHtml = await readFile(path.join(distDir, 'index.html'));
  const buildVersion = createHash('sha256')
    .update(assetNames)
    .update(indexHtml)
    .digest('hex')
    .slice(0, 10);
  const swContents = (await readFile(swSource, 'utf8')).replaceAll(
    '__BUILD_VERSION__',
    buildVersion
  );
  await writeFile(path.join(distDir, 'sw.js'), swContents);
  console.log(`  sw.js          cache version ${buildVersion}`);
} else {
  console.warn('  sw.js          not found in public/');
}
