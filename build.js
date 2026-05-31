#!/usr/bin/env node
/**
 * Production build for byronlevin.com.
 *
 * Copies index.html → dist/index.html with everything between
 * STRIP-START / STRIP-END marker pairs removed.
 *
 * Two marker syntaxes are supported (so markers can live inside HTML, CSS,
 * or JS sections of the single-file site):
 *   <!-- STRIP-START --> ... <!-- STRIP-END -->     (HTML)
 *   /* STRIP-START *\/ ... /* STRIP-END *\/         (CSS / JS)
 *
 * Result: the public site has no Edit button, no PDF-export button, no
 * editor panel, no admin-mode JS. Local dev (run from the repo root with
 * a static server) still has the full editor available.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'index.html');
const OUT_DIR = path.join(__dirname, 'dist');
const OUT = path.join(OUT_DIR, 'index.html');

let html = fs.readFileSync(SRC, 'utf8');
const srcBytes = Buffer.byteLength(html, 'utf8');

const htmlMarker = /<!--\s*STRIP-START\s*-->[\s\S]*?<!--\s*STRIP-END\s*-->\s*/g;
const cssJsMarker = /\/\*\s*STRIP-START\s*\*\/[\s\S]*?\/\*\s*STRIP-END\s*\*\/\s*/g;

const htmlMatches = (html.match(htmlMarker) || []).length;
const cssJsMatches = (html.match(cssJsMarker) || []).length;

html = html.replace(htmlMarker, '').replace(cssJsMarker, '');

// Sanity check: no orphan markers should remain.
const stray = html.match(/STRIP-(START|END)/g);
if (stray) {
  console.error('Build failed: orphan STRIP marker(s) remain:', stray);
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, html);

// Copy static production assets through verbatim (skip any that don't exist).
const STATIC_ASSETS = ['robots.txt', 'sitemap.xml', '404.html'];
const copied = [];
for (const asset of STATIC_ASSETS) {
  const from = path.join(__dirname, asset);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, path.join(OUT_DIR, asset));
    copied.push(asset);
  }
}

const outBytes = Buffer.byteLength(html, 'utf8');
const savedKB = ((srcBytes - outBytes) / 1024).toFixed(1);
console.log(
  `Built dist/index.html — stripped ${htmlMatches} HTML block(s) and ` +
    `${cssJsMatches} CSS/JS block(s), saved ${savedKB}KB ` +
    `(${(srcBytes / 1024).toFixed(1)}KB → ${(outBytes / 1024).toFixed(1)}KB)`
);
if (copied.length) console.log(`Copied static asset(s): ${copied.join(', ')}`);
