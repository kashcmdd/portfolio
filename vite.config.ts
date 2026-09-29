import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

// The static generator scripts only run as part of `vite build`, so while the
// dev server is up the generated /journal/, /projects/ and /resume/ pages, the
// feed and the resume PDF do not exist anywhere Vite will look. Vite answers
// every unknown path with the SPA shell, which is why a footer link to one of
// them silently reloads the homepage in dev instead of 404ing — worse, because
// it looks like the link did nothing. This plugin runs the same scripts on the
// first matching request and serves the result out of dist/, so those links
// behave the same in dev as they do on a static host.
function devStaticArtifacts(): Plugin {
  const dist = path.resolve(__dirname, 'dist');
  const scripts = [
    'generate-journal-pages.mjs',
    'copy-sw.mjs',
    'generate-rss.mjs',
    'generate-resume-pdf.mjs',
  ];
  const staticFiles = new Set([
    'rss.xml',
    'sitemap.xml',
    'robots.txt',
    '404.html',
    'KashhCMD-Resume.pdf',
  ]);
  const staticDirs = ['journal', 'projects', 'resume'];
  const contentTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.pdf': 'application/pdf',
    '.json': 'application/json; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
  };

  // Generation is deferred to the first request and then remembered, so starting
  // the dev server stays fast for the common case of never opening a static page.
  let generated: Promise<void> | null = null;
  const ensureGenerated = () =>
    (generated ??= new Promise<void>((resolve, reject) => {
      try {
        for (const script of scripts) {
          execFileSync(process.execPath, [path.join(__dirname, 'scripts', script)], {
            stdio: 'ignore',
          });
        }
        resolve();
      } catch (error) {
        generated = null;
        reject(error);
      }
    }));

  const resolveFile = (requestPath: string) => {
    if (requestPath.includes('..')) return null;
    const clean = requestPath.endsWith('/') ? requestPath.slice(0, -1) : requestPath;
    if (staticFiles.has(clean)) return path.join(dist, clean);
    const [first] = clean.split('/');
    if (staticDirs.includes(first)) {
      const relative = path.extname(clean) ? clean : path.join(clean, 'index.html');
      return path.join(dist, relative);
    }
    return null;
  };

  return {
    name: 'dev-static-artifacts',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = (req.url ?? '').split('?')[0];
        if (!raw.startsWith(server.config.base)) return next();
        const file = resolveFile(raw.slice(server.config.base.length));
        if (!file) return next();
        ensureGenerated()
          .then(() => {
            if (!existsSync(file)) return next();
            res.setHeader(
              'Content-Type',
              contentTypes[path.extname(file)] ?? 'application/octet-stream'
            );
            res.setHeader('Cache-Control', 'no-store');
            res.end(readFileSync(file));
          })
          .catch(() => next());
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/portfolio-dev/',
    plugins: [react(), tailwindcss(), devStaticArtifacts()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('hls.js')) return 'hls';
            if (id.includes('gsap')) return 'gsap';
            if (id.includes('framer-motion') || id.includes('node_modules/motion'))
              return 'motion';
            if (id.includes('lucide-react')) return 'icons';
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')
            )
              return 'react';
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    // Ensure service worker is copied to dist
    publicDir: 'public',
  };
});
