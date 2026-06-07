#!/usr/bin/env node
/**
 * Production build for the CV site.
 *
 * Copies index.html → dist/index.html and brings the static assets
 * (robots.txt, 404.html) through verbatim.
 *
 * The slide-out editor ships with the site but is gated behind an admin
 * token (see the admin-mode block in index.html): normal visitors never
 * see the Edit button, while the owner can unlock it with
 * `?admin=<token>` and edit content live.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC = path.join(__dirname, 'index.html');
const OUT_DIR = path.join(__dirname, 'dist');
const OUT = path.join(OUT_DIR, 'index.html');

// Build/version stamp injected into the footer as "YYYY-MM-DD|<short-sha>".
// Netlify exposes the deployed commit via COMMIT_REF (HEAD as a fallback);
// for local builds we read it from git. Lets you confirm at a glance that
// the live site matches the latest push.
function shortCommit() {
  const ref = process.env.COMMIT_REF || process.env.HEAD || '';
  if (ref) return ref.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim();
  } catch (e) {
    return '';
  }
}
const buildDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
const commit = shortCommit();
const stamp = buildDate + '|' + commit;

let html = fs.readFileSync(SRC, 'utf8');
html = html.split('@@BUILD_STAMP@@').join(stamp);

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, html);

// Copy static production assets through verbatim (skip any that don't exist).
const STATIC_ASSETS = ['robots.txt', '404.html'];
const copied = [];
for (const asset of STATIC_ASSETS) {
  const from = path.join(__dirname, asset);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, path.join(OUT_DIR, asset));
    copied.push(asset);
  }
}

const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
console.log(`Built dist/index.html (${kb}KB) · stamp ${stamp}`);
if (copied.length) console.log(`Copied static asset(s): ${copied.join(', ')}`);
