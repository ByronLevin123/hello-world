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

const SRC = path.join(__dirname, 'index.html');
const OUT_DIR = path.join(__dirname, 'dist');
const OUT = path.join(OUT_DIR, 'index.html');

const html = fs.readFileSync(SRC, 'utf8');

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
console.log(`Built dist/index.html (${kb}KB)`);
if (copied.length) console.log(`Copied static asset(s): ${copied.join(', ')}`);
