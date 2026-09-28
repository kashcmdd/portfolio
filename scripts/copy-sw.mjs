import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '..', 'public');
const distDir = path.join(__dirname, '..', 'dist');

// Copy service worker to dist
const swSource = path.join(sourceDir, 'sw.js');
const swDest = path.join(distDir, 'sw.js');

if (fs.existsSync(swSource)) {
  fs.copyFileSync(swSource, swDest);
  console.log('✓ Service worker copied to dist/');
} else {
  console.warn('⚠ Service worker not found in public/');
}

// Copy manifest to dist
const manifestSource = path.join(sourceDir, 'manifest.json');
const manifestDest = path.join(distDir, 'manifest.json');

if (fs.existsSync(manifestSource)) {
  fs.copyFileSync(manifestSource, manifestDest);
  console.log('✓ Manifest copied to dist/');
} else {
  console.warn('⚠ Manifest not found in public/');
}
