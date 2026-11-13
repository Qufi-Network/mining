/* QuFi — WebGL scenes.
 *
 * Two scenes, both written against raw WebGL with no library:
 *
 *   sphere   a Fibonacci point sphere with depth-faded, pulsing points and
 *            entanglement chords — the hero mark's field.
 *   lattice  an undulating point lattice with neighbour bonds, the visual
 *            language of the lattice problems the cryptography rests on.
 *
 * Every scene pauses when off screen or when the tab is hidden, respects
 * prefers-reduced-motion, and fails silently: the page is complete without it.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }

  function program(gl, vs, fs) {
    var v = compile(gl, gl.VERTEX_SHADER, vs);
    var f = compile(gl, gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    var p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }

  function context(canvas) {
    var opts = { alpha: true, antialias: true, premultipliedAlpha: false, depth: false };
    try {
      return canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
    } catch (e) { return null; }
  }

  /* ------------------------------------------------------------- sphere */

  var SPHERE_VS = [
    'attribute vec3 aPos;',
    'attribute float aSeed;',
    'uniform mat3 uRot;',
    'uniform float uTime;',
    'uniform float uAspect;',
    'uniform float uScale;',
    'varying float vFade;',
    'varying float vPulse;',
    'void main(){',
    '  vec3 p = uRot * aPos;',
    '  float persp = 1.0 / (2.45 - p.z);',
    '  gl_Position = vec4(vec2(p.x * persp, p.y * persp * uAspect) * uScale, 0.0, 1.0);',
    '  vFade = clamp((p.z + 1.0) * 0.5, 0.0, 1.0);',
    '  vPulse = 0.5 + 0.5 * sin(uTime * 1.5 + aSeed * 6.2831);',
    '  gl_PointSize = (1.1 + 2.4 * vFade + vPulse * 1.2) * persp * 2.3;',
    '}'
  ].join('\n');

  var SPHERE_FS = [
    'precision mediump float;',
    'varying float vFade;',
    'varying float vPulse;',
    'void main(){',
    '  vec2 d = gl_PointCoord - vec2(0.5);',
    '  float r = length(d);',
    '  if (r > 0.5) discard;',
    '  float soft = smoothstep(0.5, 0.04, r);',
    '  vec3 col = mix(vec3(0.70, 0.82, 0.99), vec3(0.043, 0.294, 0.933), vFade);',
    '  float a = soft * (0.09 + 0.56 * vFade * vFade) * (0.62 + 0.5 * vPulse);',
    '  gl_FragColor = vec4(col, a);',
    '}'
  ].join('\n');

  var CHORD_VS = [
    'attribute vec3 aPos;',
    'attribute float aSeed;',
    'uniform mat3 uRot;',
    'uniform float uTime;',
    'uniform float uAspect;',
    'uniform float uScale;',
    'varying float vA;',
    'void main(){',
    '  vec3 p = uRot * aPos;',
    '  float persp = 1.0 / (2.45 - p.z);',
    '  gl_Position = vec4(vec2(p.x * persp, p.y * persp * uAspect) * uScale, 0.0, 1.0);',
    '  float live = smoothstep(0.55, 1.0, sin(uTime * 0.55 + aSeed * 6.2831) * 0.5 + 0.5);',
    '  vA = clamp((p.z + 0.2), 0.0, 1.0) * live * 0.5;',
    '}'
  ].join('\n');

  var CHORD_FS = [
    'precision mediump float;',
    'varying float vA;',
    'void main(){ gl_FragColor = vec4(0.09, 0.38, 0.95, vA * 0.55); }'
  ].join('\n');

  function sphereScene(gl, cfg) {
    var pPoints = program(gl, SPHERE_VS, SPHERE_FS);
    var pChords = program(gl, CHORD_VS, CHORD_FS);
    if (!pPoints || !pChords) return null;

    var N = cfg.points || 2800;
    var pos = new Float32Array(N * 3);
    var seed = new Float32Array(N);
    var golden = Math.PI * (3 - Math.sqrt(5));
    var i;
    for (i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2;
      var rad = Math.sqrt(Math.max(0, 1 - y * y));
      var th = golden * i;
      pos[i * 3] = Math.cos(th) * rad;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(th) * rad;
      seed[i] = Math.random();
    }

    /* entanglement chords: pairs of points that are far apart on the sphere */
    var PAIRS = cfg.chords || 130;
    var cp = new Float32Array(PAIRS * 6);
    var cs = new Float32Array(PAIRS * 2);
    for (i = 0; i < PAIRS; i++) {
      var a = (Math.random() * N) | 0;
      var b = (Math.random() * N) | 0;
      var s = Math.random();
      cp[i * 6] = pos[a * 3]; cp[i * 6 + 1] = pos[a * 3 + 1]; cp[i * 6 + 2] = pos[a * 3 + 2];
      cp[i * 6 + 3] = pos[b * 3]; cp[i * 6 + 4] = pos[b * 3 + 1]; cp[i * 6 + 5] = pos[b * 3 + 2];
      cs[i * 2] = s; cs[i * 2 + 1] = s;
    }

    function buf(data) {
      var b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return b;
    }
    var bPos = buf(pos), bSeed = buf(seed), bCp = buf(cp), bCs = buf(cs);

    function bind(prog, posBuf, seedBuf) {
      gl.useProgram(prog);
      var aPos = gl.getAttribLocation(prog, 'aPos');
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
      var aSeed = gl.getAttribLocation(prog, 'aSeed');
      gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
      gl.enableVertexAttribArray(aSeed);
      gl.vertexAttribPointer(aSeed, 1, gl.FLOAT, false, 0, 0);
    }

    var u = function (prog) {
      return {
        rot: gl.getUniformLocation(prog, 'uRot'),
        time: gl.getUniformLocation(prog, 'uTime'),
        aspect: gl.getUniformLocation(prog, 'uAspect'),
        scale: gl.getUniformLocation(prog, 'uScale'),
      };
    };
    var uP = u(pPoints), uC = u(pChords);
    var aspect = 1;

    return {
      resize: function (w, h) { aspect = w / h; },
      draw: function (t, mx, my) {
        var a = t * 0.1 + mx;
        var b = -0.34 + my;
        var ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
        var rot = new Float32Array([
          ca, sa * sb, -sa * cb,
          0, cb, sb,
          sa, -ca * sb, ca * cb,
        ]);
        gl.clear(gl.COLOR_BUFFER_BIT);

        bind(pChords, bCp, bCs);
        gl.uniformMatrix3fv(uC.rot, false, rot);
        gl.uniform1f(uC.time, t);
        gl.uniform1f(uC.aspect, aspect);
        gl.uniform1f(uC.scale, 1.24);
        gl.drawArrays(gl.LINES, 0, PAIRS * 2);

        bind(pPoints, bPos, bSeed);
        gl.uniformMatrix3fv(uP.rot, false, rot);
        gl.uniform1f(uP.time, t);
        gl.uniform1f(uP.aspect, aspect);
        gl.uniform1f(uP.scale, 1.24);
        gl.drawArrays(gl.POINTS, 0, N);
      },
    };
  }

  /* ------------------------------------------------------------ lattice */

  var LAT_VS = [
    'attribute vec2 aGrid;',
    'uniform float uTime;',
    'uniform vec2 uDim;',
    'uniform float uAspect;',
    'uniform vec2 uMouse;',
    'varying float vZ;',
    'void main(){',
    '  vec2 g = aGrid / uDim * 2.0 - 1.0;',
    '  float w = sin(g.x * 2.6 + uTime * 0.7) * cos(g.y * 2.1 - uTime * 0.52);',
    '  w += 0.45 * sin((g.x + g.y) * 4.4 - uTime * 1.05);',
    '  float d = distance(g, uMouse);',
    '  w += 0.7 * exp(-d * 3.2) * sin(uTime * 2.2 - d * 7.0);',
    '  float z = w * 0.13;',
    '  vZ = z;',
    '  float persp = 1.0 / (1.9 - z);',
    '  vec2 p = vec2(g.x, g.y * 0.52) * persp * 1.85;',
    '  gl_Position = vec4(p.x, p.y, 0.0, 1.0);',
    '  gl_PointSize = (1.2 + 2.2 * (z + 0.14) * 4.0) * persp;',
    '}'
  ].join('\n');

  var LAT_POINT_FS = [
    'precision mediump float;',
    'varying float vZ;',
    'void main(){',
    '  vec2 d = gl_PointCoord - vec2(0.5);',
    '  if (length(d) > 0.5) discard;',
    '  float soft = smoothstep(0.5, 0.05, length(d));',
    '  float lift = clamp((vZ + 0.14) * 3.6, 0.0, 1.0);',
    '  vec3 col = mix(vec3(0.72, 0.83, 0.99), vec3(0.06, 0.33, 0.94), lift);',
    '  gl_FragColor = vec4(col, soft * (0.10 + 0.52 * lift));',
    '}'
  ].join('\n');

  var LAT_LINE_FS = [
    'precision mediump float;',
    'varying float vZ;',
    'void main(){',
    '  float lift = clamp((vZ + 0.14) * 3.6, 0.0, 1.0);',
    '  gl_FragColor = vec4(0.10, 0.36, 0.94, 0.05 + 0.20 * lift);',
    '}'
  ].join('\n');

  function latticeScene(gl, cfg) {
    var pPoints = program(gl, LAT_VS, LAT_POINT_FS);
    var pLines = program(gl, LAT_VS, LAT_LINE_FS);
    if (!pPoints || !pLines) return null;

    var CW = cfg.cols || 54;
    var CH = cfg.rows || 24;
    var pts = [];
    var lines = [];
    var i, j;
    for (j = 0; j <= CH; j++) {
      for (i = 0; i <= CW; i++) {
        pts.push(i, j);
        if (i < CW) lines.push(i, j, i + 1, j);
        if (j < CH) lines.push(i, j, i, j + 1);
      }
    }
    var aPts = new Float32Array(pts);
    var aLines = new Float32Array(lines);

    function buf(data) {
      var b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return b;
    }
    var bPts = buf(aPts), bLines = buf(aLines);

    function setup(prog, b) {
      gl.useProgram(prog);
      var a = gl.getAttribLocation(prog, 'aGrid');
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(gl.getUniformLocation(prog, 'uDim'), CW, CH);
    }
    var loc = function (p) {
      return {
        time: gl.getUniformLocation(p, 'uTime'),
        aspect: gl.getUniformLocation(p, 'uAspect'),
        mouse: gl.getUniformLocation(p, 'uMouse'),
      };
    };
    var lP = loc(pPoints), lL = loc(pLines);
    var aspect = 1;

    return {
      resize: function (w, h) { aspect = w / h; },
      draw: function (t, mx, my) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        setup(pLines, bLines);
        gl.uniform1f(lL.time, t);
        gl.uniform1f(lL.aspect, aspect);
        gl.uniform2f(lL.mouse, mx * 2, -my * 2);
        gl.drawArrays(gl.LINES, 0, aLines.length / 2);

        setup(pPoints, bPts);
        gl.uniform1f(lP.time, t);
        gl.uniform1f(lP.aspect, aspect);
        gl.uniform2f(lP.mouse, mx * 2, -my * 2);
        gl.drawArrays(gl.POINTS, 0, aPts.length / 2);
      },
    };
  }


  /* ------------------------------------------------------- globe (3D) ------
   * A real rotating sphere carrying the paper's dotted continents, verifier
   * sites at their true coordinates, great-circle links between them, and a
   * band of activity that sweeps around the globe in longitude.
   *
   * The land comes from assets/../src/landmask.mjs, which was traced off the
   * paper's world map. That map is NOT equirectangular, so read literally it
   * puts Sao Paulo, Johannesburg and Sydney in the sea and fills the Indian
   * Ocean with land — 49% agreement against a 65-point control set of known
   * land and sea coordinates. Fitting one affine correction per axis,
   *
   *     lat' = lat * 1.12 - 22       lon' = lon * 1.13 - 27
   *
   * takes that to 96.9%, with the only two misses at Yukon and Iceland, both
   * single coastal cells at this 1.9 degree resolution. LAT_* / LON_* below
   * invert that fit to turn a mask cell back into a real coordinate. Re-run
   * the fit if the mask is ever re-traced.
   */

  var G3_VS = [
    'attribute vec3 aPos;',
    'attribute vec2 aMeta;',          // x: 0 land, 1 site   y: seed
    'uniform mat3 uRot;',
    'uniform float uTime;',
    'uniform float uAspect;',
    'uniform float uScale;',
    'varying float vFade;',
    'varying float vKind;',
    'varying float vGlow;',
    'void main(){',
    '  vec3 p = uRot * aPos;',
    '  float persp = 1.0 / (2.7 - p.z);',
    '  gl_Position = vec4(vec2(p.x * persp, p.y * persp * uAspect) * uScale, 0.0, 1.0);',
    '  vFade = clamp((p.z + 1.0) * 0.5, 0.0, 1.0);',
    '  vKind = aMeta.x;',
    /* the sweep is keyed off model longitude, so it travels with the land
       rather than sitting still in front of a spinning globe */
    '  float lonm = atan(aPos.x, aPos.z);',
    '  float d = mod(lonm - uTime * 0.55 + 3.14159, 6.28318) - 3.14159;',
    '  float sweep = smoothstep(0.60, 0.0, abs(d));',
    '  float tw = 0.5 + 0.5 * sin(uTime * 2.2 + aMeta.y * 6.2831);',
    '  vGlow = mix(sweep * 0.9, tw, aMeta.x);',
    '  float base = mix(2.5, 5.6, aMeta.x);',
    '  gl_PointSize = (base * (0.62 + 0.6 * vFade) + vGlow * mix(1.7, 2.6, aMeta.x)) * persp * 2.5;',
    '}'
  ].join('\n');

  var G3_FS = [
    'precision mediump float;',
    'varying float vFade;',
    'varying float vKind;',
    'varying float vGlow;',
    'void main(){',
    '  vec2 d = gl_PointCoord - vec2(0.5);',
    '  float r = length(d);',
    '  if (r > 0.5) discard;',
    '  float soft = smoothstep(0.5, 0.05, r);',
    /* The back of the sphere was fading to a pale grey-blue AND to a low
       alpha at the same time, which washed the whole globe out. The far side
       now keeps the brand hue and the alpha falls off linearly rather than
       squared, so the land reads as QuFi blue all the way round. */
    '  vec3 land = mix(vec3(0.35, 0.56, 0.93), vec3(0.09, 0.38, 0.92), vFade);',
    '  vec3 hot = vec3(0.04, 0.29, 1.0);',
    '  vec3 col = mix(mix(land, hot, vGlow * 0.75), hot, vKind);',
    '  float a = soft * mix(0.34 + 0.62 * vFade + vGlow * 0.26,',
    '                       0.62 + 0.38 * vGlow, vKind);',
    '  gl_FragColor = vec4(col, a);',
    '}'
  ].join('\n');

  /* one line program for both the graticule and the links: meta.x < 0 marks a
     graticule segment, which holds a flat low alpha instead of carrying a pulse */
  var G3_ARC_VS = [
    'attribute vec3 aPos;',
    'attribute vec2 aMeta;',
    'uniform mat3 uRot;',
    'uniform float uTime;',
    'uniform float uAspect;',
    'uniform float uScale;',
    'varying float vA;',
    'varying float vKind;',
    'void main(){',
    '  vec3 p = uRot * aPos;',
    '  float persp = 1.0 / (2.7 - p.z);',
    '  gl_Position = vec4(vec2(p.x * persp, p.y * persp * uAspect) * uScale, 0.0, 1.0);',
    '  float depth = smoothstep(-0.35, 0.65, p.z);',
    '  float head = fract(uTime * 0.24 + aMeta.y);',
    '  float t = abs(aMeta.x - head);',
    '  t = min(t, 1.0 - t);',
    '  float pulse = smoothstep(0.10, 0.0, t);',
    '  vKind = aMeta.x;',
    '  vA = aMeta.x < 0.0 ? depth * 0.17 : depth * (0.30 + 0.70 * pulse);',
    '}'
  ].join('\n');

  var G3_ARC_FS = [
    'precision mediump float;',
    'varying float vA;',
    'varying float vKind;',
    'void main(){',
    '  vec3 col = vKind < 0.0 ? vec3(0.30, 0.50, 0.88) : vec3(0.05, 0.32, 0.97);',
    '  gl_FragColor = vec4(col, vA);',
    '}'
  ].join('\n');

  var G3_SITES = [
    [51.5, -0.1], [40.7, -74.0], [50.1, 8.7], [25.2, 55.3], [1.35, 103.8],
    [35.7, 139.7], [-23.5, -46.6], [-33.9, 151.2], [-26.2, 28.0], [37.8, -122.4]
  ];
  var G3_LINKS = [[0, 1], [0, 3], [3, 4], [4, 5], [1, 6], [4, 7], [3, 8], [9, 5], [1, 9], [2, 0]];

  /* inverse of the affine fit described above */
  var LAT_S = 1.12, LAT_O = -22;
  var LON_S = 1.13, LON_O = -27;

  function g3unit(lat, lon) {
    var a = lat * Math.PI / 180, b = lon * Math.PI / 180;
    return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)];
  }

  function globe3dScene(gl, cfg) {
    var pPoints = program(gl, G3_VS, G3_FS);
    var pLines = program(gl, G3_ARC_VS, G3_ARC_FS);
    if (!pPoints || !pLines) return null;

    var pos = [], meta = [];

    /* --- the continents --- */
    var LM = window.LANDMASK;
    if (!LM) return null;                       // no mask, no globe
    var GW = LM.w, GH = LM.h, HEX = LM.hex;
    var cell = function (c, r) {
      if (c < 0 || c >= GW || r < 0 || r >= GH) return 0;
      var i = r * GW + c;
      return (parseInt(HEX.charAt(i >> 2), 16) >> (3 - (i & 3))) & 1;
    };
    for (var r = 0; r < GH; r++) {
      /* undo the fitted latitude scale to get the cell's real latitude */
      var latm = 90 - (r + 0.5) / GH * 180;
      var lat = (latm - LAT_O) / LAT_S;
      if (lat > 84 || lat < -84) continue;
      /* thin by cos(lat) so the dots stay evenly spaced instead of crowding
         toward the poles, which is what the source map does too */
      var keep = Math.max(1, Math.round(1 / Math.max(0.12, Math.cos(lat * Math.PI / 180))));
      for (var c = 0; c < GW; c++) {
        if (!cell(c, r)) continue;
        if (c % keep !== 0) continue;
        var lonm = (c + 0.5) / GW * 360 - 180;
        var lon = (lonm - LON_O) / LON_S;
        if (lon > 180 || lon < -180) continue;
        var v = g3unit(lat, lon);
        pos.push(v[0], v[1], v[2]);
        meta.push(0, Math.random());
      }
    }
    var landCount = meta.length / 2;

    /* --- the verifier sites, lifted just clear of the surface --- */
    for (var i = 0; i < G3_SITES.length; i++) {
      var sv = g3unit(G3_SITES[i][0], G3_SITES[i][1]);
      pos.push(sv[0] * 1.02, sv[1] * 1.02, sv[2] * 1.02);
      meta.push(1, Math.random());
    }
    var total = meta.length / 2;

    /* --- great-circle links, each with a pulse running along it --- */
    var lp = [], lm = [];
    var SEG = 60;
    for (var k = 0; k < G3_LINKS.length; k++) {
      var a = g3unit(G3_SITES[G3_LINKS[k][0]][0], G3_SITES[G3_LINKS[k][0]][1]);
      var b = g3unit(G3_SITES[G3_LINKS[k][1]][0], G3_SITES[G3_LINKS[k][1]][1]);
      var dp = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
      var om = Math.acos(dp) || 1e-4;
      var seed = k / G3_LINKS.length;
      var prev = null;
      for (var j = 0; j <= SEG; j++) {
        var t = j / SEG;
        var s1 = Math.sin((1 - t) * om) / Math.sin(om);
        var s2 = Math.sin(t * om) / Math.sin(om);
        var lift = 1.03 + 0.20 * Math.sin(Math.PI * t) * (om / Math.PI);
        var v2 = [(a[0] * s1 + b[0] * s2) * lift,
                  (a[1] * s1 + b[1] * s2) * lift,
                  (a[2] * s1 + b[2] * s2) * lift];
        if (prev) { lp.push(prev[0], prev[1], prev[2], v2[0], v2[1], v2[2]); lm.push(t, seed, t, seed); }
        prev = v2;
      }
    }

    /* --- a sparse graticule, so the sphere reads as a sphere --- */
    function grat(a, b) { lp.push(a[0], a[1], a[2], b[0], b[1], b[2]); lm.push(-1, 0, -1, 0); }
    for (var mlon = -180; mlon < 180; mlon += 30) {
      for (var mlat = -80; mlat < 80; mlat += 5) grat(g3unit(mlat, mlon), g3unit(mlat + 5, mlon));
    }
    for (var plat = -60; plat <= 60; plat += 30) {
      for (var plon = -180; plon < 180; plon += 5) grat(g3unit(plat, plon), g3unit(plat, plon + 5));
    }

    function buf(arr) {
      var b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
      return b;
    }
    var bPos = buf(pos), bMeta = buf(meta), bLp = buf(lp), bLm = buf(lm);

    function bind(prog, pb, mb) {
      gl.useProgram(prog);
      var a1 = gl.getAttribLocation(prog, 'aPos');
      gl.bindBuffer(gl.ARRAY_BUFFER, pb);
      gl.enableVertexAttribArray(a1);
      gl.vertexAttribPointer(a1, 3, gl.FLOAT, false, 0, 0);
      var a2 = gl.getAttribLocation(prog, 'aMeta');
      gl.bindBuffer(gl.ARRAY_BUFFER, mb);
      gl.enableVertexAttribArray(a2);
      gl.vertexAttribPointer(a2, 2, gl.FLOAT, false, 0, 0);
    }
    function locs(prog) {
      return {
        rot: gl.getUniformLocation(prog, 'uRot'),
        time: gl.getUniformLocation(prog, 'uTime'),
        aspect: gl.getUniformLocation(prog, 'uAspect'),
        scale: gl.getUniformLocation(prog, 'uScale')
      };
    }
    var uP = locs(pPoints), uL = locs(pLines);
    var aspect = 1;
    var SCALE = cfg.fit || 1.58;
    var lineVerts = lm.length / 2;

    return {
      resize: function (w, h) { aspect = w / h; },
      draw: function (t, mx, my) {
        var yaw = t * 0.11 + mx * 0.7;
        var pitch = -0.32 + my * 0.45;
        var cy = Math.cos(yaw), sy = Math.sin(yaw);
        var cp = Math.cos(pitch), sp = Math.sin(pitch);
        var rot = new Float32Array([
          cy, sy * sp, -sy * cp,
          0, cp, sp,
          sy, -cy * sp, cy * cp
        ]);
        gl.clear(gl.COLOR_BUFFER_BIT);

        bind(pLines, bLp, bLm);
        gl.uniformMatrix3fv(uL.rot, false, rot);
        gl.uniform1f(uL.time, t);
        gl.uniform1f(uL.aspect, aspect);
        gl.uniform1f(uL.scale, SCALE);
        gl.drawArrays(gl.LINES, 0, lineVerts);

        bind(pPoints, bPos, bMeta);
        gl.uniformMatrix3fv(uP.rot, false, rot);
        gl.uniform1f(uP.time, t);
        gl.uniform1f(uP.aspect, aspect);
        gl.uniform1f(uP.scale, SCALE);
        gl.drawArrays(gl.POINTS, 0, total);
      },
      stats: { land: landCount, sites: G3_SITES.length, lineVerts: lineVerts }
    };
  }

  /* ----------------------------------------------------- node mesh --------
   * The verification network as a mesh rather than a map.
   *
   * The globe answers "where"; this answers "how". Nodes sit on a jittered
   * shell so it reads as a cloud of peers rather than a planet, each joined to
   * its nearest neighbours, and every few seconds one cluster of peers lights
   * together with the links between them — a quorum forming, holding, and
   * dissolving. Nothing else on the site shows consensus happening.
   *
   * The active cluster is chosen on the CPU once per frame and passed as a
   * uniform, so lighting a quorum costs one float rather than a buffer upload.
   * A link carries BOTH endpoints' cluster ids on BOTH of its vertices, which
   * is what lets a segment light only when the whole edge is inside the quorum.
   */

  var NM_VS = [
    'attribute vec3 aPos;',
    'attribute vec3 aMeta;',          // x: cluster  y: seed  z: shell depth
    'uniform mat3 uRot;',
    'uniform float uTime;',
    'uniform float uAspect;',
    'uniform float uScale;',
    'uniform float uActive;',
    'uniform float uAmp;',
    'varying float vFade;',
    'varying float vHot;',
    'varying float vTw;',
    'void main(){',
    '  vec3 p = uRot * aPos;',
    '  float persp = 1.0 / (2.6 - p.z);',
    '  gl_Position = vec4(vec2(p.x * persp, p.y * persp * uAspect) * uScale, 0.0, 1.0);',
    '  vFade = clamp((p.z + 1.0) * 0.5, 0.0, 1.0);',
    '  vHot = (abs(aMeta.x - uActive) < 0.5) ? uAmp : 0.0;',
    '  vTw = 0.5 + 0.5 * sin(uTime * 1.7 + aMeta.y * 6.2831);',
    '  float r = 2.4 + 2.0 * vFade + vHot * 4.2 + vTw * 0.9;',
    '  gl_PointSize = r * persp * 2.5;',
    '}'
  ].join('\n');

  var NM_FS = [
    'precision mediump float;',
    'varying float vFade;',
    'varying float vHot;',
    'varying float vTw;',
    'void main(){',
    '  vec2 d = gl_PointCoord - vec2(0.5);',
    '  float r = length(d);',
    '  if (r > 0.5) discard;',
    '  float core = smoothstep(0.5, 0.08, r);',
    '  float halo = smoothstep(0.5, 0.0, r) * 0.45;',
    '  vec3 cool = mix(vec3(0.55, 0.70, 0.95), vec3(0.09, 0.38, 0.95), vFade);',
    '  vec3 hot = vec3(0.35, 0.78, 1.0);',
    '  vec3 col = mix(cool, hot, vHot);',
    '  float a = (core * (0.22 + 0.68 * vFade) + halo * 0.5) * (0.55 + 0.45 * vTw);',
    '  a = mix(a, min(1.0, a + 0.5), vHot);',
    '  gl_FragColor = vec4(col, a);',
    '}'
  ].join('\n');

  var NM_LVS = [
    'attribute vec3 aPos;',
    'attribute vec3 aMeta;',          // x,y: the two endpoint clusters  z: t along the edge
    'uniform mat3 uRot;',
    'uniform float uTime;',
    'uniform float uAspect;',
    'uniform float uScale;',
    'uniform float uActive;',
    'uniform float uAmp;',
    'varying float vA;',
    'varying float vHot;',
    'void main(){',
    '  vec3 p = uRot * aPos;',
    '  float persp = 1.0 / (2.6 - p.z);',
    '  gl_Position = vec4(vec2(p.x * persp, p.y * persp * uAspect) * uScale, 0.0, 1.0);',
    '  float depth = smoothstep(-0.5, 0.7, p.z);',
    /* both ends must be inside the quorum for the edge to carry it */
    '  float inA = step(abs(aMeta.x - uActive), 0.5);',
    '  float inB = step(abs(aMeta.y - uActive), 0.5);',
    '  vHot = inA * inB * uAmp;',
    '  vA = depth * (0.10 + 0.55 * vHot);',
    '}'
  ].join('\n');

  var NM_LFS = [
    'precision mediump float;',
    'varying float vA;',
    'varying float vHot;',
    'void main(){',
    '  vec3 col = mix(vec3(0.42, 0.56, 0.86), vec3(0.32, 0.76, 1.0), vHot);',
    '  gl_FragColor = vec4(col, vA);',
    '}'
  ].join('\n');

  function nodemeshScene(gl, cfg) {
    var pPts = program(gl, NM_VS, NM_FS);
    var pLines = program(gl, NM_LVS, NM_LFS);
    if (!pPts || !pLines) return null;

    var N = cfg.points || 260;
    var CLUSTERS = 12;
    var NEIGHBOURS = 3;

    /* a Fibonacci shell, then jittered in radius so it reads as a cloud of
       peers rather than the surface of a planet */
    var pts = [];
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2;
      var rad = Math.sqrt(Math.max(0, 1 - y * y));
      var th = golden * i;
      var jitter = 0.80 + 0.20 * ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
      pts.push([Math.cos(th) * rad * jitter, y * jitter, Math.sin(th) * rad * jitter]);
    }

    /* cluster by proximity to a handful of seeds, so a quorum is a group of
       peers that are actually near each other */
    var seeds = [];
    for (var c = 0; c < CLUSTERS; c++) seeds.push(pts[Math.floor(c * N / CLUSTERS)]);
    var cluster = pts.map(function (p) {
      var best = 0, bd = 1e9;
      for (var k = 0; k < seeds.length; k++) {
        var s = seeds[k];
        var d = (p[0]-s[0])*(p[0]-s[0]) + (p[1]-s[1])*(p[1]-s[1]) + (p[2]-s[2])*(p[2]-s[2]);
        if (d < bd) { bd = d; best = k; }
      }
      return best;
    });

    var pos = [], meta = [];
    for (i = 0; i < N; i++) {
      pos.push(pts[i][0], pts[i][1], pts[i][2]);
      meta.push(cluster[i], Math.random(), 0);
    }

    /* nearest-neighbour edges, de-duplicated */
    var seen = {};
    var lp = [], lm = [];
    for (i = 0; i < N; i++) {
      var order = [];
      for (var j = 0; j < N; j++) {
        if (j === i) continue;
        var dx = pts[i][0]-pts[j][0], dy = pts[i][1]-pts[j][1], dz = pts[i][2]-pts[j][2];
        order.push([dx*dx + dy*dy + dz*dz, j]);
      }
      order.sort(function (a, b) { return a[0] - b[0]; });
      for (var n = 0; n < NEIGHBOURS && n < order.length; n++) {
        var q = order[n][1];
        var key = Math.min(i, q) + ':' + Math.max(i, q);
        if (seen[key]) continue;
        seen[key] = 1;
        lp.push(pts[i][0], pts[i][1], pts[i][2], pts[q][0], pts[q][1], pts[q][2]);
        lm.push(cluster[i], cluster[q], 0, cluster[i], cluster[q], 1);
      }
    }

    function buf(arr) {
      var b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
      return b;
    }
    var bPos = buf(pos), bMeta = buf(meta), bLp = buf(lp), bLm = buf(lm);

    function bind(prog, pb, mb) {
      gl.useProgram(prog);
      var a1 = gl.getAttribLocation(prog, 'aPos');
      gl.bindBuffer(gl.ARRAY_BUFFER, pb);
      gl.enableVertexAttribArray(a1);
      gl.vertexAttribPointer(a1, 3, gl.FLOAT, false, 0, 0);
      var a2 = gl.getAttribLocation(prog, 'aMeta');
      gl.bindBuffer(gl.ARRAY_BUFFER, mb);
      gl.enableVertexAttribArray(a2);
      gl.vertexAttribPointer(a2, 3, gl.FLOAT, false, 0, 0);
    }
    function locs(prog) {
      return {
        rot: gl.getUniformLocation(prog, 'uRot'),
        time: gl.getUniformLocation(prog, 'uTime'),
        aspect: gl.getUniformLocation(prog, 'uAspect'),
        scale: gl.getUniformLocation(prog, 'uScale'),
        active: gl.getUniformLocation(prog, 'uActive'),
        amp: gl.getUniformLocation(prog, 'uAmp')
      };
    }
    var uP = locs(pPts), uL = locs(pLines);
    var aspect = 1;
    var SCALE = cfg.fit || 1.5;
    var ROUND = 2.6;                  // seconds a quorum holds before the next

    return {
      resize: function (w, h) { aspect = w / h; },
      draw: function (t, mx, my) {
        var yaw = t * 0.13 + mx * 0.8;
        var pitch = -0.18 + my * 0.45;
        var cy = Math.cos(yaw), sy = Math.sin(yaw);
        var cp = Math.cos(pitch), sp = Math.sin(pitch);
        var rot = new Float32Array([
          cy, sy * sp, -sy * cp,
          0, cp, sp,
          sy, -cy * sp, cy * cp
        ]);
        /* which quorum is forming, and how far into forming it is */
        var phase = t / ROUND;
        var active = Math.floor(phase) % CLUSTERS;
        var f = phase - Math.floor(phase);
        var amp = Math.sin(Math.min(1, f / 0.8) * Math.PI);
        amp = amp * amp;

        gl.clear(gl.COLOR_BUFFER_BIT);

        bind(pLines, bLp, bLm);
        gl.uniformMatrix3fv(uL.rot, false, rot);
        gl.uniform1f(uL.time, t);
        gl.uniform1f(uL.aspect, aspect);
        gl.uniform1f(uL.scale, SCALE);
        gl.uniform1f(uL.active, active);
        gl.uniform1f(uL.amp, amp);
        gl.drawArrays(gl.LINES, 0, lm.length / 3);

        bind(pPts, bPos, bMeta);
        gl.uniformMatrix3fv(uP.rot, false, rot);
        gl.uniform1f(uP.time, t);
        gl.uniform1f(uP.aspect, aspect);
        gl.uniform1f(uP.scale, SCALE);
        gl.uniform1f(uP.active, active);
        gl.uniform1f(uP.amp, amp);
        gl.drawArrays(gl.POINTS, 0, N);
      },
      stats: { nodes: N, edges: lm.length / 6, clusters: CLUSTERS }
    };
  }

  /* --------------------------------------------------------------- mount */

  var SCENES = { sphere: sphereScene, lattice: latticeScene, globe3d: globe3dScene,
    nodemesh: nodemeshScene };

  function mount(host) {
    if (reduce) return;
    var kind = host.getAttribute('data-gl') || 'sphere';
    var make = SCENES[kind];
    if (!make) return;

    var canvas = document.createElement('canvas');
    var gl = context(canvas);
    if (!gl) return;
    host.appendChild(canvas);

    var cfg = {
      points: Number(host.getAttribute('data-points')) || 0,
      chords: Number(host.getAttribute('data-chords')) || 0,
      cols: Number(host.getAttribute('data-cols')) || 0,
      rows: Number(host.getAttribute('data-rows')) || 0,
      step: Number(host.getAttribute('data-step')) || 0,
      fit: Number(host.getAttribute('data-fit')) || 0,
    };
    var scene = make(gl, cfg);
    if (!scene) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    var dpr = Math.min(2, window.devicePixelRatio || 1);
    function resize() {
      var w = host.clientWidth || 1;
      var h = host.clientHeight || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);
      scene.resize(w, h);
    }
    resize();
    window.addEventListener('resize', resize);

    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; },
        { rootMargin: '12% 0px' }).observe(host);
    }

    var tx = 0, ty = 0, mx = 0, my = 0;
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 0.55;
      ty = (e.clientY / window.innerHeight - 0.5) * 0.38;
    }, { passive: true });

    var t = 0, last = performance.now();
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) last = performance.now();
    });

    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible && !document.hidden) {
        t += dt;
        mx += (tx - mx) * 0.045;
        my += (ty - my) * 0.045;
        scene.draw(t, mx, my);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    host.setAttribute('data-webgl', 'on');
  }

  function init() {
    [].slice.call(document.querySelectorAll('[data-gl]')).forEach(mount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
