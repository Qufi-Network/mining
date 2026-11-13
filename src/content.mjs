/* The $Q mining page, written in qufi.network's own content format and rendered
   with its own layout (../qufi-protocol/src/layout.mjs), so the header, footer,
   type, cards, icons and buttons are the site's, not a copy of them. */

import { icon } from '../../qufi-protocol/src/icons.mjs';

const DFONT = "Inter, -apple-system, 'Segoe UI', system-ui, sans-serif";

/* The hero is the home page's own stage (point globe, halo, two rings, the
   orbiting bead and the floating Q) with eight node phones threaded on the
   outer ring. Every round the inner ring fills, the Q sends a coin out to one
   phone and that phone lights up with +1 $Q. Frame zero is a finished picture
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
            <text x="0" y="5" text-anchor="middle" font-family="${DFONT}" font-size="14" font-weight="600" fill="#FFFFFF">+1 $Q</text>
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
        <p class="eyebrow">$Q mining</p>
        <h1 class="d1">Mined by<br><strong>staying online</strong></h1>
        <p class="hero__sub">A fair chance at $Q<br>every 10 minutes</p>
        <p class="hero__note">Every licensed phone that keeps the QuFi node network running gets one ticket in a public draw. No mining rigs and no wasted power, and nobody, QuFi included, can predict or change the result.</p>
        <div class="hero__cta">
          <a class="btn btn--solid" href="#how">How it works ${icon('next')}</a>
        </div>
        <dl class="hero__facts">
          <div><dt>50,000,000</dt><dd>$Q, a fixed cap</dd></div>
          <div><dt>Every 4 years</dt><dd>the reward halves</dd></div>
          <div><dt>1,000 nodes</dt><dd>before the first round</dd></div>
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
             alt="The QuFi mark, with node phones around it, one of them winning 1 $Q" width="1100" height="996"
             fetchpriority="high" decoding="async">
        <span class="hero__orbit" aria-hidden="true"><i></i></span>
        <svg class="mine mine--over" viewBox="0 0 600 600" aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id="mg-glow"><stop offset="0" stop-color="#1557FF" stop-opacity=".26"/><stop offset="1" stop-color="#1557FF" stop-opacity="0"/></radialGradient>
          </defs>${coins}${phoneMarks}
          <g transform="translate(300 472)">
            <rect x="-80" y="-14" width="160" height="28" rx="14" fill="#FFFFFF" stroke="#CFE0FB" stroke-width="1.25"/>
            <circle class="mine__tick" cx="-62" cy="0" r="3.5" fill="#1557FF"/>
            <text x="-51" y="3.7" font-family="${DFONT}" font-size="10.5" font-weight="600" letter-spacing="1.2" fill="#1557FF">DRAW EVERY 10 MIN</text>
          </g>
        </svg>
      </div>
    </div>

    <p class="hero__scroll" aria-hidden="true"><span>Scroll</span><i></i></p>
  </div>
</section>`;

/* One round, drawn in the site's diagram palette (diagram-kit.mjs C). */
const roundDiagram = `
<figure class="diagram">
  <div class="diagram__stage">
    <span class="diagram__glow" aria-hidden="true"></span>
    <svg class="qm-round" viewBox="0 0 760 304" role="img" font-family="${DFONT}"
         aria-label="One round: a new random value, eligible phones each get one ticket, tickets below the target win, the claim is checked and 1 $Q is credited, then the target adjusts for the next round.">
      <defs><marker id="qm-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#9CBDF8"/></marker></defs>
      <g fill="none" stroke="#9CBDF8" stroke-width="1.5">
        <path d="M184 118H208" marker-end="url(#qm-ar)"/>
        <path d="M368 118H392" marker-end="url(#qm-ar)"/>
        <path d="M552 118H584" marker-end="url(#qm-ar)"/>
        <path d="M648 158V222" marker-end="url(#qm-ar)"/>
        <path d="M576 250H552" marker-end="url(#qm-ar)"/>
        <path d="M392 250H368" marker-end="url(#qm-ar)"/>
        <path d="M208 250H104V146" marker-end="url(#qm-ar)"/>
        <path d="M648 78V58H104V90" marker-end="url(#qm-ar)"/>
      </g>
      <g fill="#FFFFFF" stroke="#CFE0FB" stroke-width="1.25">
        <rect x="24" y="90" width="160" height="56" rx="10"/>
        <rect x="208" y="90" width="160" height="56" rx="10"/>
        <rect x="392" y="90" width="160" height="56" rx="10"/>
        <polygon points="584,118 648,78 712,118 648,158"/>
        <rect x="576" y="222" width="160" height="56" rx="10"/>
        <rect x="208" y="222" width="160" height="56" rx="10"/>
      </g>
      <rect x="392" y="222" width="160" height="56" rx="10" fill="#EAF1FF" stroke="#1557FF" stroke-width="2"/>
      <g text-anchor="middle">
        <text x="104" y="114" font-size="13" font-weight="600" fill="#071018">Round starts</text>
        <text x="104" y="131" font-size="11.5" fill="#5D646F">a new random value</text>
        <text x="288" y="114" font-size="13" font-weight="600" fill="#071018">Eligible phones</text>
        <text x="288" y="131" font-size="11.5" fill="#5D646F">licensed and online</text>
        <text x="472" y="114" font-size="13" font-weight="600" fill="#071018">One ticket each</text>
        <text x="472" y="131" font-size="11.5" fill="#5D646F">SHA256(value, key)</text>
        <text x="648" y="122" font-size="13" font-weight="600" fill="#071018">Below target?</text>
        <text x="656" y="246" font-size="13" font-weight="600" fill="#071018">Claim checked</text>
        <text x="656" y="263" font-size="11.5" fill="#5D646F">anyone can recheck</text>
        <text x="472" y="246" font-size="13" font-weight="600" fill="#071018">1 $Q credited</text>
        <text x="472" y="263" font-size="11.5" fill="#1557FF">to the phone's owner</text>
        <text x="288" y="246" font-size="13" font-weight="600" fill="#071018">Target adjusts</text>
        <text x="288" y="263" font-size="11.5" fill="#5D646F">toward planned wins</text>
        <text x="376" y="48" font-size="11.5" fill="#878D98">no win: next round</text>
      </g>
      <text x="658" y="194" font-size="11.5" fill="#878D98">yes</text>
      <text x="112" y="204" font-size="11.5" fill="#878D98">next round, new target</text>
    </svg>
  </div>
  <figcaption>Each phone gets one ticket a round. A ticket under the target wins 1 $Q, and the target then moves toward the planned number of wins for the next round.</figcaption>
</figure>`;

/* Total $Q mined over 40 years: drawn from the schedule itself, with a hover
   readout. The schedule is the published one: half the supply in the first
   210,000 rounds, half of what is left in each era after. */
const supplyChart = `
<style>
  .qm-chart { position: relative; background: #FFFFFF; border: 1px solid var(--line); border-radius: 16px; padding: 22px 22px 12px; }
  .qm-chart h3 { margin: 0 0 6px; }
  .qm-chart svg { display: block; width: 100%; height: auto; touch-action: pan-y; }
  .qm-tip { position: absolute; pointer-events: none; background: #FFFFFF; color: var(--ink); border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; font-size: 13px; line-height: 1.45; box-shadow: 0 10px 30px rgba(7, 26, 77, .12); white-space: nowrap; font-variant-numeric: tabular-nums; }
  .qm-tip b { display: block; color: var(--ink); }
</style>
<div class="qm-chart">
  <h3 class="d5">Total $Q mined over the first 40 years</h3>
  <div style="position:relative">
    <svg id="qm-supply" viewBox="0 0 720 320" role="img" font-family="${DFONT}"
         aria-label="Total $Q mined rises to 25 million by year 4, 37.5 million by year 8 and about 48.4 million by year 20, approaching the 50 million cap."></svg>
    <div class="qm-tip" id="qm-tip" hidden></div>
  </div>
</div>
<script>
(function () {
  var svg = document.getElementById('qm-supply'), tip = document.getElementById('qm-tip');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg', X0 = 64, X1 = 700, Y0 = 24, Y1 = 272, YEARS = 40, CAP = 50000000;
  function total(t) { var k = Math.min(Math.floor(t / 4), 60); return CAP * (1 - Math.pow(2, -k)) + ((t - 4 * k) / 4) * (CAP / 2) * Math.pow(2, -k); }
  function x(t) { return X0 + (t / YEARS) * (X1 - X0); }
  function y(v) { return Y1 - (v / CAP) * (Y1 - Y0); }
  function el(n, a, t) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (t !== undefined) e.textContent = t; svg.appendChild(e); return e; }
  for (var m = 0; m <= 50; m += 10) {
    el('line', { x1: X0, x2: X1, y1: y(m * 1e6), y2: y(m * 1e6), stroke: '#E5E9F0' });
    el('text', { x: X0 - 10, y: y(m * 1e6) + 4, 'text-anchor': 'end', 'font-size': 12, fill: '#878D98' }, m ? m + 'M' : '0');
  }
  for (var h = 4; h < YEARS; h += 4) el('line', { x1: x(h), x2: x(h), y1: Y0, y2: Y1, stroke: '#CFE0FB', 'stroke-dasharray': '3 4' });
  for (var tk = 0; tk <= YEARS; tk += 4) el('text', { x: x(tk), y: Y1 + 20, 'text-anchor': 'middle', 'font-size': 12, fill: '#878D98' }, String(tk));
  el('text', { x: (X0 + X1) / 2, y: Y1 + 42, 'text-anchor': 'middle', 'font-size': 12, fill: '#878D98' }, 'Years after mining starts (dashed lines are halvings)');
  var pts = []; for (var t = 0; t <= YEARS + 1e-9; t += 0.25) pts.push([x(t), y(total(t))]);
  var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('');
  el('path', { d: d + 'L' + x(YEARS) + ' ' + Y1 + 'L' + X0 + ' ' + Y1 + 'Z', fill: 'rgba(21, 87, 255, 0.08)' });
  el('path', { d: d, fill: 'none', stroke: '#1557FF', 'stroke-width': 2, 'stroke-linejoin': 'round' });
  [[4, '50% by year 4'], [8, '75% by year 8'], [20, '97% by year 20']].forEach(function (n) {
    el('circle', { cx: x(n[0]), cy: y(total(n[0])), r: 4.5, fill: '#1557FF', stroke: '#FFFFFF', 'stroke-width': 2 });
    el('text', { x: x(n[0]) + 10, y: y(total(n[0])) + 18, 'font-size': 12.5, 'font-weight': 600, fill: '#071018' }, n[1]);
  });
  var cross = el('line', { x1: 0, x2: 0, y1: Y0, y2: Y1, stroke: '#9CBDF8', visibility: 'hidden' });
  var dot = el('circle', { r: 5, fill: '#1557FF', stroke: '#FFFFFF', 'stroke-width': 2, visibility: 'hidden' });
  var hit = el('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, fill: 'transparent' });
  function show(e) {
    var r = svg.getBoundingClientRect(), sx = (e.clientX - r.left) * (720 / r.width);
    var t = Math.round(Math.max(0, Math.min(YEARS, ((sx - X0) / (X1 - X0)) * YEARS)) * 4) / 4;
    var v = total(t), era = Math.min(Math.floor(t / 4) + 1, 10);
    cross.setAttribute('x1', x(t)); cross.setAttribute('x2', x(t)); cross.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', x(t)); dot.setAttribute('cy', y(v)); dot.setAttribute('visibility', 'visible');
    tip.innerHTML = '<b>Year ' + (t % 1 ? t.toFixed(2) : t) + '</b>' + Math.round(v).toLocaleString('en-US') + ' $Q mined<br>' + (v / CAP * 100).toFixed(1) + '% of the cap, era ' + era;
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
  metaTitle: '$Q Mining · QuFi Network',
  title: 'Mined by **staying online**',
  section: 'Mining',
  description: 'Every licensed phone that keeps the QuFi node network running gets one fair chance every 10 minutes to mine 1 $Q, from a public draw nobody can predict or change.',
  navActive: 'network.html',
  custom: hero,
  sections: [
    {
      id: 'how', nav: 'How it works',
      blocks: [
        { type: 'head', eyebrow: 'How it works', title: 'Four steps, **every 10 minutes**',
          lede: 'Mining runs on the phones that already keep the network running. Staying online is the work.' },
        {
          type: 'rail', label: 'One round',
          items: [
            { icon: 'mobile', title: 'Stay online', text: 'The QuFi Node app sends a signed heartbeat every 5 minutes. Each one carries the latest public random number, so it cannot be made in advance.' },
            { icon: 'stamp', title: 'Get one ticket', text: 'Each round, every eligible phone gets exactly one ticket, worked out from the round\'s random number and the phone\'s own hardware key.' },
            { icon: 'target', title: 'The draw', text: 'Tickets below the round\'s target win. The target adjusts like Bitcoin\'s difficulty, so the network mines the planned amount however many phones join.' },
            { icon: 'q', title: 'Win 1 $Q', text: 'Anyone can check a win from public data alone. The $Q is credited to the phone owner\'s account.' },
          ],
        },
      ],
    },
    {
      id: 'round', nav: 'One round', tint: true,
      blocks: [
        { type: 'head', eyebrow: 'One round', title: 'From random number to **$Q**' },
        { type: 'raw', html: roundDiagram },
      ],
    },
    {
      id: 'who', nav: 'Who can win',
      blocks: [
        { type: 'head', eyebrow: 'Who can win', title: 'Four checks, **every round**',
          lede: 'A phone is in the draw only when all four hold. Uptime is the easiest thing to fake, so each ticket has to cost one real phone, one licence and one person.' },
        {
          type: 'checks', cols: 2,
          items: [
            { icon: 'badge', title: 'A node licence', text: 'The phone joined with an invite or licence signed by the network key.' },
            { icon: 'fingerprint', title: 'A real phone', text: 'Its key lives in the phone\'s security chip, proven by Android Key Attestation. Emulators and servers cannot fake that proof.' },
            { icon: 'clock', title: 'Online for the last day', text: 'A heartbeat in every 5 minute slot for 24 hours, with up to 10 minutes of grace for a network blip.' },
            { icon: 'user', title: 'One per person', text: 'Each person mines with a capped number of phones. Extra phones earn nothing more.' },
          ],
        },
      ],
    },
    {
      id: 'fair', nav: 'A fair draw', tint: 'panel',
      blocks: [
        { type: 'head', eyebrow: 'A fair draw', title: 'Nobody can rig the **random number**' },
        { type: 'quote', narrow: true, cite: 'How the draw works',
          text: 'Think of a raffle where every ticket was printed the day before, and the winning number is drawn by many independent referees who each sign it. Nobody can change a ticket, and nobody can pick the number.' },
        {
          type: 'features', cards: true, cols: 4,
          items: [
            { icon: 'users', title: 'Made by many, not one', text: 'The number comes from drand, run by the independent operators of the League of Entropy. None of them knows it in advance or can set it alone.' },
            { icon: 'shieldCheck', title: 'Signed and checked', text: 'Each number is signed. The app holds drand\'s public key and refuses any number whose signature does not check out.' },
            { icon: 'lock', title: 'Everything fixed first', text: 'Phone keys, who is eligible and the target are all settled before the number exists, so nothing can be adjusted after seeing it.' },
            { icon: 'shield', title: 'No backdoor', text: 'If drand ever stopped, mining would simply pause. It never switches to a number a person picks.' },
          ],
        },
      ],
    },
    {
      id: 'work', nav: 'Proof of contribution',
      blocks: [
        { type: 'head', eyebrow: 'Proof of contribution', title: 'Doing the work earns a **second ticket**',
          lede: 'Uptime earns a phone its ticket. A phone that answers 95% or more of the signing work it is asked for over 7 days gets one extra ticket each round. Never more than two.' },
        {
          type: 'cards', cols: 2,
          items: [
            { icon: 'check', title: 'Counts', list: ['Answering a signing round on time', 'Correctly refusing a bad request', 'Helping make a new vault\'s key', 'Later: vouching for fellow nodes\' heartbeats'] },
            { icon: 'scale', title: 'Never counts', list: ['Approving a payment. A node paid per signature would be paid to say yes, the opposite of what keeps vaults safe.', 'A refusal of a bad request scores exactly the same as a signature on a good one.'] },
          ],
        },
      ],
    },
    {
      id: 'supply', nav: 'Supply', tint: true,
      blocks: [
        { type: 'head', eyebrow: 'Supply', title: 'Built like **Bitcoin**',
          lede: '$Q follows Bitcoin\'s schedule. The $Q mined per round halves every 210,000 rounds, about every 4 years. The first era mines half of all $Q, each era after it half of the one before, approaching 50,000,000 and never passing it.' },
        {
          type: 'stats',
          items: [
            { value: '50,000,000', key: '$Q ever', note: 'a fixed cap' },
            { value: '10 minutes', key: 'per round', note: 'like a Bitcoin block' },
            { value: '4 years', key: 'between halvings', note: 'every 210,000 rounds' },
            { value: '1,000', key: 'nodes to start', note: 'before the first round runs' },
          ],
        },
        { type: 'raw', html: supplyChart },
        {
          type: 'table', label: 'The eras',
          head: ['Era', 'Years', 'Mined in the era', 'Total mined', 'Winners per round'],
          rows: [
            ['1', '0 to 4', '25,000,000', '25,000,000 (50%)', 'about 119'],
            ['2', '4 to 8', '12,500,000', '37,500,000 (75%)', 'about 60'],
            ['3', '8 to 12', '6,250,000', '43,750,000 (87.5%)', 'about 30'],
            ['4', '12 to 16', '3,125,000', '46,875,000 (94%)', 'about 15'],
            ['5', '16 to 20', '1,562,500', '48,437,500 (97%)', 'about 7'],
            ['6', '20 to 24', '781,250', '49,218,750 (98.4%)', 'about 4'],
            ['10', '36 to 40', '48,828', '49,951,172 (99.9%)', 'about 0.2'],
          ],
        },
        { type: 'text', body: ['Mining starts only once **1,000 licensed nodes** are online, so the richest first era is shared widely instead of going to a handful of early phones.'] },
      ],
    },
    {
      id: 'rollout', nav: 'Rollout',
      blocks: [
        { type: 'head', eyebrow: 'Rollout', title: 'Step by step, **on the test network first**' },
        {
          type: 'rail', label: 'Rollout',
          items: [
            { title: 'Three phone trial', text: 'Phones sign Palm payments for real. No mining yet.' },
            { title: 'Heartbeats only', text: 'The app sends heartbeats and shows how long the phone has been online.' },
            { title: '$Q as points', text: 'Draws run and wins are credited as $Q that cannot be transferred, once 1,000 nodes are online.' },
            { title: 'Second ticket on', text: 'The extra ticket for phones that do their signing work.' },
            { title: 'Checked on chain', text: 'A program on QuFi\'s Solana network checks every claim.' },
            { title: 'Transfers, only if approved', text: 'Only after legal review in each launch country.' },
          ],
        },
        { type: 'text', body: ['Planned design, November 2026. Details may change before launch. $Q cannot be transferred at launch; any change to that needs legal review in each launch country first. Figures describe the planned schedule, not a promise of any reward.'] },
      ],
    },
  ],
};
