/* The Q mining page, written in qufi.network's own content format and rendered
   with its own layout (../qufi-protocol/src/layout.mjs), so the header, footer,
   type, cards, icons and buttons are the site's, not a copy of them. */

import { icon } from '../../qufi-protocol/src/icons.mjs';

const DFONT = "Inter, -apple-system, 'Segoe UI', system-ui, sans-serif";

/* The hero is the home page's own stage (point globe, halo, two rings, the
   orbiting bead and the floating Q) with eight node phones threaded on the
   outer ring. As the day's ring fills, the Q sends a coin out to each phone in
   turn and that phone lights up with +1 Q: every online node, every day. Frame zero is a finished picture
   (one winner already lit), and the motion only runs once qufi.js has seen an
   animation frame and set html.anim, so a host that never paints a frame
   still shows the whole scene. Styles in assets/css/mining.css. */
const R = 282;                               /* the outer ring: inset 3% of 600 */
const ORDER = [7, 2, 5, 0, 3, 6, 1, 4];      /* phone drawn in each slot */
const f = (n) => Math.round(n * 10) / 10;
const phones = Array.from({ length: 8 }, (_, k) => {
  const deg = 22.5 + 45 * k;
  const a = (deg * Math.PI) / 180;
  return { k, deg, ux: Math.cos(a), uy: Math.sin(a), x: f(300 + R * Math.cos(a)), y: f(300 + R * Math.sin(a)), s: ORDER.indexOf(k) };
});
const still = (p) => (p.s === 0 ? ' is-on' : '');
const QSM = 'assets/img/qicon-sm.png';

const beams = phones.map((p) => `
      <g class="mine__beam${still(p)}" style="--s:${p.s}">
        <line x1="300" y1="300" x2="${f(300 + (R - 40) * p.ux)}" y2="${f(300 + (R - 40) * p.uy)}" stroke="#1557FF" stroke-opacity=".14" stroke-width="9" stroke-linecap="round"/>
        <line x1="300" y1="300" x2="${f(300 + (R - 40) * p.ux)}" y2="${f(300 + (R - 40) * p.uy)}" stroke="#1557FF" stroke-width="2" stroke-linecap="round"/>
      </g>`).join('');

const coins = phones.map((p) => `
      <g transform="rotate(${p.deg} 300 300)"><g class="mine__coin" style="--s:${p.s}" opacity="0"><g transform="rotate(${-p.deg} 450 300)">
        <circle cx="450" cy="300" r="12.5" fill="#FFFFFF" stroke="#1557FF" stroke-width="1.5"/>
        <image href="${QSM}" x="441" y="291" width="18" height="18"/>
      </g></g></g>`).join('');

const phoneMarks = phones.map((p) => {
  /* the win label sits beside the phone, on the side facing the Q */
  const lx = p.ux > 0 ? -66 : 66, ly = 0;
  return `
      <g transform="translate(${p.x} ${p.y})">
        <g class="mine__w${still(p)}" style="--s:${p.s}"><circle r="62" fill="url(#mg-glow)"/></g>
        <rect x="-22" y="-34" width="44" height="74" rx="10" fill="#EAF1FF"/>
        <rect x="-22" y="-37" width="44" height="74" rx="10" fill="#FFFFFF" stroke="#9CBDF8" stroke-width="1.5"/>
        <rect x="-17" y="-30" width="34" height="56" rx="5" fill="#F8FAFC"/>
        <g class="mine__w${still(p)}" style="--s:${p.s}"><rect x="-17" y="-30" width="34" height="56" rx="5" fill="#EAF1FF"/></g>
        <image href="${QSM}" x="-11" y="-23" width="22" height="22"/>
        <rect x="-10" y="6" width="20" height="3" rx="1.5" fill="#CFE0FB"/>
        <rect x="-7" y="13" width="14" height="3" rx="1.5" fill="#CFE0FB"/>
        <path d="M-5 31.5h10" stroke="#CFE0FB" stroke-width="2" stroke-linecap="round"/>
        <g class="mine__w${still(p)}" style="--s:${p.s}">
          <rect x="-22" y="-37" width="44" height="74" rx="10" fill="none" stroke="#1557FF" stroke-width="2.2"/>
          <g transform="translate(${lx} ${ly})">
            <rect x="-32" y="-13.5" width="64" height="27" rx="13.5" fill="#1557FF"/>
            <text x="0" y="5" text-anchor="middle" font-family="${DFONT}" font-size="14" font-weight="600" fill="#FFFFFF">+1 Q</text>
          </g>
        </g>
        <circle class="mine__ping" style="--o:${p.k}" cx="22" cy="-37" r="8.5" fill="#17A673" opacity=".16"/>
        <circle cx="22" cy="-37" r="5" fill="#17A673" stroke="#FFFFFF" stroke-width="1.8"/>
      </g>`;
}).join('');

const hero = `<section class="hero hero--mine">
  <div class="wrap">
    <div class="hero__grid">
      <div class="hero__copy">
        <p class="eyebrow">Proof of Contribution &middot; one Q a day</p>
        <h1 class="d1">Mined by<br><strong>staying online</strong></h1>
        <p class="hero__sub">One Q a day<br>for every Palm node online</p>
        <p class="hero__note">A Q is a digital unit given for Proof of Contribution. Every Palm node that stays online for a day receives one Q. Qs are not tokens: each one is non-fungible, tied to the node and the day it records. With 20,000 Palm nodes that is at most 7.3 million Q a year, for ten years.</p>
        <div class="hero__cta">
          <a class="btn btn--solid" href="#how">How it works ${icon('next')}</a>
        </div>
        <dl class="hero__facts">
          <div><dt>73,000,000</dt><dd>Q at most, ever</dd></div>
          <div><dt>1 Q a day</dt><dd>per Palm node online</dd></div>
          <div><dt>10 years</dt><dd>of mining</dd></div>
        </dl>
      </div>

      <div class="hero__stage" data-hero-stage>
        <div class="hero__bg gl" data-gl="sphere" data-points="3200" data-chords="150" aria-hidden="true"></div>
        <span class="hero__halo" aria-hidden="true"></span>
        <span class="hero__ring hero__ring--a" aria-hidden="true"></span>
        <span class="hero__ring hero__ring--b" aria-hidden="true"></span>
        <svg class="mine mine--under" viewBox="0 0 600 600" aria-hidden="true" focusable="false">
          <circle class="mine__round" cx="300" cy="300" r="210" fill="none" stroke="#1557FF" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1319.5" stroke-dashoffset="330" transform="rotate(-90 300 300)"/>${beams}
        </svg>
        <img class="hero__q" src="assets/img/qicon.png"
             alt="The QuFi mark, with Palm node phones around it, each one online receiving 1 Q a day" width="1100" height="996"
             fetchpriority="high" decoding="async">
        <span class="hero__orbit" aria-hidden="true"><i></i></span>
        <svg class="mine mine--over" viewBox="0 0 600 600" aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id="mg-glow"><stop offset="0" stop-color="#1557FF" stop-opacity=".26"/><stop offset="1" stop-color="#1557FF" stop-opacity="0"/></radialGradient>
          </defs>${coins}${phoneMarks}
          <g transform="translate(300 472)">
            <rect x="-92" y="-14" width="184" height="28" rx="14" fill="#FFFFFF" stroke="#CFE0FB" stroke-width="1.25"/>
            <circle class="mine__tick" cx="-74" cy="0" r="3.5" fill="#1557FF"/>
            <text x="-63" y="3.7" font-family="${DFONT}" font-size="10.5" font-weight="600" letter-spacing="1.2" fill="#1557FF">1 Q A DAY PER NODE</text>
          </g>
        </svg>
      </div>
    </div>

    <p class="hero__scroll" aria-hidden="true"><span>Scroll</span><i></i></p>
  </div>
</section>`;

/* One day, drawn in the site's diagram palette (diagram-kit.mjs C). */
const dayDiagram = `
<figure class="diagram">
  <div class="diagram__stage">
    <span class="diagram__glow" aria-hidden="true"></span>
    <svg class="qm-round" viewBox="0 0 760 220" role="img" font-family="${DFONT}"
         aria-label="One day: the Palm node stays online, it is checked through the day, the day closes, and every node that stayed online receives 1 Q. Then the next day starts.">
      <defs><marker id="qm-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#9CBDF8"/></marker></defs>
      <g fill="none" stroke="#9CBDF8" stroke-width="1.5">
        <path d="M184 90H208" marker-end="url(#qm-ar)"/>
        <path d="M368 90H392" marker-end="url(#qm-ar)"/>
        <path d="M552 90H576" marker-end="url(#qm-ar)"/>
        <path d="M656 118V170H104V122" marker-end="url(#qm-ar)"/>
      </g>
      <g fill="#FFFFFF" stroke="#CFE0FB" stroke-width="1.25">
        <rect x="24" y="62" width="160" height="56" rx="10"/>
        <rect x="208" y="62" width="160" height="56" rx="10"/>
        <rect x="392" y="62" width="160" height="56" rx="10"/>
      </g>
      <rect x="576" y="62" width="160" height="56" rx="10" fill="#EAF1FF" stroke="#1557FF" stroke-width="2"/>
      <g text-anchor="middle">
        <text x="104" y="86" font-size="13" font-weight="600" fill="#071018">Node online</text>
        <text x="104" y="103" font-size="11.5" fill="#5D646F">the Palm node app runs</text>
        <text x="288" y="86" font-size="13" font-weight="600" fill="#071018">Checked all day</text>
        <text x="288" y="103" font-size="11.5" fill="#5D646F">signed heartbeats</text>
        <text x="472" y="86" font-size="13" font-weight="600" fill="#071018">The day closes</text>
        <text x="472" y="103" font-size="11.5" fill="#5D646F">who stayed online?</text>
        <text x="656" y="86" font-size="13" font-weight="600" fill="#071018">1 Q credited</text>
        <text x="656" y="103" font-size="11.5" fill="#1557FF">to each online node</text>
        <text x="380" y="192" font-size="11.5" fill="#878D98">the next day starts</text>
      </g>
    </svg>
  </div>
  <figcaption>Every node that stayed online for the day receives one Q. A node that was offline receives none for that day.</figcaption>
</figure>`;

/* Total Q mined over the ten years, with all 20,000 Palm nodes online every day,
   and a hover readout. The burn line shows the 7.3 million Q bought back each year. */
const supplyChart = `
<style>
  .qm-chart { position: relative; background: #FFFFFF; border: 1px solid var(--line); border-radius: 16px; padding: 22px 22px 12px; }
  .qm-chart h3 { margin: 0 0 6px; }
  .qm-chart svg { display: block; width: 100%; height: auto; touch-action: pan-y; }
  .qm-tip { position: absolute; pointer-events: none; background: #FFFFFF; color: var(--ink); border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; font-size: 13px; line-height: 1.45; box-shadow: 0 10px 30px rgba(7, 26, 77, .12); white-space: nowrap; font-variant-numeric: tabular-nums; }
  .qm-tip b { display: block; color: var(--ink); }
</style>
<div class="qm-chart">
  <h3 class="d5">Q mined over the ten years, all 20,000 Palm nodes online</h3>
  <div style="position:relative">
    <svg id="qm-supply" viewBox="0 0 720 320" role="img" font-family="${DFONT}"
         aria-label="Total Q mined rises by 7.3 million a year, from zero to 73 million after ten years, with all 20,000 Palm nodes online every day."></svg>
    <div class="qm-tip" id="qm-tip" hidden></div>
  </div>
</div>
<script>
(function () {
  var svg = document.getElementById('qm-supply'), tip = document.getElementById('qm-tip');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg', X0 = 64, X1 = 700, Y0 = 24, Y1 = 272, YEARS = 10, CAP = 73000000, PER_YEAR = 7300000;
  function total(t) { return Math.min(CAP, t * PER_YEAR); }
  function x(t) { return X0 + (t / YEARS) * (X1 - X0); }
  function y(v) { return Y1 - (v / 80000000) * (Y1 - Y0); }
  function el(n, a, t) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (t !== undefined) e.textContent = t; svg.appendChild(e); return e; }
  for (var m = 0; m <= 80; m += 10) {
    el('line', { x1: X0, x2: X1, y1: y(m * 1e6), y2: y(m * 1e6), stroke: '#E5E9F0' });
    el('text', { x: X0 - 10, y: y(m * 1e6) + 4, 'text-anchor': 'end', 'font-size': 12, fill: '#878D98' }, m ? m + 'M' : '0');
  }
  for (var tk = 0; tk <= YEARS; tk += 1) el('text', { x: x(tk), y: Y1 + 20, 'text-anchor': 'middle', 'font-size': 12, fill: '#878D98' }, String(tk));
  el('text', { x: (X0 + X1) / 2, y: Y1 + 42, 'text-anchor': 'middle', 'font-size': 12, fill: '#878D98' }, 'Years after mining starts');
  el('line', { x1: X0, x2: X1, y1: y(CAP), y2: y(CAP), stroke: '#1557FF', 'stroke-dasharray': '4 5', 'stroke-opacity': '.5' });
  el('text', { x: X0 + 8, y: y(CAP) - 8, 'font-size': 12, 'font-weight': 600, fill: '#1557FF' }, '73,000,000 Q, the most there can be');
  var d = 'M' + x(0) + ' ' + y(0) + 'L' + x(YEARS) + ' ' + y(CAP);
  el('path', { d: d + 'L' + x(YEARS) + ' ' + Y1 + 'L' + X0 + ' ' + Y1 + 'Z', fill: 'rgba(21, 87, 255, 0.08)' });
  el('path', { d: d, fill: 'none', stroke: '#1557FF', 'stroke-width': 2, 'stroke-linejoin': 'round' });
  [[1, '7.3M after year 1'], [5, '36.5M after year 5']].forEach(function (n) {
    el('circle', { cx: x(n[0]), cy: y(total(n[0])), r: 4.5, fill: '#1557FF', stroke: '#FFFFFF', 'stroke-width': 2 });
    el('text', { x: x(n[0]) + 10, y: y(total(n[0])) + 18, 'font-size': 12.5, 'font-weight': 600, fill: '#071018' }, n[1]);
  });
  var cross = el('line', { x1: 0, x2: 0, y1: Y0, y2: Y1, stroke: '#9CBDF8', visibility: 'hidden' });
  var dot = el('circle', { r: 5, fill: '#1557FF', stroke: '#FFFFFF', 'stroke-width': 2, visibility: 'hidden' });
  var hit = el('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, fill: 'transparent' });
  function show(e) {
    var r = svg.getBoundingClientRect(), sx = (e.clientX - r.left) * (720 / r.width);
    var t = Math.round(Math.max(0, Math.min(YEARS, ((sx - X0) / (X1 - X0)) * YEARS)) * 4) / 4;
    var v = total(t);
    cross.setAttribute('x1', x(t)); cross.setAttribute('x2', x(t)); cross.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', x(t)); dot.setAttribute('cy', y(v)); dot.setAttribute('visibility', 'visible');
    tip.innerHTML = '<b>Year ' + (t % 1 ? t.toFixed(2) : t) + '</b>' + Math.round(v).toLocaleString('en-US') + ' Q mined<br>' + Math.round(t * 365).toLocaleString('en-US') + ' Q for one node online every day';
    tip.hidden = false;
    var px = (x(t) / 720) * r.width, py = (y(v) / 320) * r.height, w = tip.offsetWidth;
    tip.style.left = Math.max(0, Math.min(r.width - w, px + 14 > r.width - w ? px - w - 14 : px + 14)) + 'px';
    tip.style.top = Math.max(0, py - 56) + 'px';
  }
  function hide() { tip.hidden = true; cross.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); }
  hit.addEventListener('pointermove', show); hit.addEventListener('pointerdown', show); hit.addEventListener('pointerleave', hide);
})();
</script>`;

export const mining = {
  slug: 'index',
  metaTitle: 'Q Mining · QuFi Network',
  title: 'Mined by **staying online**',
  section: 'Mining',
  description: 'Qs are non-fungible digital units given for Proof of Contribution: every Palm node that stays online for a day receives one Q. With 20,000 Palm nodes over ten years that is at most 73 million Q, matching the 7.3 million Q bought back and burnt each year.',
  navActive: 'network.html',
  custom: hero,
  sections: [
    {
      id: 'what', nav: 'What a Q is',
      blocks: [
        { type: 'head', eyebrow: 'What a Q is', title: 'A unit of **Proof of Contribution**',
          lede: 'A Q is a digital unit the network gives for Proof of Contribution. It records one thing: a Palm node was online and doing its job for a whole day. Qs are not tokens, and no two are the same.' },
        {
          type: 'features', cards: true, cols: 3,
          items: [
            { icon: 'clock', title: 'One day online', text: 'Each Q stands for one day a Palm node stayed online. A node online for a year has 365 of them.' },
            { icon: 'fingerprint', title: 'Non-fungible', text: 'Every Q is tied to the node that earned it and the day it records, so no Q is interchangeable with another.' },
            { icon: 'badge', title: 'Not a token', text: 'A Q is a record of contribution given by the network, not a token, a coin or a security, and not a claim on anything.' },
          ],
        },
      ],
    },
    {
      id: 'model', nav: 'Proof of Contribution',
      blocks: [
        { type: 'head', eyebrow: 'Proof of Contribution', title: 'One day online, **one Q**',
          lede: 'Proof of work rewards computing power. Proof of stake rewards money locked up. Proof of Contribution counts the thing the Palm network actually runs on: Palm nodes that stay online, each one proven by a key inside the phone.' },
        {
          type: 'features', cards: true, cols: 3,
          items: [
            { icon: 'mobile', title: 'Being online is the work', text: 'Staying reachable is what keeps Palm vaults able to sign. Nothing is burned to mine a Q.' },
            { icon: 'fingerprint', title: 'Every day is proven', text: 'Each heartbeat is signed by a key in the phone\'s security chip, so it cannot be made in advance or copied to another device.' },
            { icon: 'scale', title: 'The same for every node', text: 'One Q per node per online day. No draw and no luck: more money or more servers buy no extra Q for a node.' },
          ],
        },
        {
          type: 'table', label: 'Three ways to reward a network',
          head: ['', 'Proof of work', 'Proof of stake', 'Proof of Contribution'],
          rows: [
            ['What earns a reward', 'Computing power', 'Coins locked up', 'A Palm node online for the day'],
            ['What it takes to join', 'Mining rigs and electricity', 'Capital at risk', 'A Palm node on a phone that stays online'],
            ['How much', 'Depends on hardware', 'Depends on stake', 'One Q per node per day, the same for every node'],
            ['How it is decided', 'First to solve a puzzle', 'Chosen by stake', 'Every node that stayed online, no draw'],
          ],
        },
      ],
    },
    {
      id: 'how', nav: 'How it works',
      blocks: [
        { type: 'head', eyebrow: 'How it works', title: 'Four steps, **every day**',
          lede: 'Mining runs on the Palm nodes that already sign Palm payments. Staying online is the work.' },
        {
          type: 'rail', label: 'One day',
          items: [
            { icon: 'mobile', title: 'Stay online', text: 'The Palm node app sends a signed heartbeat every 5 minutes from the phone.' },
            { icon: 'stamp', title: 'Checked all day', text: 'Each heartbeat is checked against the node\'s own hardware key, so no one can answer for it.' },
            { icon: 'clock', title: 'The day closes', text: 'At the end of the day the network counts which nodes stayed online.' },
            { icon: 'q', title: '1 Q credited', text: 'Every node that stayed online receives one Q. Anyone can check it from public data.' },
          ],
        },
      ],
    },
    {
      id: 'day', nav: 'One day', tint: true,
      blocks: [
        { type: 'head', eyebrow: 'One day', title: 'From a day online to **Q**' },
        { type: 'raw', html: dayDiagram },
      ],
    },
    {
      id: 'who', nav: 'Who mines',
      blocks: [
        { type: 'head', eyebrow: 'Who mines', title: 'Three checks, **every day**',
          lede: 'A node mines its Q for the day only when all three hold. Uptime is the easiest thing to fake, so each day has to be proven by one real phone running one licensed node.' },
        {
          type: 'checks', cols: 3,
          items: [
            { icon: 'badge', title: 'A Palm node licence', text: 'The phone joined with an invite or licence signed by the network key.' },
            { icon: 'fingerprint', title: 'A real phone', text: 'Its key lives in the phone\'s security chip, proven by Android Key Attestation. Emulators and servers cannot fake that proof.' },
            { icon: 'clock', title: 'Online for the day', text: 'A heartbeat in every 5 minute slot of the day, with up to 10 minutes of grace for a network blip.' },
          ],
        },
      ],
    },
    {
      id: 'supply', nav: 'Supply', tint: true,
      blocks: [
        { type: 'head', eyebrow: 'Supply', title: 'Ten years, **73 million Q**',
          lede: '20,000 Palm nodes × 365 days × 10 years = 73,000,000 Q. That is the most there can ever be: fewer nodes online means fewer Q. Each year the treasury, funded by half of every Palm fee, buys back 7.3 million Q and burns it, the same as the most that can be mined in a year.' },
        {
          type: 'stats',
          items: [
            { value: '73,000,000', key: 'Q at most', note: 'over ten years' },
            { value: '7,300,000', key: 'Q a year at most', note: '20,000 nodes × 365 days' },
            { value: '3,650', key: 'Q for one node', note: 'online every day for ten years' },
            { value: '7,300,000', key: 'Q burnt a year', note: 'bought back by the treasury' },
          ],
        },
        { type: 'raw', html: supplyChart },
        {
          type: 'table', label: 'Year by year, all 20,000 Palm nodes online',
          head: ['Year', 'Mined that year', 'Mined in total', 'Bought back and burnt that year'],
          rows: Array.from({ length: 10 }, (_, i) => [String(i + 1), '7,300,000', ((i + 1) * 7300000).toLocaleString('en-US'), '7,300,000']),
        },
      ],
    },
  ],
};
