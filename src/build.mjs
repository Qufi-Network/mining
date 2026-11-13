/* Builds the $Q mining page with qufi.network's own layout, stylesheet, scripts
   and icons, from the site's source in ../../qufi-protocol, so this page looks
   and behaves exactly like the rest of qufi.network.

     node src/build.mjs

   The site's header and footer link to its other pages by relative paths; on
   this separate host those links are pointed at https://qufi.network/. */
import { writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..');
const SITE_SRC = join(OUT, '..', 'qufi-protocol');
const from = (p) => import(pathToFileURL(join(SITE_SRC, 'src', p)).href);

const { page } = await from('layout.mjs');
const pages = [];
for (const [file, name] of [
  ['content/protocol.mjs', 'protocol'], ['content/technology.mjs', 'technology'],
  ['content/programmable.mjs', 'programmable'], ['content/network.mjs', 'network'],
  ['content/applications.mjs', 'applications'], ['content/developers.mjs', 'developers'],
]) pages.push(...(await from(file))[name]);
const pagesBySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));

const { mining } = await import(pathToFileURL(join(HERE, 'content.mjs')).href);

const SITE = 'https://qufi.network/';
let html = page(mining, { pagesBySlug });
html = html
  .replace(/href="index\.html"/g, `href="${SITE}"`)
  .replace(/href="([a-z0-9-]+\.html)(#[^"]*)?"/g, (m, file, hash = '') => `href="${SITE}${file}${hash}"`)
  .replace(/href="assets\/QuFi-Technical-Paper-v1\.pdf"/g, `href="${SITE}assets/QuFi-Technical-Paper-v1.pdf"`)
  /* the page's own additions (white surface, hero phones) load after the site's sheet */
  .replace('<link rel="stylesheet" href="assets/css/qufi.css">',
    '<link rel="stylesheet" href="assets/css/qufi.css">\n<link rel="stylesheet" href="assets/css/mining.css">')
  .replace('<meta property="og:type" content="website">',
    '<meta property="og:type" content="website">\n<meta property="og:image" content="https://qufi-mining.vercel.app/assets/img/qicon.png">');

writeFileSync(join(OUT, 'index.html'), html, 'utf8');

for (const f of ['css/qufi.css', 'js/qufi.js', 'js/qufi-gl.js', 'js/qufi-landmask.js',
  'img/qufi-logo.png', 'img/qicon.png', 'img/qicon-sm.png', 'img/qmask.png', 'favicon.png']) {
  mkdirSync(dirname(join(OUT, 'assets', f)), { recursive: true });
  copyFileSync(join(SITE_SRC, 'assets', f), join(OUT, 'assets', f));
}
console.log('built index.html with the qufi.network layout');
