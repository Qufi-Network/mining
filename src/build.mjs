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
const { icon } = await from('icons.mjs');

/* This page stands on its own: the site's header and footer, in the site's own
   classes, but with no navigation into qufi.network. The one way across is a
   single button in the sticky header. */
const HEADER = `<header class="site-head">
  <div class="wrap site-head__in">
    <a class="brand" href="#main" aria-label="$Q mining, back to the top">
      <img class="brand__logo" src="assets/img/qufi-logo.png"
           alt="QuFi Network" width="105" height="44">
      <span class="brand__sub">Quantum<br>Verification<br>Network</span>
    </a>
    <a class="btn btn--solid site-head__go" href="${SITE}">qufi.network ${icon('next')}</a>
  </div>
  <div class="scroll-progress" aria-hidden="true"><i></i></div>
</header>`;

const FOOTER = `<footer class="site-foot" data-track>
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-top__lead">
        <a class="foot-brand" href="#main" aria-label="Back to the top">
          <img src="assets/img/qicon-sm.png" alt="" width="96" height="96">
        </a>
        <div>
          <p class="d4">Mined by staying online.</p>
          <p class="small mt-1">Every licensed phone that keeps the QuFi node network running gets a fair chance at $Q every 10 minutes.</p>
        </div>
      </div>
      <div class="foot-top__act">
        <p class="foot-top__tag">Trust<br>Beyond<br>Tomorrow</p>
      </div>
    </div>
    <div class="foot-base">
      <p>&copy; 2026 QuFi Network LTD</p>
    </div>
  </div>
</footer>`;

let html = page(mining, { pagesBySlug });
html = html
  .replace(/<header class="site-head">[\s\S]*?<\/header>/, HEADER)
  .replace(/<footer class="site-foot"[\s\S]*?<\/footer>/, FOOTER);
html = html
  .replace(/href="index\.html"/g, `href="${SITE}"`)
  .replace(/href="([a-z0-9-]+\.html)(#[^"]*)?"/g, (m, file, hash = '') => `href="${SITE}${file}${hash}"`)
  .replace(/href="assets\/QuFi-Technical-Paper-v1\.pdf"/g, `href="${SITE}assets/QuFi-Technical-Paper-v1.pdf"`)
  /* the page's own additions (white surface, hero phones) load after the site's sheet */
  .replace('<link rel="stylesheet" href="assets/css/qufi.css">',
    '<link rel="stylesheet" href="assets/css/qufi.css">\n<link rel="stylesheet" href="assets/css/mining.css">')
  .replace('<meta property="og:type" content="website">',
    '<meta property="og:type" content="website">\n<meta property="og:image" content="https://qufi-mining.vercel.app/assets/img/qicon.png">');

/* the only link out of the page is the header button */
const out = [...html.matchAll(/href="(https?:[^"]+)"/g)].map((m) => m[1])
  .filter((u) => !u.startsWith('https://fonts.'));
if (out.length !== 1 || out[0] !== SITE) throw new Error(`unexpected links out: ${out.join(', ')}`);

writeFileSync(join(OUT, 'index.html'), html, 'utf8');

for (const f of ['css/qufi.css', 'js/qufi.js', 'js/qufi-gl.js', 'js/qufi-landmask.js',
  'img/qufi-logo.png', 'img/qicon.png', 'img/qicon-sm.png', 'img/qmask.png', 'favicon.png']) {
  mkdirSync(dirname(join(OUT, 'assets', f)), { recursive: true });
  copyFileSync(join(SITE_SRC, 'assets', f), join(OUT, 'assets', f));
}
console.log('built index.html with the qufi.network layout');
