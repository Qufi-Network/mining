/* QuFi — interaction and motion.
 *
 * Framer-style motion without Framer: spring easing, staggered children,
 * scroll-linked progress exposed as a custom property, and magnetic hover.
 *
 * Nothing here gates content. Every animation is additive and the dash-draw
 * rules are armed only once a double requestAnimationFrame confirms the page
 * is painting, so a host that never delivers a frame still shows everything.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var rafQueued = false;
  var scrollTasks = [];

  function onScroll(fn) { scrollTasks.push(fn); }
  function runScroll() {
    for (var i = 0; i < scrollTasks.length; i++) scrollTasks[i]();
    rafQueued = false;
  }
  window.addEventListener('scroll', function () {
    if (rafQueued) return;
    rafQueued = true;
    requestAnimationFrame(runScroll);
  }, { passive: true });
  window.addEventListener('resize', function () {
    if (rafQueued) return;
    rafQueued = true;
    requestAnimationFrame(runScroll);
  }, { passive: true });

  if (!reduce && typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { root.classList.add('anim'); });
    });
  }

  /* --------------------------------------------------------- head state
     The header condenses once the page has moved. Registered on the shared
     scroll loop rather than its own listener, and it only ever toggles a
     class, so nothing here can affect whether content is readable. */

  var head = document.querySelector('.site-head');
  if (head) {
    var headOn = false;
    onScroll(function () {
      var on = (window.pageYOffset || document.documentElement.scrollTop) > 24;
      if (on !== headOn) {
        headOn = on;
        head.classList.toggle('is-scrolled', on);
      }
    });
  }

  /* ---------------------------------------------------------------- nav */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Header condenses once you leave the hero */
  var head = document.querySelector('.site-head');
  if (head) {
    onScroll(function () {
      head.setAttribute('data-stuck', String(window.scrollY > 24));
    });
  }

  /* ------------------------------------------------------------- reveals */

  var reveals = [].slice.call(document.querySelectorAll('.reveal'));

  function markVisible() {
    var vh = window.innerHeight;
    for (var i = reveals.length - 1; i >= 0; i--) {
      var el = reveals[i];
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.96 && r.bottom > 0) {
        el.classList.add('in');
        reveals.splice(i, 1);
      }
    }
  }

  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
        var i = reveals.indexOf(en.target);
        if (i > -1) reveals.splice(i, 1);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.02 });
    reveals.slice().forEach(function (el) { io.observe(el); });
    setTimeout(markVisible, 900);
    onScroll(markVisible);
  } else {
    reveals.slice().forEach(function (el) { el.classList.add('in'); });
    reveals.length = 0;
  }

  /* Staggered children: each direct child of a [data-stagger] gets an index
     so the stylesheet can offset its entrance. */
  [].slice.call(document.querySelectorAll('[data-stagger]')).forEach(function (host) {
    var kids = host.children;
    for (var i = 0; i < kids.length; i++) {
      kids[i].style.setProperty('--i', String(i));
      kids[i].classList.add('stagger-item');
    }
  });

  /* --------------------------------------------- scroll-linked progress
     Each [data-track] gets --p from 0 to 1 as it crosses the viewport, so
     CSS can drive parallax, scale and opacity off real scroll position. */

  var tracked = [].slice.call(document.querySelectorAll('[data-track]'));
  if (tracked.length && !reduce) {
    onScroll(function () {
      var vh = window.innerHeight;
      tracked.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var p = 1 - (r.top + r.height * 0.5) / (vh + r.height * 0.5);
        el.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(4));
      });
    });
  }

  /* ------------------------------------------------------ arrival
     Content settles into place as it is scrolled to, and unsettles if you
     scroll back — scroll-linked rather than a one-shot entrance, which is what
     makes it feel attached to the wheel.

     --ap runs 0 to 1 as an element's top rises from the bottom of the viewport
     to 72% of the way up, so a block is fully arrived a little before it
     reaches the middle of the screen. It defaults to 1 in CSS, so no script
     means no offset and nothing is ever left mid-transit. */

  var arrivals = [].slice.call(document.querySelectorAll('[data-arrive]'));
  if (arrivals.length && !reduce) {
    onScroll(function () {
      var vh = window.innerHeight || 1;
      for (var i = 0; i < arrivals.length; i++) {
        var top = arrivals[i].getBoundingClientRect().top;
        var a = (vh - top) / (vh * 0.28);
        arrivals[i].style.setProperty('--ap', Math.max(0, Math.min(1, a)).toFixed(4));
      }
    });
  }

  /* ------------------------------------------------------ footer reveal
     The footer needs its own progress value. The generic --p above measures an
     element crossing the whole viewport, and a footer at the end of the
     document never can — it tops out around 0.6 — so a reveal keyed to --p
     would never finish and would leave the footer sitting permanently low.

     --fp instead runs 0 to 1 as the footer's top rises from the bottom of the
     viewport to 45% of the way up, which completes well before the page does.
     It defaults to 1 in CSS, so no script means no offset. */

  var foot = document.querySelector('.site-foot');
  if (foot && !reduce) {
    onScroll(function () {
      var vh = window.innerHeight || 1;
      var top = foot.getBoundingClientRect().top;
      var p = (vh - top) / (vh * 0.45);
      foot.style.setProperty('--fp', Math.max(0, Math.min(1, p)).toFixed(4));
    });
  }

  /* -------------------------------------------------- scroll progress bar */

  var bar = document.querySelector('.scroll-progress i');

  onScroll(function () {
    if (bar) {
      var max = document.body.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
    }
  });

  /* ------------------------------------------------------- click burst
     A small network forms wherever the page is clicked: nodes fly out from the
     point, link to whichever neighbours are close enough, then fade. Same
     visual grammar as the constellation the icons carry, so a click reads as
     part of the same system rather than as a generic particle effect.

     Three things keep it out of the way. The canvas is created on the first
     click, so a session that never clicks pays nothing for it. It is
     pointer-events: none and lives above everything, so it can never swallow
     a click or interfere with a control. And the loop only runs while a burst
     is alive, then stops — no idle rAF. */

  if (!reduce) {
    var bCanvas = null;
    var bctx = null;
    var bursts = [];
    var bRunning = false;
    var bdpr = 1;

    function bSize() {
      bdpr = Math.min(2, window.devicePixelRatio || 1);
      bCanvas.width = Math.round(window.innerWidth * bdpr);
      bCanvas.height = Math.round(window.innerHeight * bdpr);
      bCanvas.style.width = window.innerWidth + 'px';
      bCanvas.style.height = window.innerHeight + 'px';
    }

    function bInit() {
      if (bCanvas) return true;
      bCanvas = document.createElement('canvas');
      bCanvas.className = 'click-burst';
      bCanvas.setAttribute('aria-hidden', 'true');
      /* Set inline as well as in the stylesheet. A visitor holding a cached
         older stylesheet would otherwise get this canvas with no rules at all,
         and an overlay that does not opt out of hit testing swallows every
         click on the page. Too severe a failure to leave to cache freshness. */
      bCanvas.style.cssText =
        'position:fixed;left:0;top:0;width:100%;height:100%;z-index:95;pointer-events:none';
      document.body.appendChild(bCanvas);
      bctx = bCanvas.getContext('2d');
      if (!bctx) { bCanvas.remove(); bCanvas = null; return false; }
      bSize();
      window.addEventListener('resize', bSize);
      return true;
    }

    var LIFE = 900;                  // ms a burst lives
    var LINK = 74;                   // px within which two nodes link

    function spawn(x, y) {
      var n = 13;
      var nodes = [];
      var base = Math.random() * Math.PI * 2;
      for (var i = 0; i < n; i++) {
        /* an even fan with a little jitter, so it reads as a network rather
           than as a firework */
        var a = base + (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        var speed = 46 + Math.random() * 78;
        nodes.push({
          x: x, y: y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          r: 1.3 + Math.random() * 1.7
        });
      }
      bursts.push({ t0: performance.now(), x: x, y: y, nodes: nodes });
      if (!bRunning) { bRunning = true; requestAnimationFrame(bFrame); }
    }

    function bFrame(now) {
      if (!bctx) { bRunning = false; return; }
      bctx.setTransform(bdpr, 0, 0, bdpr, 0, 0);
      bctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (var b = bursts.length - 1; b >= 0; b--) {
        var burst = bursts[b];
        var age = (now - burst.t0) / LIFE;
        if (age >= 1) { bursts.splice(b, 1); continue; }

        var ease = 1 - Math.pow(1 - age, 3);      // fast out, settling
        var fade = 1 - age;
        var nodes = burst.nodes;

        for (var i = 0; i < nodes.length; i++) {
          var nd = nodes[i];
          nd.px = burst.x + nd.vx * ease;
          nd.py = burst.y + nd.vy * ease;
        }

        /* the links, drawn first so the nodes sit on top */
        bctx.lineWidth = 1;
        for (i = 0; i < nodes.length; i++) {
          for (var j = i + 1; j < nodes.length; j++) {
            var dx = nodes[i].px - nodes[j].px;
            var dy = nodes[i].py - nodes[j].py;
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d > LINK) continue;
            bctx.strokeStyle = 'rgba(23, 97, 234, ' + (0.4 * fade * (1 - d / LINK)).toFixed(3) + ')';
            bctx.beginPath();
            bctx.moveTo(nodes[i].px, nodes[i].py);
            bctx.lineTo(nodes[j].px, nodes[j].py);
            bctx.stroke();
          }
        }

        /* and a link back to where the click landed, so the burst has a centre */
        bctx.strokeStyle = 'rgba(10, 75, 255, ' + (0.22 * fade).toFixed(3) + ')';
        for (i = 0; i < nodes.length; i++) {
          bctx.beginPath();
          bctx.moveTo(burst.x, burst.y);
          bctx.lineTo(nodes[i].px, nodes[i].py);
          bctx.stroke();
        }

        for (i = 0; i < nodes.length; i++) {
          bctx.fillStyle = 'rgba(10, 75, 255, ' + (0.9 * fade).toFixed(3) + ')';
          bctx.beginPath();
          bctx.arc(nodes[i].px, nodes[i].py, nodes[i].r * (1 - age * 0.35), 0, Math.PI * 2);
          bctx.fill();
        }

        /* the ring that leaves the click point */
        bctx.strokeStyle = 'rgba(23, 97, 234, ' + (0.5 * Math.pow(fade, 1.6)).toFixed(3) + ')';
        bctx.lineWidth = 1.4;
        bctx.beginPath();
        bctx.arc(burst.x, burst.y, 8 + ease * 64, 0, Math.PI * 2);
        bctx.stroke();

        /* and the point itself, briefly */
        if (age < 0.4) {
          bctx.fillStyle = 'rgba(10, 75, 255, ' + (0.85 * (1 - age / 0.4)).toFixed(3) + ')';
          bctx.beginPath();
          bctx.arc(burst.x, burst.y, 3.4, 0, Math.PI * 2);
          bctx.fill();
        }
      }

      if (bursts.length) { requestAnimationFrame(bFrame); }
      else { bctx.clearRect(0, 0, window.innerWidth, window.innerHeight); bRunning = false; }
    }

    document.addEventListener('pointerdown', function (e) {
      /* primary button / touch only, and never on a text selection drag */
      if (e.button !== undefined && e.button !== 0) return;
      if (!bInit()) return;
      /* cap the number in flight rather than letting a rapid clicker stack them */
      if (bursts.length > 5) bursts.shift();
      spawn(e.clientX, e.clientY);
    }, { passive: true });
  }

  /* -------------------------------------------------- animated counters */

  function animateCount(el) {
    var target = el.getAttribute('data-count') || el.textContent;
    var m = /^([^\d]*)([\d][\d,.]*)(.*)$/.exec(target);
    if (!m || reduce) return;
    var pre = m[1], num = m[2], post = m[3];
    var dec = (num.split('.')[1] || '').length;
    var end = parseFloat(num.replace(/,/g, ''));
    if (!isFinite(end) || end === 0) return;
    var group = num.indexOf(',') > -1;
    var t0 = performance.now();
    function frame(now) {
      var p = Math.min(1, (now - t0) / 1200);
      var e = 1 - Math.pow(1 - p, 4);
      var s = dec ? (end * e).toFixed(dec) : String(Math.round(end * e));
      if (group) s = Number(s).toLocaleString('en-US');
      el.textContent = pre + s + post;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var counters = [].slice.call(document.querySelectorAll('.count'));
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ------------------------------------------------------------ steppers */

  document.querySelectorAll('[data-stepper]').forEach(function (st) {
    var dots = [].slice.call(st.querySelectorAll('.stepper__dot'));
    var panels = [].slice.call(st.querySelectorAll('.stepper__panel'));
    var line = st.querySelector('.stepper__line i');
    if (line) line.style.setProperty('--w', (100 / dots.length) + '%');

    function select(i, focus) {
      dots.forEach(function (d, j) {
        d.setAttribute('aria-selected', String(j === i));
        d.tabIndex = j === i ? 0 : -1;
      });
      panels.forEach(function (p, j) {
        p.hidden = j !== i;
        if (j === i) { p.classList.remove('is-in'); void p.offsetWidth; p.classList.add('is-in'); }
      });
      if (line) line.style.setProperty('--x', (i * 100) + '%');
      st.setAttribute('data-stage', String(i));
      if (focus) dots[i].focus();
    }
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { select(i); });
      d.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); select((i + 1) % dots.length, true); }
        if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); select((i - 1 + dots.length) % dots.length, true); }
        if (k === 'Home') { e.preventDefault(); select(0, true); }
        if (k === 'End') { e.preventDefault(); select(dots.length - 1, true); }
      });
    });
    select(0);

  });

  /* ---------------------------------------------------------------- tabs */

  document.querySelectorAll('[data-tabs]').forEach(function (tb) {
    var btns = [].slice.call(tb.querySelectorAll('.tabs__btn'));
    var panels = [].slice.call(tb.querySelectorAll('.tabs__panel'));
    function select(i, focus) {
      btns.forEach(function (b, j) {
        b.setAttribute('aria-selected', String(j === i));
        b.tabIndex = j === i ? 0 : -1;
      });
      panels.forEach(function (p, j) {
        p.hidden = j !== i;
        if (j === i) { p.classList.remove('is-in'); void p.offsetWidth; p.classList.add('is-in'); }
      });
      if (focus) btns[i].focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { select(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % btns.length, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); select((i - 1 + btns.length) % btns.length, true); }
      });
    });
  });

  /* ------------------------------------------------------------ copy code */

  document.querySelectorAll('[data-copy] .code__copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = btn.closest('[data-copy]').querySelector('pre');
      if (!pre || !navigator.clipboard || !navigator.clipboard.writeText) return;
      navigator.clipboard.writeText(pre.innerText).then(function () {
        btn.setAttribute('data-done', 'true');
        var label = btn.querySelector('span');
        if (label) label.textContent = 'Copied';
        setTimeout(function () {
          btn.removeAttribute('data-done');
          if (label) label.textContent = 'Copy';
        }, 1800);
      }, function () {});
    });
  });

  /* ------------------------------------------- magnetic hover + spotlight */

  if (!reduce) {
    document.querySelectorAll('.card').forEach(function (c) {
      if (c.tagName === 'rect') return;
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width;
        var ny = (e.clientY - r.top) / r.height;
        c.style.setProperty('--mx', (nx * 100) + '%');
        c.style.setProperty('--my', (ny * 100) + '%');
        c.style.setProperty('--tx', ((nx - 0.5) * 8).toFixed(2) + 'px');
        c.style.setProperty('--ty', ((ny - 0.5) * 8).toFixed(2) + 'px');
        c.style.setProperty('--rx', ((0.5 - ny) * 4).toFixed(2) + 'deg');
        c.style.setProperty('--ry', ((nx - 0.5) * 5).toFixed(2) + 'deg');
      });
      c.addEventListener('pointerleave', function () {
        c.style.setProperty('--tx', '0px');
        c.style.setProperty('--ty', '0px');
        c.style.setProperty('--rx', '0deg');
        c.style.setProperty('--ry', '0deg');
      });
    });

    document.querySelectorAll('.btn--solid, .btn--ghost').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--bx', ((e.clientX - r.left) / r.width * 100) + '%');
      });
    });
  }

  /* ------------------------------------------------------ artwork motion */

  if (!reduce && 'IntersectionObserver' in window) {
    var stages = [].slice.call(document.querySelectorAll('.art__stage[data-tilt="on"]'));
    var live = [];
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var i = live.indexOf(en.target);
        if (en.isIntersecting && i < 0) live.push(en.target);
        if (!en.isIntersecting && i > -1) live.splice(i, 1);
      });
    }, { rootMargin: '18% 0px' });
    stages.forEach(function (s) { pio.observe(s); });

    onScroll(function () {
      var vh = window.innerHeight;
      live.forEach(function (s) {
        var img = s.querySelector('img');
        if (!img || s.hasAttribute('data-hover')) return;
        var r = s.getBoundingClientRect();
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.transform = 'translate3d(0,' + (-p * 20).toFixed(2) + 'px,0)';
      });
    });

    stages.forEach(function (s) {
      var img = s.querySelector('img');
      if (!img) return;
      s.addEventListener('pointermove', function (e) {
        var r = s.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        s.setAttribute('data-hover', '1');
        img.style.transition = 'transform .16s linear';
        img.style.transform = 'perspective(1000px) rotateY(' + (dx * 8).toFixed(2) +
          'deg) rotateX(' + (-dy * 7).toFixed(2) + 'deg) scale(1.02)';
      });
      s.addEventListener('pointerleave', function () {
        s.removeAttribute('data-hover');
        img.style.transition = 'transform .9s cubic-bezier(.22,.61,.36,1)';
        img.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------- the font-swap ghost ----
     The stylesheet loads the webfonts with `display=swap`, so every label is
     painted once in the fallback face and then repainted when the real face
     arrives. A diagram animates continuously, which puts its svg in its own
     composited layer, and a partial invalidation there can leave the
     fallback-metric pixels behind -- a ghost copy of every label sitting
     beside the real one, permanently.

     Forcing each diagram off the layout and back on once the fonts settle
     re-rasterises it cleanly. `document.fonts.ready` always resolves, and the
     worst case if it somehow does not is simply the status quo, so nothing
     here can hide a diagram. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      /* Arms the diagram animations. Until this lands the diagrams are
         drawn but still, which is why nothing here can hide content. */
      document.documentElement.classList.add('fr');
      var svgs = document.querySelectorAll('.diagram svg, .art svg, .stepper__viz svg');
      for (var i = 0; i < svgs.length; i += 1) {
        var el = svgs[i];
        var prev = el.style.display;
        el.style.display = 'none';
        void el.getBoundingClientRect();     /* forces the reflow */
        el.style.display = prev;
      }
    });
  }

  runScroll();
})();
