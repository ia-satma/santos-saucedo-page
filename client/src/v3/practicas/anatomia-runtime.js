/* ===== Santos & Saucedo · módulo «anatomia» de la demo v3 (prefijo an-), portado al sitio =====
   Copia de modules/anatomia/script.js (aprobada el 5-11-2026) con cinco cambios y nada más:
   1. Es una función: initAnatomia(sección) arranca dentro de esa sección y devuelve la limpieza
      (escuchas, observadores, cuadros, temporizadores, el contexto WebGL y lo que el módulo agregó al DOM).
   2. three.js r149 se carga bajo demanda desde /v3/libs/three.min.js; sin él o sin WebGL queda el texto (an-nogl).
   3. data-an-solo="orden|solucion": una sola lámina, sin pestañas, con su propio recorrido (G1).
   4. El hueco del cajetín se mide sin el desplazamiento que el sitio da al dibujo cuando la cabecera
      se retira (drawShift).
   5. Los colores CSS pasan por un píxel de lienzo antes de llegar a three.js (toRGB): el tema del sitio
      los escribe como rgb(12 35 64), que three.js r149 no entiende (el dibujo salía blanco).
   Tiempos, cortes, modo Mario y teléfono: idénticos a la demo. */
/* eslint-disable */
/* ===== Santos & Saucedo · módulo «anatomia» (prefijo an-) =====
   Plano técnico en three.js r149 (global THREE): dibujo de líneas con caras ocultas.
   Dos láminas en un solo recorrido: «Prevención» (el expediente en orden) y «Solución» (la caja del juicio).
   - En escritorio el scroll es la línea de tiempo: se traza la lámina 1 (construcción, contornos, detalle, caras),
     se despieza pieza por pieza, se recoge, se borra y en el mismo escenario se traza la lámina 2.
   - Las líneas se dibujan con un sombreador propio: cada segmento crece desde su origen según `draw`.
   - Caras en el azul del fondo: tapan lo que queda detrás (líneas ocultas); entran al final del trazo.
   - Un solo requestAnimationFrame, que duerme fuera de pantalla, con la pestaña oculta y cuando todo está quieto.
   Colores: se leen de las variables CSS (--an-bg, --an-ink, --an-acc) y se releen en 'paletachange'.
   Números de lámina: data-an-laminas="1/7,2/7" en la sección (por omisión 3/7 y 4/7). */
/* Cargado bajo demanda: three.js r149 local (global THREE). */
var threeP = null;
function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (threeP) return threeP;
  threeP = new Promise(function (res) {
    var s = document.createElement('script');
    s.src = THREE_URL; s.async = true;
    s.onload = function () { res(window.THREE || null); };
    s.onerror = function () { threeP = null; s.remove(); res(null); };
    document.head.appendChild(s);
  });
  return threeP;
}
var THREE_URL = '/v3/libs/three.min.js';
/* ¿Hay WebGL? Se prueba una vez con un lienzo suelto, antes de descargar three.js: sin WebGL la lámina
   queda en texto sin pedir la biblioteca ni dejar en la consola los errores de WebGLRenderer. */
var GL_OK = null;
function hasGL() {
  if (GL_OK !== null) return GL_OK;
  try {
    var c = document.createElement('canvas');
    var gl = c.getContext('webgl2') || c.getContext('webgl');
    GL_OK = !!gl;
    var lose = gl && gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
  } catch (e) { GL_OK = false; }
  return GL_OK;
}
export function setThreeUrl(u) { THREE_URL = u; }

export function initAnatomia(sec) {
  'use strict';
  if (!sec) return function () {};
  /* ---- registro de todo lo que se arma, para deshacerlo al desmontar (y en el doble arranque de StrictMode) ---- */
  var DEAD = false, OFF = [], TIMERS = [], RAFS = [], OBS = [], CLEAN = [];
  function listen(t, type, fn, o) { t.addEventListener(type, fn, o); OFF.push(function () { t.removeEventListener(type, fn, o); }); }
  function later(fn, ms) { var id = setTimeout(function () { if (!DEAD) fn(); }, ms); TIMERS.push(id); if (TIMERS.length > 64) TIMERS.splice(0, 32); return id; }
  function unlater(id) { clearTimeout(id); }
  function nextFrame(fn) { var id = requestAnimationFrame(function (t) { if (!DEAD) fn(t); }); RAFS.push(id); if (RAFS.length > 64) RAFS.splice(0, 32); return id; }
  function noFrame(id) { cancelAnimationFrame(id); }
  function cleanup() {
    DEAD = true;
    OFF.forEach(function (f) { f(); }); OFF = [];
    TIMERS.forEach(clearTimeout); TIMERS = [];
    RAFS.forEach(cancelAnimationFrame); RAFS = [];
    OBS.forEach(function (o) { o.disconnect(); }); OBS = [];
    CLEAN.forEach(function (f) { try { f(); } catch (e) { /* nada */ } }); CLEAN = [];
    sec.classList.remove('an-nogl');
    delete sec.__anSettle; delete sec.__anStep; delete sec.__anState; delete sec.__anPerf;
  }
  /* una sola lámina (data-an-solo="orden|solucion"): sin pestañas y con un recorrido más corto */
  var SOLO = sec.getAttribute('data-an-solo');
  if (SOLO !== 'orden' && SOLO !== 'solucion') SOLO = null;

  /* ---------- numeración de láminas (configurable en la sección) ---------- */
  var LAM = (function () {
    var raw = (sec.getAttribute('data-an-laminas') || '').split(',');
    return { orden: (raw[0] || '').trim() || '3/7', solucion: (raw[1] || '').trim() || '4/7' };
  })();
  function lamN(id) { return LAM[id].split('/')[0].trim(); }
  (function numerar() {
    Array.prototype.forEach.call(sec.querySelectorAll('.an-tab[data-sheet]'), function (b) {
      var n = b.querySelector('.an-tab-n'), id = b.dataset.sheet; if (!n || !LAM[id]) return;
      var last = n.lastChild; if (last && last.nodeType === 3) last.nodeValue = lamN(id);
    });
    Array.prototype.forEach.call(sec.querySelectorAll('.an-list[data-sheet]'), function (l) {
      var id = l.dataset.sheet; if (!LAM[id]) return;
      Array.prototype.forEach.call(l.querySelectorAll('.an-row-n'), function (n, k) { n.textContent = lamN(id) + '.' + (k + 1); });
      Array.prototype.forEach.call(l.children, function (li, k) { li.style.setProperty('--i', k); });
    });
    var v = sec.querySelector('[data-caj="lam"]'); if (v) v.textContent = LAM[sec.dataset.anSheet === 'solucion' ? 'solucion' : 'orden'];
  })();

  var booted = false;
  // sin three.js o sin WebGL: queda el texto de las dos láminas, una tras otra
  function noGL() { sec.classList.add('an-nogl'); Array.prototype.forEach.call(sec.querySelectorAll('[data-sheet][hidden]'), function (el) { el.hidden = false; }); }
  function boot() {
    if (booted) return;
    if (!window.THREE) { noGL(); return; }
    booted = true;
    try { init(window.THREE); } catch (err) { console.warn('[anatomia]', err); noGL(); }
  }
  if (!hasGL()) noGL();
  else loadThree().then(function (T) { if (DEAD) return; if (!T) { noGL(); return; } boot(); });

  function init(T) {
    var HTML = document.documentElement;
    var $ = function (s) { return sec.querySelector(s); };
    var $$ = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var view = $('.an-view'), canvas = $('.an-canvas'), svg = $('.an-svg'), tagsBox = $('.an-tags'), caj = $('.an-cajetin');
    if (!canvas) { canvas = document.createElement('canvas'); canvas.className = 'an-canvas'; canvas.setAttribute('aria-hidden', 'true'); view.insertBefore(canvas, view.firstChild); }
    CLEAN.push(function () { canvas.remove(); tagsBox.textContent = ''; svg.textContent = ''; view.classList.remove('is-drag', 'an-cut'); });
    var mqCompact = window.matchMedia('(max-width: 820px)');
    var RM = HTML.classList.contains('rm');
    var COMPACT = mqCompact.matches;

    var TAU = Math.PI * 2, D2R = Math.PI / 180, FOV = 20;
    function clamp(x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function expo(t) { return t >= 1 ? 1 : t <= 0 ? 0 : (1 - Math.pow(2, -10 * t)) / (1 - Math.pow(2, -10)); }
    function inout(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function eout(t) { t = clamp(t); return 1 - (1 - t) * (1 - t) * (1 - t); }
    function smooth(t) { t = clamp(t); return t * t * (3 - 2 * t); }
    function win(x, a, b) { return b <= a ? (x >= b ? 1 : 0) : clamp((x - a) / (b - a)); }
    function damp(k, dt) { return 1 - Math.exp(-k * dt); }
    // fotogramas clave [[u, valor], …], con transición suave dentro de cada tramo
    function kf(list, u) {
      if (u <= list[0][0]) return list[0][1];
      for (var i = 1; i < list.length; i++) if (u <= list[i][0]) { var a = list[i - 1], b = list[i]; return lerp(a[1], b[1], smooth((u - a[0]) / (b[0] - a[0]))); }
      return list[list.length - 1][1];
    }
    // arranque sin golpe (cuadrático) y frenado exponencial, sin rebote: lo que pesa
    function heavy(t) { t = clamp(t); var t1 = t < 0.2 ? t * t / 0.4 : t - 0.1; return expo(t1 / 0.9); }

    /* ---------- color: todo sale de CSS ---------- */
    var C = { bg: new T.Color(), ink: new T.Color(), acc: new T.Color() };
    /* cambio 5: el color se resuelve con el navegador (un píxel de lienzo) antes de pasarlo a three.js:
       r149 no entiende rgb(12 35 64), color-mix() ni otras formas que el tema del sitio usa */
    var pxCtx = null;
    function toRGB(v, fallback) {
      try {
        if (!pxCtx) { var cv = document.createElement('canvas'); cv.width = cv.height = 1; pxCtx = cv.getContext('2d', { willReadFrequently: true }); }
        if (!pxCtx) return fallback;
        pxCtx.clearRect(0, 0, 1, 1); pxCtx.fillStyle = '#000'; pxCtx.fillStyle = fallback; pxCtx.fillStyle = v;
        pxCtx.fillRect(0, 0, 1, 1);
        var d = pxCtx.getImageData(0, 0, 1, 1).data;
        return 'rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')';
      } catch (e) { return fallback; }
    }
    function readPalette() {
      var cs = getComputedStyle(sec);
      var pick = function (name, fallback) { var v = (cs.getPropertyValue(name) || '').trim(); return toRGB(v || fallback, '#0C2340'); };
      C.bg.setStyle(pick('--an-bg', cs.backgroundColor));
      C.ink.setStyle(pick('--an-ink', cs.color));
      C.acc.setStyle(pick('--an-acc', cs.color));
    }
    readPalette();

    /* ---------- renderer ---------- */
    var renderer;
    try {
      renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { noGL(); return; }
    CLEAN.push(function () {
      scene.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) [].concat(o.material).forEach(function (m) { m.dispose(); });
      });
      renderer.dispose();
      if (renderer.forceContextLoss) renderer.forceContextLoss();
    });
    renderer.setClearColor(0x000000, 0);
    var PR = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(PR);
    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(FOV, 1, 0.5, 600);
    var refCam = new T.PerspectiveCamera(FOV, 1, 0.5, 600); // pose de referencia: fija los números
    var VW = 1, VH = 1;
    var RES = { value: new T.Vector2(1, 1) };
    var faceMats = [];

    /* ---------- líneas gruesas en espacio de pantalla, que se trazan ----------
       Cada segmento lleva una clave de orden iO (0–1). Con draw = 0 no hay nada; al subir draw cada
       segmento crece de su origen a su final durante `span`: así se ve la pluma recorrer el dibujo. */
    var FAT_VS = [
      'uniform vec2 res; uniform float width; uniform float draw; uniform float span;',
      'attribute vec3 iA; attribute vec3 iB; attribute float iO;',
      'void main(){',
      '  float f = clamp((draw * (1.0 + span) - iO) / span, 0.0, 1.0);',
      '  vec3 pB = mix(iA, iB, f);',
      '  vec4 a = projectionMatrix * modelViewMatrix * vec4(iA, 1.0);',
      '  vec4 b = projectionMatrix * modelViewMatrix * vec4(pB, 1.0);',
      '  vec2 sa = a.xy / a.w * res * 0.5; vec2 sb = b.xy / b.w * res * 0.5;',
      '  vec2 d = sb - sa; float L = length(d); d = L > 1e-4 ? d / L : vec2(1.0, 0.0);',
      '  vec2 n = vec2(-d.y, d.x);',
      '  vec4 c = position.x < 0.5 ? a : b;',
      '  vec2 off = n * position.y * width * 0.5 + d * (position.x * 2.0 - 1.0) * width * 0.5;',
      '  c.xy += off / (res * 0.5) * c.w;',
      '  if (f <= 0.0) c = vec4(0.0, 0.0, 2.0, 1.0);',
      '  gl_Position = c;',
      '}'].join('\n');
    var FAT_FS = 'uniform vec3 color; void main(){ gl_FragColor = vec4(color, 1.0); }';
    var fatMats = [];
    function fatMat(cssWidth, span) {
      var m = new T.ShaderMaterial({
        uniforms: { res: RES, width: { value: cssWidth * PR }, color: { value: C.ink.clone() }, draw: { value: 1 }, span: { value: span || 0.2 } },
        vertexShader: FAT_VS, fragmentShader: FAT_FS, depthWrite: true, depthTest: true
      });
      m.userData.w = cssWidth; fatMats.push(m); return m;
    }
    var QUAD = [0, -1, 0, 1, -1, 0, 1, 1, 0, 0, -1, 0, 1, 1, 0, 0, 1, 0];
    function fatGeo(max) {
      var g = new T.InstancedBufferGeometry(), n = Math.max(1, max);
      g.setAttribute('position', new T.Float32BufferAttribute(QUAD, 3));
      var A = new T.InstancedBufferAttribute(new Float32Array(n * 3), 3);
      var B = new T.InstancedBufferAttribute(new Float32Array(n * 3), 3);
      var O = new T.InstancedBufferAttribute(new Float32Array(n), 1);
      A.setUsage(T.DynamicDrawUsage); B.setUsage(T.DynamicDrawUsage);
      g.setAttribute('iA', A); g.setAttribute('iB', B); g.setAttribute('iO', O);
      g.instanceCount = 0; return g;
    }
    // claves de trazo: 'idx' = el orden en que se generaron (un renglón tras otro, un círculo alrededor);
    // 'ang' = alrededor del centro de la pieza, en su plano mayor (la pluma recorre el contorno)
    function segKeys(arr, mode, K) {
      var n = arr.length / 6, i, a;
      if (mode === 'idx' || n < 4) { for (i = 0; i < n; i++) K[i] = n > 1 ? i / (n - 1) : 0; return; }
      var M = new Float32Array(n * 3), lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
      for (i = 0; i < n; i++) for (a = 0; a < 3; a++) { var m = (arr[i * 6 + a] + arr[i * 6 + 3 + a]) / 2; M[i * 3 + a] = m; if (m < lo[a]) lo[a] = m; if (m > hi[a]) hi[a] = m; }
      var ext = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]], ax = [0, 1, 2].sort(function (p, q) { return ext[q] - ext[p]; });
      var a1 = ax[0], a2 = ax[1], c1 = (lo[a1] + hi[a1]) / 2, c2 = (lo[a2] + hi[a2]) / 2;
      for (i = 0; i < n; i++) { var ang = Math.atan2(M[i * 3 + a2] - c2, M[i * 3 + a1] - c1); K[i] = ((ang + Math.PI * 1.25) / TAU + 1) % 1; }
    }
    function fatFrom(arr, mode) { // arr: [ax,ay,az,bx,by,bz, ...]
      var n = arr.length / 6, g = fatGeo(n), A = g.attributes.iA.array, B = g.attributes.iB.array;
      for (var i = 0; i < n; i++) {
        A[i * 3] = arr[i * 6]; A[i * 3 + 1] = arr[i * 6 + 1]; A[i * 3 + 2] = arr[i * 6 + 2];
        B[i * 3] = arr[i * 6 + 3]; B[i * 3 + 1] = arr[i * 6 + 4]; B[i * 3 + 2] = arr[i * 6 + 5];
      }
      segKeys(arr, mode || 'idx', g.attributes.iO.array);
      g.instanceCount = n; return g;
    }
    function fatObj(geo, mat) { var o = new T.Mesh(geo, mat); o.frustumCulled = false; o.renderOrder = 2; return o; }

    /* ---------- geometría ---------- */
    function geoFrom(pos) { var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); return g; }
    function tri(pos, a, b, c) {
      var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      var cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
      if (cx * cx + cy * cy + cz * cz < 1e-14) return;
      pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    }
    function edgeSegs(g, ang) { return Array.prototype.slice.call(new T.EdgesGeometry(g, ang || 25).attributes.position.array); }
    function circleSegs(out, x, r, n, phi0, phiLen) {
      phi0 = phi0 || 0; phiLen = phiLen === undefined ? TAU : phiLen;
      for (var j = 0; j < n; j++) {
        var t0 = phi0 + phiLen * j / n, t1 = phi0 + phiLen * (j + 1) / n;
        out.push(x, r * Math.cos(t0), r * Math.sin(t0), x, r * Math.cos(t1), r * Math.sin(t1));
      }
      return out;
    }
    function tubeGeo(pts, r, closed, sides) {
      sides = sides || 10; var pos = [], rings = [], n = pts.length, i, j;
      var up = new T.Vector3(0, 1, 0), tg = new T.Vector3(), nn = new T.Vector3(), bb = new T.Vector3();
      for (i = 0; i < n; i++) {
        var p = pts[i], pa = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], pb = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
        tg.set(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]).normalize();
        if (Math.abs(tg.x) < 0.9) up.set(1, 0, 0); else up.set(0, 1, 0);
        nn.crossVectors(tg, up).normalize(); bb.crossVectors(tg, nn).normalize();
        var ring = [];
        for (j = 0; j < sides; j++) { var a = TAU * j / sides, c = Math.cos(a) * r, s = Math.sin(a) * r; ring.push([p[0] + nn.x * c + bb.x * s, p[1] + nn.y * c + bb.y * s, p[2] + nn.z * c + bb.z * s]); }
        rings.push(ring);
      }
      var last = closed ? n : n - 1;
      for (i = 0; i < last; i++) for (j = 0; j < sides; j++) {
        var r0 = rings[i], r1 = rings[(i + 1) % n];
        tri(pos, r0[j], r1[j], r1[(j + 1) % sides]); tri(pos, r0[j], r1[(j + 1) % sides], r0[(j + 1) % sides]);
      }
      return geoFrom(pos);
    }
    function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 10000) / 10000; }; }

    /* ---------- piezas y láminas ---------- */
    var WALPHA = { main: 0.92, mid: 0.74, det: 0.5 };
    function Piece(S, o) {
      this.S = S; this.stage = o.stage; this.range = o.range;
      this.group = new T.Group(); this.spin = new T.Group(); this.group.add(this.spin);
      this.mat = { main: fatMat(1.45, 0.3), mid: fatMat(1.05, 0.24), det: fatMat(0.8, 0.14) };
      // caras propias de cada pieza: entran al final del trazo (y tapan entonces las aristas ocultas)
      this.faceMat = new T.MeshBasicMaterial({ color: C.bg.clone(), side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, transparent: true, opacity: 1, depthWrite: true });
      faceMats.push(this.faceMat);
      this.fillMat = new T.MeshBasicMaterial({ color: C.acc.clone(), transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide });
      this.fills = []; this.tubes = [];
      this.em = { a: 1, l: 0, f: 0, n: 0 }; this._ta = 1; this._tl = 0; this._tf = 0; this._tn = 0;
      this.shift = 0; this.off = 0; this.t = 0; this.yc = 0; this.th = 0;
      this.pivot = null; this.rotAxis = 'x'; this.pos0 = new T.Vector3(); this._rot = 0;
      this.lift = expo;
    }
    Piece.prototype.solid = function (g, w, parent) {
      parent = parent || this.spin;
      var m = new T.Mesh(g, this.faceMat); m.renderOrder = 0; m.userData.face = true; parent.add(m);
      var f = new T.Mesh(g, this.fillMat); f.renderOrder = 1; f.visible = false; parent.add(f); this.fills.push(f);
      if (w) this.segs(edgeSegs(g), w, parent, 'ang');
      return m;
    };
    Piece.prototype.segs = function (arr, w, parent, mode) {
      if (!arr.length) return null; var o = fatObj(fatFrom(arr, mode || 'idx'), this.mat[w || 'det']); (parent || this.spin).add(o); return o;
    };
    Piece.prototype.tube = function (pts, r, o) {
      o = o || {}; var parent = o.parent || this.spin;
      var m = new T.Mesh(tubeGeo(pts, r, !!o.closed, o.sides || 10), this.faceMat); m.renderOrder = 0; m.userData.face = true; parent.add(m);
      var f = new T.Mesh(m.geometry, this.fillMat); f.renderOrder = 1; f.visible = false; parent.add(f); this.fills.push(f);
      var n = pts.length, geo = fatGeo(n * 2), obj = fatObj(geo, this.mat[o.w || 'mid']); parent.add(obj);
      this.tubes.push({ pts: pts, r: r, closed: !!o.closed, geo: geo, obj: obj });
    };

    function Sheet(id) {
      this.id = id; this.base = new T.Group(); this.root = new T.Group(); this.frame = new T.Group();
      this.base.add(this.root); this.root.add(this.frame); scene.add(this.base); this.base.visible = false;
      this.pieces = []; this.anchors = []; this.auxMat = fatMat(0.8, 0.1); this.auxStrong = fatMat(1.0, 0.1);
      this.uIn = 0; this.uOut = 0; this.on = false; this.fade = 1;
      this.D = 0; this.Ee = 0; this.R = 0; this.lit = null;
      this.yawC = 0; this.elC = 30; this.dolly = 1;
      this.tags = []; this.rect = null; this.col = null; this._shown = null;
      this.B = { D: new T.Vector3(), R: new T.Vector3(), U: new T.Vector3() };
    }
    Sheet.prototype.piece = function (o) { var p = new Piece(this, o); this.pieces.push(p); this.frame.add(p.group); return p; };
    Sheet.prototype.usePack = function (key) {
      this.pieces.forEach(function (p) { p.shift = p.shifts[key]; });
      if (this.clD) { this.clD.visible = key === 'd'; this.clC.visible = key === 'c'; }
    };

    /* ===== Lámina «Prevención» · el expediente en orden (pila de hojas) ===== */
    function buildExpediente() {
      var S = new Sheet('orden');
      var W = 3.2, DD = 4.13, TH = 0.045, TABW = 0.64, TABH = 0.22, G0 = 0.062, N = 7;
      var THF = 0.075, WF = W + 0.26, DF = DD + 0.2, HOLE_V = -1.86, HOLE_U = 0.6;
      for (var i = 0; i < N; i++) {
        var folder = i === N - 1;
        var th = folder ? THF : TH, w = folder ? WF : W, dd = folder ? DF : DD, tabw = folder ? 0.92 : TABW, tabh = folder ? 0.26 : TABH;
        var y0 = folder ? 0 : THF + 0.022 + (N - 2 - i) * G0;
        var p = S.piece({ stage: i, range: [y0, y0 + th] });
        p.th = th; p.yc = y0 + th / 2; p.spin.position.y = p.yc; p.pos0.copy(p.spin.position);
        // cada hoja gira sobre la línea del broche (bisagra) mientras sube: el expediente se abre en abanico
        if (!folder) { p.pivot = [0, p.yc, HOLE_V]; p.rotAxis = 'x'; }
        var tx = folder ? w / 2 - 0.3 - tabw : -W / 2 + 0.16 + i * ((W - 0.32 - TABW) / (N - 2));
        var sh = new T.Shape();
        sh.moveTo(-w / 2, -dd / 2); sh.lineTo(w / 2, -dd / 2); sh.lineTo(w / 2, dd / 2);
        sh.lineTo(tx + tabw, dd / 2); sh.lineTo(tx + tabw - 0.07, dd / 2 + tabh); sh.lineTo(tx + 0.07, dd / 2 + tabh); sh.lineTo(tx, dd / 2);
        sh.lineTo(-w / 2, dd / 2); sh.lineTo(-w / 2, -dd / 2);
        var g = new T.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false, curveSegments: 4 });
        g.rotateX(-Math.PI / 2); g.translate(0, -th / 2, 0);
        p.solid(g, 'main');
        var s2 = docLines(i, W, DD);
        if (!folder) { // barrenos del broche
          [-HOLE_U, HOLE_U].forEach(function (hu) { for (var c = 0; c < 18; c++) { var a0 = TAU * c / 18, a1 = TAU * (c + 1) / 18; s2.push(hu + 0.05 * Math.cos(a0), HOLE_V + 0.05 * Math.sin(a0), hu + 0.05 * Math.cos(a1), HOLE_V + 0.05 * Math.sin(a1)); } });
        }
        // ranura de etiqueta en la pestaña
        var tv0 = -dd / 2 - tabh + 0.065, tw = tabw - 0.3;
        s2.push(tx + 0.15, tv0, tx + 0.15 + tw, tv0, tx + 0.15 + tw, tv0, tx + 0.15 + tw, tv0 + 0.09, tx + 0.15 + tw, tv0 + 0.09, tx + 0.15, tv0 + 0.09, tx + 0.15, tv0 + 0.09, tx + 0.15, tv0);
        if (folder) { // canto de la carpeta: doblez marcado a lo largo
          s2.push(-w / 2 + 0.12, -dd / 2 + 0.02, -w / 2 + 0.12, dd / 2 - 0.02);
        }
        var yT = th / 2 + 0.003, a3 = [];
        for (var k = 0; k < s2.length; k += 4) a3.push(s2[k], yT, s2[k + 1], s2[k + 2], yT, s2[k + 3]);
        p.segs(a3, 'det');
        if (folder) {
          // broche Baco: placa remachada a la carpeta y dos patas por las que se deslizan las hojas
          var bp = new T.BoxGeometry(1.56, 0.014, 0.15); bp.translate(0, th / 2 + 0.007, HOLE_V); p.solid(bp, 'det');
          var rv = []; [-0.68, 0.68].forEach(function (ru) { for (var c2 = 0; c2 < 14; c2++) { var b0 = TAU * c2 / 14, b1 = TAU * (c2 + 1) / 14; rv.push(ru + 0.03 * Math.cos(b0), th / 2 + 0.016, HOLE_V + 0.03 * Math.sin(b0), ru + 0.03 * Math.cos(b1), th / 2 + 0.016, HOLE_V + 0.03 * Math.sin(b1)); } });
          p.segs(rv, 'det');
          var pg = new T.Group(); pg.position.y = th / 2 + 0.014; p.spin.add(pg); S.prongs = pg;
          // tramo oculto de las patas (entre hojas): a trazos, como se dibuja una arista oculta
          S.hidMat = fatMat(0.8, 0.2); S.hidMat.depthTest = false; S.hidMat.depthWrite = false; S.hidMat.transparent = true;
          S.hidGeo = fatGeo(220);
          var ho = fatObj(S.hidGeo, S.hidMat); ho.renderOrder = 3; p.spin.add(ho);
          S.hid = { y0: th / 2 + 0.014, u: [-HOLE_U, HOLE_U], v: HOLE_V };
          var cap = [];
          [-HOLE_U, HOLE_U].forEach(function (hu) {
            p.tube([[hu, 0, HOLE_V], [hu, 0.5, HOLE_V], [hu, 1, HOLE_V]], 0.026, { parent: pg, w: 'mid', sides: 12 });
            for (var c3 = 0; c3 < 16; c3++) { var e0 = TAU * c3 / 16, e1 = TAU * (c3 + 1) / 16; cap.push(hu + 0.026 * Math.cos(e0), 1, HOLE_V + 0.026 * Math.sin(e0), hu + 0.026 * Math.cos(e1), 1, HOLE_V + 0.026 * Math.sin(e1)); }
          });
          p.segs(cap, 'mid', pg);
        }
        if (i === 0) {
          // la pisa del broche, sobre la primera hoja
          var bar = new T.BoxGeometry(1.5, 0.03, 0.12); bar.translate(0, th / 2 + 0.015, HOLE_V); p.solid(bar, 'mid');
          var rg = []; [-HOLE_U, HOLE_U].forEach(function (hu) { for (var c4 = 0; c4 < 16; c4++) { var f0 = TAU * c4 / 16, f1 = TAU * (c4 + 1) / 16; rg.push(hu + 0.045 * Math.cos(f0), th / 2 + 0.031, HOLE_V + 0.045 * Math.sin(f0), hu + 0.045 * Math.cos(f1), th / 2 + 0.031, HOLE_V + 0.045 * Math.sin(f1)); } });
          p.segs(rg, 'det');
        }
      }
      // despiece hacia arriba: la carpeta se queda en la tornamesa y las hojas suben por las patas del broche,
      // la de arriba primero (nada atraviesa nada)
      function packUp(gap) {
        var out = [], y = 0;
        for (var k = N - 1; k >= 0; k--) {
          var p = S.pieces[k];
          if (k === N - 1) { out[k] = 0; y = p.range[1]; continue; }
          var b = y + gap; out[k] = b - p.range[0]; y = b + (p.range[1] - p.range[0]);
        }
        return out;
      }
      var sd = packUp(0.9 - TH), sc = packUp(1.14 - TH);
      S.pieces.forEach(function (p, k) { p.shifts = { d: sd[k], c: sc[k] }; });
      S.wins = S.pieces.map(function (p, k) { return [k * 0.125, k * 0.125 + 0.22]; });
      S.drawJ = S.pieces.map(function (p, k) { return (N - 1 - k) * 0.04; }); // se traza de abajo arriba: la carpeta primero
      S.anchors = S.pieces.map(function (p) { return { p: p, r: 1.22 }; });
      S.stageP = S.pieces.slice();
      // tornamesa (anillo de grados, quieto) y línea de centros vertical
      var ring = []; circleSegs(ring, 0, 2.95, 144);
      for (var d = 0; d < 72; d++) { var t = TAU * d / 72, L = d % 18 === 0 ? 0.26 : d % 6 === 0 ? 0.16 : 0.08; ring.push(0, 2.95 * Math.cos(t), 2.95 * Math.sin(t), 0, (2.95 - L) * Math.cos(t), (2.95 - L) * Math.sin(t)); }
      for (var q = 0; q < ring.length; q += 3) { var yy = ring[q + 1], zz = ring[q + 2]; ring[q] = yy; ring[q + 1] = 0; ring[q + 2] = zz; }
      S.ringObj = fatObj(fatFrom(ring, 'idx'), S.auxMat); S.base.add(S.ringObj);
      function centerLine(top) { var cl = []; for (var yv = -1.1; yv < top; yv += 0.96) { cl.push(0, yv, 0, 0, yv + 0.62, 0); cl.push(0, yv + 0.74, 0, 0, yv + 0.8, 0); } return fatObj(fatFrom(cl, 'idx'), S.auxMat); }
      S.clD = centerLine(sd[0] + 1.0); S.clC = centerLine(sc[0] + 1.0); S.base.add(S.clD); S.base.add(S.clC);
      S.foot = [W, DD];
      S.cotaY = function () { var top = S.pieces[0], bot = S.pieces[N - 1]; return [bot.yc + bot.off - bot.th / 2, top.yc + top.off + top.th / 2]; };
      S.fitEach = function (ref, cb) {
        S.pieces.forEach(function (p) { var yc = p.yc + (ref ? p.shift : p.off); for (var j = 0; j < 16; j++) { var t = TAU * j / 16; cb(2.75 * Math.cos(t), yc, 2.75 * Math.sin(t)); } });
        var pb = S.pieces[N - 1], yb = pb.yc + (ref ? pb.shift : pb.off) - 0.4;
        for (var j2 = 0; j2 < 16; j2++) { var t2 = TAU * j2 / 16; cb(2.95 * Math.cos(t2), yb, 2.95 * Math.sin(t2)); }
      };
      // abanico: la hoja se inclina sobre el broche mientras viaja (el canto libre se queda atrás) y llega plana
      S.tilt = function (p) {
        if (!p.pivot) return 0;
        var b = Math.sin(Math.PI * Math.sqrt(clamp(p.t)));
        return 7 * D2R * (p.shift / Math.max(1e-3, S.pieces[0].shift)) * b * b;
      };
      S.tl = { draw: [0, 0.3], exp: [0.34, 0.86] }; S.heroK = 2.3;
      S.kf = { yaw: [[0, -6], [0.34, -18], [1, -30]], el: [[0, 24], [0.34, 30], [0.86, 33], [1, 39]], dolly: [[0, 0.9], [0.34, 1]] };
      S.kfOut = { yaw: [[0, -30], [1, -44]], el: [[0, 39], [1, 28]] };
      return S;
    }
    // contenido de cada hoja, en coordenadas de página (u a lo ancho, v hacia abajo; v<0 es la parte de arriba de la hoja)
    function docLines(kind, W, DD) {
      var s = [], R = rng(kind * 7919 + 17);
      var L = function (u1, v1, u2, v2) { s.push(u1, v1, u2, v2); };
      var rect = function (u, v, w, h) { L(u, v, u + w, v); L(u + w, v, u + w, v + h); L(u + w, v + h, u, v + h); L(u, v + h, u, v); };
      var circ = function (cu, cv, r, n) { n = n || 28; for (var i = 0; i < n; i++) { var a0 = TAU * i / n, a1 = TAU * (i + 1) / n; L(cu + r * Math.cos(a0), cv + r * Math.sin(a0), cu + r * Math.cos(a1), cv + r * Math.sin(a1)); } };
      var text = function (u0, v0, w, n, step, last) { step = step || 0.15; last = last || 0.55; for (var i = 0; i < n; i++) { var len = i === n - 1 ? w * (last + R() * 0.2) : w * (0.9 + R() * 0.1); L(u0, v0 + i * step, u0 + len, v0 + i * step); } return v0 + n * step; };
      var squig = function (u0, v0, w) { var prev = null; for (var i = 0; i <= 26; i++) { var t = i / 26, u = u0 + w * t, v = v0 - 0.06 * Math.sin(t * TAU * 2.1 + 0.6) * (1 - 0.4 * t) - 0.03 * Math.sin(t * TAU * 5.3); if (prev) L(prev[0], prev[1], u, v); prev = [u, v]; } };
      var title = function () { L(-0.62, -1.74, 0.62, -1.74); L(-0.4, -1.62, 0.4, -1.62); };
      var U0 = -1.24, UW = 2.48;
      switch (kind) {
        case 0: // contrato individual: cláusulas y dos firmas
          title(); var v = text(U0, -1.38, UW, 5); v = text(U0, v + 0.12, UW, 4); text(U0, v + 0.12, UW, 3);
          L(U0, 1.44, -0.3, 1.44); L(0.3, 1.44, 1.24, 1.44); squig(-1.12, 1.31, 0.72); squig(0.44, 1.31, 0.66);
          L(-0.98, 1.58, -0.56, 1.58); L(0.56, 1.58, 0.98, 1.58); break;
        case 1: // reglamento interior: artículos numerados
          title(); for (var k = 0; k < 7; k++) { var vk = -1.36 + k * 0.43; circ(-1.15, vk, 0.032, 10); L(-1.02, vk, -1.02 + 2.26 * (0.82 + R() * 0.18), vk); L(-1.02, vk + 0.15, -1.02 + 2.26 * (0.35 + R() * 0.45), vk + 0.15); } break;
        case 2: // contrato colectivo legitimado: sello y firma
          title(); var v2 = text(U0, -1.38, UW, 6); text(U0, v2 + 0.12, UW, 4);
          circ(0.72, 1.16, 0.36, 44); circ(0.72, 1.16, 0.29, 40);
          for (var t = 0; t < 30; t++) { var at = TAU * t / 30; L(0.72 + 0.305 * Math.cos(at), 1.16 + 0.305 * Math.sin(at), 0.72 + 0.345 * Math.cos(at), 1.16 + 0.345 * Math.sin(at)); }
          for (var st = 0; st < 5; st++) { var s0 = -Math.PI / 2 + TAU * st / 5, s1 = -Math.PI / 2 + TAU * (st + 2) / 5; L(0.72 + 0.14 * Math.cos(s0), 1.16 + 0.14 * Math.sin(s0), 0.72 + 0.14 * Math.cos(s1), 1.16 + 0.14 * Math.sin(s1)); }
          L(U0, 1.38, 0.24, 1.38); squig(-1.08, 1.25, 0.95); break;
        case 3: // registro de asistencia: tabla con marcas
          title(); var cols = [-1.24, -0.46, -0.02, 0.42, 0.84, 1.24];
          for (var r = 0; r <= 11; r++) L(-1.24, -1.3 + r * 0.25, 1.24, -1.3 + r * 0.25);
          L(-1.24, -1.24, 1.24, -1.24);
          cols.forEach(function (cu) { L(cu, -1.3, cu, 1.45); });
          for (var rr = 1; rr < 11; rr++) for (var cc = 1; cc < 5; cc++) if (R() > 0.28) { var mu = cols[cc] + 0.13, mv = -1.3 + rr * 0.25 + 0.15; L(mu, mv, mu + 0.05, mv + 0.05); L(mu + 0.05, mv + 0.05, mu + 0.17, mv - 0.07); }
          for (var rn = 1; rn < 11; rn++) L(-1.16, -1.3 + rn * 0.25 + 0.13, -1.16 + 0.55 * (0.5 + R() * 0.5), -1.3 + rn * 0.25 + 0.13);
          break;
        case 4: // REPSE: constancia de registro con marco doble, folio y sello
          rect(-1.34, -1.74, 2.68, 3.6); rect(-1.26, -1.66, 2.52, 3.44);
          L(-0.7, -1.44, 0.7, -1.44); L(-0.5, -1.32, 0.5, -1.32);
          for (var c4 = 0; c4 < 5; c4++) { var w4 = 1.9 * (0.75 + R() * 0.25); L(-w4 / 2, -1.06 + c4 * 0.16, w4 / 2, -1.06 + c4 * 0.16); }
          for (var f = 0; f < 10; f++) L(-0.9 + f * 0.19, 0.0, -0.9 + f * 0.19 + 0.12, 0.0);
          rect(-0.98, -0.12, 1.96, 0.24);
          circ(0, 0.92, 0.3, 40); circ(0, 0.92, 0.24, 36); circ(0, 0.92, 0.06, 14);
          L(-0.62, 1.5, 0.62, 1.5); squig(-0.5, 1.38, 0.95); break;
        case 5: // NOM-035: cuestionario con casillas
          title();
          for (var q = 0; q < 9; q++) {
            var vq = -1.32 + q * 0.33; L(U0, vq, U0 + 1.5 * (0.6 + R() * 0.4), vq);
            var pick = Math.floor(R() * 3);
            [0.52, 0.8, 1.08].forEach(function (cu, ci) { rect(cu, vq - 0.06, 0.12, 0.12); if (ci === pick) { L(cu + 0.025, vq, cu + 0.05, vq + 0.035); L(cu + 0.05, vq + 0.035, cu + 0.1, vq - 0.04); } });
          }
          break;
        default: // expediente del trabajador: foto, campos y lista de documentos
          rect(-1.24, -1.76, 0.64, 0.8); circ(-0.92, -1.47, 0.13, 26);
          var sh = []; for (var a6 = 0; a6 <= 14; a6++) { var aa6 = Math.PI + Math.PI * a6 / 14; sh.push([-0.92 + 0.25 * Math.cos(aa6), -1.0 + 0.2 * Math.sin(aa6)]); }
          for (var z = 0; z < sh.length - 1; z++) L(sh[z][0], sh[z][1], sh[z + 1][0], sh[z + 1][1]);
          for (var fl = 0; fl < 5; fl++) { var vf = -1.68 + fl * 0.17; L(-0.46, vf, -0.2, vf); L(-0.12, vf, 1.24, vf); }
          L(U0, -0.78, 1.24, -0.78); L(U0, -0.74, 1.24, -0.74);
          for (var dl = 0; dl < 8; dl++) { var vd = -0.5 + dl * 0.27; rect(U0, vd - 0.06, 0.12, 0.12); L(U0 + 0.1 - 0.075, vd, U0 + 0.05, vd + 0.035); L(U0 + 0.05, vd + 0.035, U0 + 0.1, vd - 0.04); L(U0 + 0.24, vd, U0 + 0.24 + 1.9 * (0.5 + R() * 0.5), vd); }
          break;
      }
      return s;
    }

    /* ===== Lámina «Solución» · el juicio, etapa por etapa: caja de archivo con un folder por etapa ===== */
    function buildCaja() {
      var S = new Sheet('solucion');
      // medidas en decímetros: caja de archivo para tamaño carta (40 × 31 × 26 cm), folders de 29.4 × 23.6 cm
      var BL = 4.0, BW = 3.1, BH = 2.6, T0 = 0.05;               // caja: largo (x), ancho (z), alto (y), pared de cartón
      var LL = BL + 0.1, LW = BW + 0.1, LD = 0.55, LT = 0.045;    // tapa
      var FW = 2.94, HB = 2.36, HF = 2.08, TBH = 0.15, TW = 0.92; // folder: ancho, alto de la tapa trasera y de la delantera, pestaña
      var N = 7, X0 = 1.45, DX = 0.43, h = FW / 2, e = 0.003;     // el primer folder va al frente (+x)
      var R = rng(4242);
      S.foot = [BL, BW];
      function slab(sh, depth) { return new T.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false, curveSegments: 12 }); }
      function rectShape(x0, y0, x1, y1) { var sh = new T.Shape(); sh.moveTo(x0, y0); sh.lineTo(x1, y0); sh.lineTo(x1, y1); sh.lineTo(x0, y1); sh.lineTo(x0, y0); return sh; }
      function stadium(P, cx, cy, w, hh) { // asa troquelada: rectángulo de extremos redondos
        var r = hh / 2;
        P.moveTo(cx - w / 2 + r, cy - r); P.lineTo(cx + w / 2 - r, cy - r);
        P.absarc(cx + w / 2 - r, cy, r, -Math.PI / 2, Math.PI / 2, false);
        P.lineTo(cx - w / 2 + r, cy + r);
        P.absarc(cx - w / 2 + r, cy, r, Math.PI / 2, Math.PI * 1.5, false);
        return P;
      }
      function endWall(sh, depth, x, y) { var g = slab(sh, depth); g.rotateY(-Math.PI / 2); g.translate(x, y || 0, 0); return g; }
      function zyPlane(sh, x, y) { var g = new T.ShapeGeometry(sh, 8); g.rotateY(-Math.PI / 2); g.translate(x, y, 0); return g; }
      function loopZY(out, x, pts) { for (var i = 0; i < pts.length; i++) { var a = pts[i], b = pts[(i + 1) % pts.length]; out.push(x, a[1], a[0], x, b[1], b[0]); } }
      function stadiumPts(cx, cy, w, hh, n) { var p = new T.Path(); stadium(p, cx, cy, w, hh); return p.getSpacedPoints(n || 40).slice(0, -1).map(function (v) { return [v.x, v.y]; }); }

      /* tapa: se levanta primero, con peso */
      var ly0 = BH + 0.03 - LD, ly1 = BH + 0.03;
      var lid = S.piece({ stage: -1, range: [ly0, ly1] });
      var lt = new T.BoxGeometry(LL, LT, LW); lt.translate(0, ly1 - LT / 2, 0); lid.solid(lt, 'main');
      var skH = LD - LT;
      [LW / 2 - LT, -LW / 2].forEach(function (z) { var g = slab(rectShape(-LL / 2, 0, LL / 2, skH), LT); g.translate(0, ly0, z); lid.solid(g, 'main'); });
      var notch = function () { // cabecera de la tapa con muesca para los dedos
        var sh = new T.Shape(), w = LW / 2 - LT;
        sh.moveTo(-w, 0); sh.lineTo(-0.42, 0); sh.absellipse(0, 0, 0.42, 0.2, Math.PI, 0, true); sh.lineTo(w, 0); sh.lineTo(w, skH); sh.lineTo(-w, skH); sh.lineTo(-w, 0);
        return sh;
      };
      lid.solid(endWall(notch(), LT, LL / 2, ly0), 'main');
      lid.solid(endWall(notch(), LT, -LL / 2 + LT, ly0), 'main');
      var ld = [], yt = ly1 + e;
      // marcado del cartón en la cara superior y etiqueta de la caja
      var ins = 0.08; ld.push(-LL / 2 + ins, yt, -LW / 2 + ins, LL / 2 - ins, yt, -LW / 2 + ins, LL / 2 - ins, yt, -LW / 2 + ins, LL / 2 - ins, yt, LW / 2 - ins,
        LL / 2 - ins, yt, LW / 2 - ins, -LL / 2 + ins, yt, LW / 2 - ins, -LL / 2 + ins, yt, LW / 2 - ins, -LL / 2 + ins, yt, -LW / 2 + ins);
      var lx0 = 0.55, lx1 = 1.55, lz0 = -0.62, lz1 = 0.62;
      ld.push(lx0, yt, lz0, lx1, yt, lz0, lx1, yt, lz0, lx1, yt, lz1, lx1, yt, lz1, lx0, yt, lz1, lx0, yt, lz1, lx0, yt, lz0);
      for (var li = 0; li < 3; li++) { var lxx = lx0 + 0.25 + li * 0.25; ld.push(lxx, yt, lz1 - 0.12, lxx, yt, lz1 - 0.12 - (0.5 + R() * 0.55)); }
      lid.segs(ld, 'det');
      // la tapa sale recta (las faldas abrazan la caja) con peso y, ya libre, se inclina apenas en el aire antes de nivelarse;
      // luego sube despacio, siempre por encima de la escalera de folders, hasta su altura final
      lid.pivot = [0, (ly0 + ly1) / 2, 0]; lid.rotAxis = 'z';

      /* folders: uno por etapa, del frente hacia atrás */
      var tabZ = [-0.95, 0, 0.95], folders = [];
      for (var k = 0; k < N; k++) {
        var thk = k === 3 ? 0.17 : 0.095, xc = X0 - k * DX, yb = T0 + 0.006, xf = xc + thk / 2, xb = xc - thk / 2, tz = tabZ[k % 3];
        var f = S.piece({ stage: k, range: [yb, yb + HB + TBH] });
        f.th = HB + TBH; folders.push(f);
        var sb = new T.Shape();
        sb.moveTo(-h, 0); sb.lineTo(h, 0); sb.lineTo(h, HB);
        sb.lineTo(tz + TW / 2, HB); sb.lineTo(tz + TW / 2 - 0.08, HB + TBH); sb.lineTo(tz - TW / 2 + 0.08, HB + TBH); sb.lineTo(tz - TW / 2, HB);
        sb.lineTo(-h, HB); sb.lineTo(-h, 0);
        f.solid(zyPlane(sb, xb, yb), 'main');
        f.solid(zyPlane(rectShape(-h, 0, h, HF), xf, yb), 'main');
        var bt = new T.PlaneGeometry(thk, FW); bt.rotateX(-Math.PI / 2); bt.translate(xc, yb, 0); f.solid(bt, null);
        var np = k === 3 ? 6 : 3, step = thk / (np + 1), tops = [];
        for (var j = 0; j < np; j++) {
          var xp = xb + step * (j + 1), top = HF + 0.07 + R() * 0.06, z0 = -h + 0.06 + R() * 0.03, z1 = h - 0.06 - R() * 0.03;
          tops.push(top);
          f.solid(zyPlane(rectShape(z0, 0.012, z1, top), xp, yb), 'det');
        }
        var topMax = Math.max.apply(null, tops), xFirst = xb + step * np;
        var fd = [];
        [0.1, 0.19, 0.28].forEach(function (yy) { fd.push(xf + e, yb + yy, -h, xf + e, yb + yy, h); fd.push(xb - e, yb + yy, -h, xb - e, yb + yy, h); });
        var ty0 = yb + HB + 0.025, ty1 = yb + HB + 0.115, tl = tz - TW / 2 + 0.13, tr = tz + TW / 2 - 0.13, xt = xb + e;
        loopZY(fd, xt, [[tl, ty0], [tr, ty0], [tr, ty1], [tl, ty1]]);
        var wl = 0.22 + R() * 0.3; fd.push(xt, yb + HB + 0.07, tr - 0.07, xt, yb + HB + 0.07, tr - 0.07 - wl);
        if (k % 3 !== 1) { var zg = h - 0.2, yg = yb + tops[np - 1] - 0.035; fd.push(xFirst + e, yg, zg, xFirst + e, yg - 0.045, zg - 0.045); }
        f.segs(fd, 'det');
        if (k === 1 || k === 3 || k === 5) {
          var zc = tz + 1.1 + 0.16 < h ? tz + 1.1 : tz - 1.1, CW = 0.3;
          var xbm = (xb + step + xFirst) / 2, pb = (xFirst - xb - step) / 2 + 0.006, yTop = yb + topMax;
          var yl = yTop - 0.15, ybs = yTop + 0.03, al = pb + 0.004, bs = pb + 0.058;
          var cs = new T.Shape(); cs.moveTo(xbm - al, yl); cs.lineTo(xbm + al, yl); cs.lineTo(xbm + bs, ybs); cs.lineTo(xbm - bs, ybs); cs.lineTo(xbm - al, yl);
          var cg = slab(cs, CW); cg.translate(0, 0, zc - CW / 2); f.solid(cg, 'mid');
          var dvx = bs - al, dvy = ybs - yl, dl = Math.hypot(dvx, dvy); dvx /= dl; dvy /= dl;
          [-1, 1].forEach(function (sg) {
            var nx = sg * dvy * 0.011, ny = -dvx * 0.011;
            var x0 = xbm + sg * al + nx, y0 = yl + ny, L1 = 0.4, x1 = x0 + sg * dvx * L1, y1 = y0 + dvy * L1;
            var pts = [[x0, y0, zc - 0.115], [x1, y1, zc - 0.1], [x1 + sg * 0.006, y1 + 0.03, zc - 0.07], [x1 + sg * 0.008, y1 + 0.04, zc], [x1 + sg * 0.006, y1 + 0.03, zc + 0.07], [x1, y1, zc + 0.1], [x0, y0, zc + 0.115]];
            f.tube(pts, 0.0075, { w: 'mid', sides: 8 });
          });
        }
        f.anchorPt = [xb, yb + HB - 0.06, -h];
      }

      /* la caja: se queda abajo */
      var box = S.piece({ stage: -1, range: [0, BH] });
      var holeY = BH - 0.42;
      [BL / 2, -BL / 2 + T0].forEach(function (x) { var sh = rectShape(-BW / 2 + T0, 0, BW / 2 - T0, BH); sh.holes.push(stadium(new T.Path(), 0, holeY, 0.95, 0.3)); box.solid(endWall(sh, T0, x), 'main'); });
      [BW / 2 - T0, -BW / 2].forEach(function (z) { var g = slab(rectShape(-BL / 2, 0, BL / 2, BH), T0); g.translate(0, 0, z); box.solid(g, 'main'); });
      var bb = new T.BoxGeometry(BL - 2 * T0, T0, BW - 2 * T0); bb.translate(0, T0 / 2, 0); box.solid(bb, null);
      var bd = [], yr = BH - 0.1;
      bd.push(BL / 2 + e, yr, -BW / 2, BL / 2 + e, yr, BW / 2, -BL / 2 - e, yr, -BW / 2, -BL / 2 - e, yr, BW / 2);
      bd.push(-BL / 2, yr, BW / 2 + e, BL / 2, yr, BW / 2 + e, -BL / 2, yr, -BW / 2 - e, BL / 2, yr, -BW / 2 - e);
      [BL / 2 + e, -BL / 2 - e].forEach(function (x) { loopZY(bd, x, stadiumPts(0, holeY, 1.11, 0.46, 44)); });
      var xs = -BL / 2 + 0.16, zs = BW / 2 + e;
      bd.push(xs, 0.03, zs, xs, BH - 0.13, zs);
      for (var gq = 0; gq < 5; gq++) { var yq = 0.32 + gq * 0.46; bd.push(xs - 0.06, yq, zs, xs + 0.06, yq, zs, xs - 0.06, yq, zs, xs - 0.06, yq - 0.02, zs, xs + 0.06, yq, zs, xs + 0.06, yq - 0.02, zs); }
      var xe = BL / 2 + e, cz0 = -0.74, cz1 = 0.74, cy0 = 0.46, cy1 = 1.56;
      loopZY(bd, xe, [[cz0, cy0], [cz1, cy0], [cz1, cy1], [cz0, cy1]]);
      bd.push(xe, 1.32, cz0, xe, 1.32, cz1, xe, 1.06, cz0, xe, 1.06, cz1, xe, 0.8, cz0, xe, 0.8, cz1, xe, 0.46, 0.3, xe, 1.32, 0.3);
      loopZY(bd, xe, [[-0.7, 1.37], [-0.44, 1.37], [-0.44, 1.51], [-0.7, 1.51]]);
      bd.push(xe, 1.44, 0.62, xe, 1.44, -0.2);
      [1.19, 0.93, 0.63].forEach(function (yy, ii) { bd.push(xe, yy, 0.66, xe, yy, 0.38); bd.push(xe, yy, 0.22, xe, yy, 0.22 - (0.35 + R() * 0.45)); if (ii === 2) bd.push(xe, yy - 0.08, 0.22, xe, yy - 0.08, -0.3); });
      var zp = BW / 2 + e, px0 = -0.95, px1 = 1.35, py0 = 0.52, py1 = 1.62;
      bd.push(px0, py0, zp, px1, py0, zp, px1, py0, zp, px1, py1, zp, px1, py1, zp, px0, py1, zp, px0, py1, zp, px0, py0, zp);
      bd.push(px0, 1.38, zp, px1, 1.38, zp, px0, 1.12, zp, px1, 1.12, zp, px0, 0.86, zp, px1, 0.86, zp, 0.35, py0, zp, 0.35, 1.38, zp);
      bd.push(px0 + 0.12, 1.5, zp, px0 + 0.12 + 0.9, 1.5, zp);
      [1.25, 0.99, 0.69].forEach(function (yy) { bd.push(px0 + 0.12, yy, zp, px0 + 0.12 + 0.35 + R() * 0.5, yy, zp); bd.push(0.47, yy, zp, 0.47 + 0.3 + R() * 0.45, yy, zp); });
      box.segs(bd, 'det');

      // orden: la tapa, luego los folders en el orden del procedimiento; la caja no se mueve
      S.pieces = [lid].concat(folders, [box]);
      var DY = 0.5, R0 = 0.36, DYc = 0.57;
      folders.forEach(function (fo, i) { fo.shifts = { d: R0 + i * DY, c: R0 + i * DYc }; });
      var topF = T0 + 0.006 + R0 + (N - 1) * DY + HB + TBH, topFc = T0 + 0.006 + R0 + (N - 1) * DYc + HB + TBH;
      lid.shifts = { d: topF + 1.3 - ly0, c: topFc + 1.3 - ly0 };
      var L1 = T0 + 0.006 + R0 + HB + TBH + 1.0 - ly0;
      lid.offFn = function (p) { return L1 * heavy(p.t) + (p.shift - L1) * smooth(win(S.Ee, 0.12, 0.98)); };
      box.shifts = { d: 0, c: 0 };
      S.wins = S.pieces.map(function (p, k) { return k === 0 ? [0, 0.17] : k <= N ? [0.12 + (k - 1) * 0.11, 0.32 + (k - 1) * 0.11] : [0, 0]; });
      // se traza la caja primero, luego los folders del frente hacia atrás y al final la tapa
      S.drawJ = S.pieces.map(function (p, k) { return (k === 0 ? 8 : k <= N ? k : 0) * 0.03; });
      S.tilt = function (p) { if (p !== lid) return 0; var t = p.t; return 5 * D2R * Math.pow(Math.sin(Math.PI * win(t, 0.22, 0.96)), 2); };
      S.anchors = folders.map(function (fo) { return { p: fo, pt: fo.anchorPt }; });
      S.stageP = folders.slice();
      S.cotaY = function () { return [0, ly1 + lid.off]; };
      // líneas de construcción: eje vertical y ejes de la planta, a trazo y punto, que asoman bajo la caja
      var cl = []; for (var yv = -0.4; yv < 7.4; yv += 0.96) { cl.push(0, yv, 0, 0, yv + 0.62, 0); cl.push(0, yv + 0.74, 0, 0, yv + 0.8, 0); }
      S.clObj = fatObj(fatFrom(cl, 'idx'), S.auxMat); S.root.add(S.clObj);
      var ax = [], ext = 0.75;
      for (var xv = -BL / 2 - ext; xv < BL / 2 + ext - 0.05; xv += 0.6) { ax.push(xv, 0.002, 0, Math.min(BL / 2 + ext, xv + 0.4), 0.002, 0); ax.push(xv + 0.48, 0.002, 0, xv + 0.52, 0.002, 0); }
      for (var zv = -BW / 2 - ext; zv < BW / 2 + ext - 0.05; zv += 0.6) { ax.push(0, 0.002, zv, 0, 0.002, Math.min(BW / 2 + ext, zv + 0.4)); ax.push(0, 0.002, zv + 0.48, 0, 0.002, zv + 0.52); }
      S.axObj = fatObj(fatFrom(ax, 'idx'), S.auxMat); S.root.add(S.axObj);
      S.tl = { draw: [0, 0.21], exp: [0.255, 0.87] }; S.heroK = 1.75;
      S.kf = { yaw: [[0, -28], [0.255, -38], [0.87, -50], [1, -56]], el: [[0, 22], [0.255, 17], [0.87, 15], [1, 13]], dolly: [[0, 0.9], [0.255, 1]] };
      S.kfOut = { yaw: [[0, -56], [1, -64]], el: [[0, 13], [1, 18]] };
      fitCircles(S);
      return S;
    }
    // encuadre que no cambia al girar: por pieza, dos círculos (abajo y arriba) del radio que alcanza alrededor del eje Y
    function fitCircles(S) {
      S.base.updateMatrixWorld(true);
      S.pieces.forEach(function (p) {
        var ymin = Infinity, ymax = -Infinity, rr = 0, v = new T.Vector3();
        p.spin.traverse(function (o) {
          if (!o.isMesh || !o.userData.face) return;
          var a = o.geometry.attributes.position;
          for (var i = 0; i < a.count; i++) { v.fromBufferAttribute(a, i).applyMatrix4(o.matrixWorld); ymin = Math.min(ymin, v.y); ymax = Math.max(ymax, v.y); rr = Math.max(rr, Math.hypot(v.x, v.z)); }
        });
        p.fy = [ymin, ymax]; p.fr = rr;
      });
      S.fitEach = function (ref, cb) {
        S.pieces.forEach(function (p) {
          var off = ref ? p.shift : p.off;
          p.fy.forEach(function (y) { for (var j = 0; j < 12; j++) { var t = TAU * j / 12; cb(p.fr * Math.cos(t), y + off, p.fr * Math.sin(t)); } });
        });
      };
    }

    /* ---------- estado ---------- */
    var sheets = {}, builders = { orden: buildExpediente, solucion: buildCaja };
    function getSheet(id) { if (!sheets[id]) { sheets[id] = builders[id](); prepSheet(sheets[id]); } return sheets[id]; }
    var cur = null, leaving = null, rmT = 0;
    var introStart = -1;
    var pShown = 0, pTarget = 0;
    var hoverStage = null, pinned = null;
    var lastInteract = -1e9, lastScrollT = -1e9, dragging = false, userYaw = 0, userPitch = 0, velYaw = 0, velPitch = 0;
    var visible = false, raf = 0, lastT = 0;
    var mix = { a: null, b: null, w: 0 };
    var man = { on: false, E: 1, Ev: 1, k: 0, at: 0 };
    var drift = { off: 0, t: -1, amp: 0, armed: true };
    var DRIFT_DUR = 5.2, DRIFT_V = 1.4 * D2R;
    // recorrido de escritorio (fracción del scroll de la sección; negativo = mientras entra)
    var G = { a0: -0.06, a1: 0.4, aOut: 0.5, b0: 0.475, b1: 0.975, swap: 0.49, w0: 0.44, w1: 0.52, aDone: 0.385, bDone: 0.99 };
    // una sola lámina: se traza y se despieza a lo largo del recorrido y queda completa al final
    var G1 = { a0: -0.1, a1: 0.86, done: 0.93 };
    var PH = { inS: 4.8, outS: 1.0 }; // teléfono: segundos de la secuencia de entrada y de salida

    function prepSheet(S) {
      // números del dibujo desde la lista HTML (una sola fuente de texto)
      var list = sec.querySelector('.an-list[data-sheet="' + S.id + '"]');
      var box = document.createElement('div'); box.className = 'an-tagset'; box.dataset.sheet = S.id; tagsBox.appendChild(box);
      var g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'an-leads'); svg.appendChild(g);
      S.svgG = g; S.tagBox = box;
      Array.prototype.forEach.call(list.querySelectorAll('.an-row'), function (row, i) {
        var tag = document.createElement('div'); tag.className = 'an-tag'; tag.dataset.i = i;
        tag.innerHTML = '<span class="an-tag-n"></span>';
        tag.querySelector('.an-tag-n').textContent = row.querySelector('.an-row-n').textContent;
        tag.style.opacity = '0'; tag.style.visibility = 'hidden';
        box.appendChild(tag);
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('class', 'an-lead'); path.style.opacity = '0';
        var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); dot.setAttribute('class', 'an-dot'); dot.setAttribute('r', '2'); dot.style.opacity = '0';
        g.appendChild(path); g.appendChild(dot);
        S.tags.push({ el: tag, path: path, dot: dot, x: 0, y: 0, w: 0, h: 0, rv: 0, _o: -1 });
        bindHighlight(tag, S, i);
      });
      var cg = document.createElementNS('http://www.w3.org/2000/svg', 'g'); cg.setAttribute('class', 'an-cota');
      cg.innerHTML = '<path class="an-cota-l"/><path class="an-cota-a"/>';
      svg.appendChild(cg); S.cota = { g: cg, l: cg.children[0], a: cg.children[1] };
      S.root.rotation.order = 'XYZ';
      S.kfEnd = { yaw: kf(S.kf.yaw, 1), el: kf(S.kf.el, 1) };
      layoutSheet(S);
      box.style.display = 'none'; g.style.display = 'none'; cg.style.display = 'none'; S._shown = false;
      kick();
    }

    /* ---------- cámara: encuadre por lámina, mezcla en la transición ---------- */
    var _v = new T.Vector3(), _v2 = new T.Vector3(), _q = new T.Quaternion();
    function basisFor(el, B) {
      var e = el * D2R;
      B.D.set(0, Math.sin(e), Math.cos(e)); B.R.set(1, 0, 0); B.U.set(0, Math.cos(e), -Math.sin(e));
      return B;
    }
    function fitFor(S, ref, rect, B, out) {
      var xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity, dsum = 0, n = 0, R = B.R, U = B.U, Dv = B.D;
      S.fitEach(ref, function (x, y, z) {
        var px = x * R.x + y * R.y + z * R.z, py = x * U.x + y * U.y + z * U.z;
        if (px < xmin) xmin = px; if (px > xmax) xmax = px; if (py < ymin) ymin = py; if (py > ymax) ymax = py;
        dsum += x * Dv.x + y * Dv.y + z * Dv.z; n++;
      });
      out = out || {};
      out.s = Math.min(rect.w / (xmax - xmin), rect.h / (ymax - ymin)); out.W = xmax - xmin; out.H = ymax - ymin;
      out.xm = (xmin + xmax) / 2; out.ym = (ymin + ymax) / 2; out.dm = dsum / Math.max(1, n);
      return out;
    }
    var _fit = {}, _fitR = {}, _rc = {};
    function camFor(S, ref, out) {
      var B = basisFor(S.elC, S.B), rect = S.rect;
      var fr = fitFor(S, true, rect, B, _fitR), f, s;
      // al salir (se recoge y se borra) la cámara se queda quieta: las hojas bajan dentro del encuadre
      if (ref || S.uOut > 0) { f = fr; s = fr.s * Math.min(1, S.dolly); }
      else {
        // armado, el objeto ocupa el área entera del dibujo; al despiezarse la cámara se retira y deja sitio a los números
        var kh = 1 - smooth(win(S.Ee, 0, 0.2)), H = S.rectH;
        rect = _rc; rect.x = lerp(S.rect.x, H.x, kh); rect.y = lerp(S.rect.y, H.y, kh); rect.w = lerp(S.rect.w, H.w, kh); rect.h = lerp(S.rect.h, H.h, kh);
        f = fitFor(S, false, rect, B, _fit);
        s = Math.min(f.s, fr.s * lerp(COMPACT ? 1.25 : 1.42, S.heroK, kh)) * S.dolly;
      }
      var rcx = rect.x + rect.w / 2, rcy = rect.y + rect.h / 2;
      out.tg.set(0, 0, 0).addScaledVector(B.R, f.xm).addScaledVector(B.U, f.ym).addScaledVector(B.D, f.dm);
      out.tg.addScaledVector(B.R, -(rcx - VW / 2) / s).addScaledVector(B.U, (rcy - VH / 2) / s);
      out.dist = (VH / s) / (2 * Math.tan(FOV * D2R / 2)); out.el = S.elC;
      return out;
    }
    function setCam(cam, c) {
      var e = c.el * D2R;
      cam.fov = FOV; cam.aspect = VW / VH; cam.updateProjectionMatrix();
      cam.position.set(c.tg.x, c.tg.y + Math.sin(e) * c.dist, c.tg.z + Math.cos(e) * c.dist);
      cam.up.set(0, 1, 0); cam.lookAt(c.tg); cam.updateMatrixWorld();
    }
    var camA = { tg: new T.Vector3() }, camB = { tg: new T.Vector3() }, camM = { tg: new T.Vector3() }, camR = { tg: new T.Vector3() };
    function mixCam(a, b, w) {
      camM.el = lerp(a.el, b.el, w); camM.dist = Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), w)); camM.tg.copy(a.tg).lerp(b.tg, w);
      return camM;
    }

    /* desplazamiento vertical actual de la zona del dibujo (el sitio la sube con la cabecera retirada) */
    var drawEl = view.closest('.an-draw');
    function drawShift() {
      if (!drawEl || !window.DOMMatrixReadOnly) return 0;
      var tf = getComputedStyle(drawEl).transform;
      if (!tf || tf === 'none') return 0;
      try { return new DOMMatrixReadOnly(tf).m42 || 0; } catch (e) { return 0; }
    }
    /* ---------- disposición: columna de números junto al dibujo ---------- */
    function layoutSheet(S) {
      S.usePack(COMPACT ? 'c' : 'd');
      var tags = S.tags, prev = S.tagBox.style.display;
      S.tagBox.style.display = '';
      var cr = caj.getBoundingClientRect(), vr = view.getBoundingClientRect();
      // sitio: con la cabecera retirada el dibujo sube (practicas.css, translateY en .an-draw); el
      // cajetín no. Se mide contra la posición más baja del dibujo (cabecera puesta), la que más se le acerca.
      var ty = drawShift(), vTop = vr.top - ty, vBot = vr.bottom - ty;
      var cajTop = (cr.width && !COMPACT && cr.left < vr.right && cr.top < vBot) ? cr.top - vTop : VH;
      tags.forEach(function (t) { t.w = t.el.offsetWidth; t.h = t.el.offsetHeight; });
      S.tagBox.style.display = prev;
      var nw = tags.reduce(function (m, t) { return Math.max(m, t.w); }, 0);
      var gapL = COMPACT ? 30 : 72, padL = COMPACT ? 46 : 64, padR = COMPACT ? 12 : 24;
      var yTop = COMPACT ? 16 : 22, yBot = Math.min(VH - (COMPACT ? 16 : 24), cajTop - 18);
      var rect = { x: padL, y: yTop, w: Math.max(120, VW - padL - padR - nw - gapL), h: Math.max(140, yBot - yTop) };
      var fw = fitFor(S, true, rect, basisFor(S.kfEnd.el, S.B)), wpx = fw.W * fw.s;
      if (wpx < rect.w - 2) { var grp = wpx + gapL + nw; rect.x = Math.max(padL, Math.round((VW - grp) / 2)); rect.w = wpx; }
      S.col = { x: Math.round(rect.x + rect.w + gapL), yMin: 10, yMax: Math.min(VH - 10, cajTop - 14) };
      S.rect = rect;
      var hx = COMPACT ? 18 : padL, hr = COMPACT ? 18 : padR + 24;
      S.rectH = { x: hx, y: yTop + (COMPACT ? 8 : 26), w: Math.max(120, VW - hx - hr), h: Math.max(140, yBot - yTop - (COMPACT ? 16 : 52)) };
    }
    // ancla de cada número en la pose de referencia (despiece completo, giro de la coreografía, sin arrastre)
    var _anc = new T.Vector3();
    function refAnchor(S, k, out) {
      var an = S.anchors[k], p = an.p;
      if (an.pt) {
        var y = S.yawC * D2R, c = Math.cos(y), s = Math.sin(y), x = an.pt[0], z = an.pt[2];
        return out.set(x * c + z * s, an.pt[1] + p.shift, -x * s + z * c);
      }
      return out.set(an.r, p.yc + p.th / 2 + p.shift, 0);
    }
    function placeTags(S) {
      setCam(refCam, camFor(S, true, camR));
      var tags = S.tags, Cc = S.col, gapy = 6;
      var ys = tags.map(function (t, k) { refAnchor(S, k, _anc); _v2.copy(_anc).project(refCam); return (1 - _v2.y) * 0.5 * VH - t.h * 0.5; });
      var order = ys.map(function (y, k) { return k; }).sort(function (a, b) { return ys[a] - ys[b]; });
      var prev = -Infinity;
      order.forEach(function (k) { ys[k] = Math.max(ys[k], Cc.yMin, prev); prev = ys[k] + tags[k].h + gapy; });
      var next = Infinity;
      for (var oi = order.length - 1; oi >= 0; oi--) { var kk = order[oi]; ys[kk] = Math.min(ys[kk], Cc.yMax - tags[kk].h, next - tags[kk].h - gapy); next = ys[kk]; }
      tags.forEach(function (t, k) {
        var y = Math.round(ys[k] * 2) / 2;
        if (t.y !== y || t.x !== Cc.x) { t.x = Cc.x; t.y = y; t.el.style.transform = 'translate(' + t.x + 'px,' + y + 'px)'; }
      });
    }
    var _dirW = new T.Vector3(), _dirL = new T.Vector3();
    function anchorWorld(S, k, out) {
      var an = S.anchors[k], p = an.p;
      if (an.pt) return out.fromArray(an.pt).applyMatrix4(p.spin.matrixWorld);
      _dirW.set(1, 0, 0).applyQuaternion(camera.quaternion);
      p.group.getWorldQuaternion(_q); _dirL.copy(_dirW).applyQuaternion(_q.invert());
      _dirL.y = 0; _dirL.normalize(); out.set(_dirL.x * an.r, p.yc + p.th / 2, _dirL.z * an.r);
      return out.applyMatrix4(p.group.matrixWorld);
    }
    function toScreen(v) { _v2.copy(v).project(camera); return [(_v2.x + 1) * 0.5 * VW, (1 - _v2.y) * 0.5 * VH]; }
    function projectAnchor(S, k) { return toScreen(anchorWorld(S, k, _anc)); }

    var wasCompact = COMPACT;
    function layout() {
      COMPACT = mqCompact.matches;
      var r = view.getBoundingClientRect();
      VW = Math.max(1, Math.round(r.width)); VH = Math.max(1, Math.round(r.height));
      PR = Math.min(2, window.devicePixelRatio || 1);
      renderer.setPixelRatio(PR); renderer.setSize(VW, VH, false);
      RES.value.set(VW * PR, VH * PR);
      fatMats.forEach(function (m) { m.uniforms.width.value = m.userData.w * PR; });
      svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + VH);
      if (COMPACT !== wasCompact) { // cambia el modo: la lámina en curso queda completa, sin repetir la secuencia
        wasCompact = COMPACT; leaving = null; man.on = false; man.k = 0;
        Object.keys(sheets).forEach(function (k) { var S = sheets[k]; S.uIn = S === cur ? 1 : 0; S.uOut = 0; S.on = S === cur; });
        if (!COMPACT) pShown = pTarget = scrollProgress();
      }
      Object.keys(sheets).forEach(function (k) { layoutSheet(sheets[k]); sheets[k].tags.forEach(function (t) { t.x = -1; }); });
      kick();
    }

    /* ---------- resaltado: números y renglones ---------- */
    function bindHighlight(el, S, i) {
      listen(el, 'pointerenter', function (e) { if (e.pointerType === 'mouse' && cur === S) { hoverStage = i; touch(); kick(); } });
      listen(el, 'pointerleave', function (e) { if (e.pointerType === 'mouse' && hoverStage === i) { hoverStage = null; touch(); kick(); } });
      listen(el, 'click', function () { if (cur !== S) return; setPinned(pinned === i ? null : i); });
    }
    function setPinned(i) {
      pinned = i; touch();
      if (cur) $$('.an-list[data-sheet="' + cur.id + '"] .an-row').forEach(function (r, k) { r.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      kick();
    }
    $$('.an-row').forEach(function (row) {
      var sheetId = row.closest('.an-list').dataset.sheet, i = +row.dataset.i;
      listen(row, 'pointerenter', function (e) { if (e.pointerType === 'mouse' && cur && cur.id === sheetId) { hoverStage = i; touch(); kick(); } });
      listen(row, 'pointerleave', function (e) { if (e.pointerType === 'mouse' && hoverStage === i) { hoverStage = null; kick(); } });
      listen(row, 'focus', function () { if (cur && cur.id === sheetId) { hoverStage = i; touch(); kick(); } });
      listen(row, 'blur', function () { if (hoverStage === i) { hoverStage = null; kick(); } });
      listen(row, 'click', function () { if (cur && cur.id === sheetId) setPinned(pinned === i ? null : i); });
    });
    function touch() { lastInteract = performance.now(); if (drift.t < 0) drift.armed = true; }

    /* ---------- pestañas: navegan por el recorrido y reflejan dónde va ---------- */
    var tabs = $$('.an-tab'), modes = $$('.an-mode');
    tabs.forEach(function (b) { listen(b, 'click', function () { touch(); goSheet(b.dataset.sheet, false); }); });
    if ($('.an-tabs')) listen($('.an-tabs'), 'keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var i = tabs.indexOf(document.activeElement); if (i < 0) return;
      var j = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; tabs[j].focus(); e.preventDefault();
    });
    modes.forEach(function (b) {
      listen(b, 'click', function () {
        touch();
        if (!cur) return;
        if (man.k < 0.02) man.Ev = cur.Ee;
        man.on = true; man.E = +b.dataset.mode; man.at = pShown;
        if (RM) { man.Ev = man.E; man.k = 1; cutFade(); }
        kick();
      });
    });
    function syncModes(E) { var on = E >= 0.5 ? '1' : '0'; modes.forEach(function (b) { var p = b.dataset.mode === on ? 'true' : 'false'; if (b.getAttribute('aria-pressed') !== p) b.setAttribute('aria-pressed', p); }); }
    function cutFade() { view.classList.add('an-cut'); void view.offsetWidth; nextFrame(function () { nextFrame(function () { view.classList.remove('an-cut'); }); }); }

    // texto de la firma: sale la lámina anterior, entra la nueva (sin mover nada en modo Mario)
    var swapTok = 0;
    function showBlocks(id, quick, instant) {
      var tok = ++swapTok, d = quick ? 120 : 200, els = $$('.an-copy, .an-list, .an-key');
      var caja = function () {
        caj.querySelector('[data-caj="lam"]').textContent = LAM[id];
        caj.querySelector('[data-caj="title"]').textContent = sec.querySelector('.an-copy[data-sheet="' + id + '"] .an-h').textContent;
      };
      if (instant) { els.forEach(function (el) { el.classList.remove('an-out', 'an-pre'); el.hidden = el.dataset.sheet !== id; }); caja(); return; }
      els.forEach(function (el) { if (el.dataset.sheet !== id && !el.hidden) el.classList.add('an-out'); });
      later(function () {
        if (tok !== swapTok) return;
        els.forEach(function (el) {
          el.classList.remove('an-out');
          if (el.dataset.sheet !== id) { el.hidden = true; return; }
          if (el.hidden) { el.classList.add('an-pre'); el.hidden = false; void el.offsetWidth; el.classList.remove('an-pre'); }
        });
        caja();
      }, d);
    }
    function setCur(id, instant) {
      var to = getSheet(id); if (cur === to) return null;
      var from = cur; cur = to;
      hoverStage = null; setPinned(null);
      tabs.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.sheet === id ? 'true' : 'false'); });
      showBlocks(id, RM, instant || !from);
      sec.dataset.anSheet = id;
      return from;
    }
    function goSheet(id, instant) {
      if (!RM && !COMPACT) {
        var top = sec.getBoundingClientRect().top + window.pageYOffset, L = Math.max(0, sec.offsetHeight - window.innerHeight);
        var y = Math.round(top + (SOLO ? G1.done : id === 'orden' ? G.aDone : G.bDone) * L);
        if (instant) { stopAnim(); window.scrollTo({ top: y, behavior: 'instant' }); }
        else animScroll(y);
        return;
      }
      switchSheet(id);
    }
    // teléfono y modo Mario: cambio de lámina por tiempo (en Mario, solo un fundido)
    function switchSheet(id) {
      if (cur && cur.id === id) return;
      var to = getSheet(id), from = setCur(id);
      if (!from) return;
      if (RM) { leaving = from; rmT = 0; to.uIn = 1; to.uOut = 0; to.fade = 0; }
      else if (introStart < 0) { from.on = false; to.uIn = 0; to.uOut = 0; leaving = null; }
      else {
        if (leaving && leaving !== from) leaving.on = false;
        leaving = from; to.uIn = 0; to.uOut = 0; to.on = false;
      }
      kick();
    }
    // desplazamiento animado hasta la lámina pedida (la secuencia se recorre completa, a mayor velocidad)
    var anim = null;
    function animScroll(y) {
      stopAnim();
      var y0 = window.pageYOffset, dy = y - y0; if (Math.abs(dy) < 2) return;
      anim = { y0: y0, dy: dy, dur: clamp(Math.abs(dy) / 1.7, 800, 1700), t0: performance.now(), raf: 0 };
      var tick = function (now) {
        if (!anim) return;
        var x = clamp((now - anim.t0) / anim.dur);
        window.scrollTo({ top: Math.round(anim.y0 + anim.dy * inout(x)), behavior: 'instant' });
        if (x < 1) anim.raf = nextFrame(tick); else anim = null;
      };
      anim.raf = nextFrame(tick);
    }
    function stopAnim() { if (anim) { noFrame(anim.raf); anim = null; } }
    listen(window, 'wheel', function () { stopAnim(); }, { passive: true });
    listen(window, 'touchstart', function () { stopAnim(); }, { passive: true });
    listen(window, 'keydown', function (e) { if (/^(Arrow|Page|Home|End|Space)/.test(e.key) || e.key === ' ') stopAnim(); });
    // enlaces «Sus láminas» de otras secciones (data-an-ir): llegar a la lámina pedida, ya desplegada
    listen(document, 'click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('[data-an-ir]') : null;
      if (!a || sec.contains(a)) return;
      var id = a.getAttribute('data-an-ir'); if (id !== 'orden' && id !== 'solucion') return;
      if (SOLO && id !== SOLO) return;
      if (!RM && !COMPACT) goSheet(id, true); else if (!cur || cur.id !== id) switchSheet(id);
    });

    /* ---------- arrastrar para girar ---------- */
    var drag = null;
    listen(view, 'pointerdown', function (e) {
      if (e.target.closest('.an-tag') || e.button > 0) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
      view.setPointerCapture(e.pointerId); dragging = true; view.classList.add('is-drag'); touch(); kick();
    });
    listen(view, 'pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var now = performance.now(), dx = e.clientX - drag.x, dy = e.clientY - drag.y, dts = Math.max(8, now - drag.t) / 1000;
      var ky = 0.0065, kp = e.pointerType === 'mouse' ? 0.0045 : 0;
      userYaw += dx * ky; userPitch = clamp(userPitch + dy * kp, -0.5, 0.5);
      velYaw = lerp(velYaw, dx * ky / dts, 0.5); velPitch = lerp(velPitch, dy * kp / dts, 0.5);
      drag.x = e.clientX; drag.y = e.clientY; drag.t = now; touch(); kick();
    });
    function endDrag(e) { if (!drag || (e && e.pointerId !== drag.id)) return; drag = null; dragging = false; view.classList.remove('is-drag'); touch(); kick(); }
    listen(view, 'pointerup', endDrag); listen(view, 'pointercancel', endDrag); listen(view, 'lostpointercapture', endDrag);

    /* ---------- bucle ---------- */
    function kick() { if (!raf && visible && !document.hidden) { lastT = performance.now(); raf = nextFrame(frame); } }
    function frame(now) {
      raf = 0;
      if (sec.__anHold) return; // solo pruebas: cuadros dados a mano
      var dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000)); lastT = now;
      if (step(dt, now)) kick();
      else if (drift.armed && driftOK) { unlater(wakeT); wakeT = later(kick, 1700); } // despierta una vez para la deriva en reposo
    }
    var wakeT = 0, driftOK = false;
    function scrollProgress() {
      var r = sec.getBoundingClientRect(), total = r.height - window.innerHeight;
      return total <= 0 ? 0 : clamp(-r.top / total, (SOLO ? G1.a0 : G.a0) - 0.04, 1);
    }
    var tmpI = new T.Color();
    var perf = { js: 0, gl: 0, ov: 0, calls: 0 }, noRender = false;
    sec.__anPerf = perf;
    // solo para pruebas: adelanta la simulación sin dibujar cada paso, o da un paso de dt segundos
    sec.__anSettle = function (secs) { noRender = true; var now = performance.now(); for (var t = 0; t < (secs || 3); t += 0.05) step(0.05, now + t * 1000); noRender = false; step(0.016, now + (secs || 3) * 1000); };
    sec.__anStep = function (dt) { lastT = performance.now(); return step(dt || 1 / 60, lastT); };
    sec.__anState = function () { return { g: pShown, cur: cur && cur.id, A: sheets.orden && { u: sheets.orden.uIn, o: sheets.orden.uOut, D: sheets.orden.D, E: sheets.orden.Ee, lit: sheets.orden.lit }, B: sheets.solucion && { u: sheets.solucion.uIn, D: sheets.solucion.D, E: sheets.solucion.Ee, lit: sheets.solucion.lit }, raf: !!raf, drift: drift.t, driftOff: drift.off }; };

    function drive(dt) {
      var busy = false, A = sheets.orden, B = sheets.solucion;
      if (!RM && !COMPACT && SOLO) {
        var S1 = getSheet(SOLO), g1 = pShown;
        S1.uIn = win(g1, G1.a0, G1.a1); S1.uOut = 0; S1.on = g1 > G1.a0; S1.fade = 1;
        if (!cur) setCur(SOLO);
        mix.a = S1; mix.b = null; mix.w = 0;
        leaving = null;
      } else if (!RM && !COMPACT) {
        var g = pShown;
        if (!B && g > G.b0 - 0.1) B = getSheet('solucion');
        if (A) { A.uIn = win(g, G.a0, G.a1); A.uOut = win(g, G.a1, G.aOut); A.on = g > G.a0 && A.uOut < 1; A.fade = 1; }
        if (B) { B.uIn = win(g, G.b0, G.b1); B.uOut = 0; B.on = g > G.b0; B.fade = 1; }
        var want = (cur && cur.id === 'solucion') ? (g < G.swap - 0.006 ? 'orden' : 'solucion') : (g > G.swap + 0.006 ? 'solucion' : 'orden');
        if (!cur || want !== cur.id) setCur(want);
        mix.a = A; mix.b = B; mix.w = smooth(win(g, G.w0, G.w1));
        leaving = null;
      } else if (RM) {
        Object.keys(sheets).forEach(function (k) { var S = sheets[k]; S.uIn = 1; S.uOut = 0; if (S !== cur && S !== leaving) S.on = false; });
        if (leaving) {
          rmT += dt; busy = true;
          leaving.fade = 1 - clamp(rmT / 0.16); cur.fade = clamp((rmT - 0.16) / 0.22);
          leaving.on = rmT < 0.16; cur.on = rmT >= 0.16;
          if (rmT >= 0.38) { leaving.on = false; leaving.fade = 1; leaving = null; cur.fade = 1; }
        } else { cur.on = true; cur.fade = 1; }
        mix.a = leaving && leaving.on ? leaving : cur; mix.b = null; mix.w = 0;
      } else {
        if (leaving) {
          busy = true;
          leaving.uOut = Math.min(1, leaving.uOut + dt / PH.outS);
          if (leaving.uOut >= 0.6) { cur.on = true; cur.uIn = Math.min(1, cur.uIn + dt / PH.inS); }
          mix.a = leaving; mix.b = cur; mix.w = smooth(win(leaving.uOut, 0.3, 1));
          if (leaving.uOut >= 1) { leaving.on = false; leaving = null; }
        } else {
          if (introStart >= 0 && cur.uIn < 1) { cur.uIn = Math.min(1, cur.uIn + dt / PH.inS); busy = true; }
          cur.on = true; mix.a = cur; mix.b = null; mix.w = 0;
        }
        Object.keys(sheets).forEach(function (k) { var S = sheets[k]; S.fade = 1; if (S !== cur && S !== leaving) S.on = false; });
      }
      return busy;
    }
    function derive(S) {
      var tl = S.tl, u = RM ? 1 : S.uIn, uo = RM ? 0 : S.uOut, mk = S === cur ? man.k : 0;
      var D = win(u, tl.draw[0], tl.draw[1]) * (1 - win(uo, 0.42, 1));
      var Es = win(u, tl.exp[0], tl.exp[1]), R = win(uo, 0, 0.55), Ee = Es * (1 - R);
      S.D = lerp(D, 1, mk); S.R = R * (1 - mk); S.Ee = lerp(Ee, man.Ev, mk);
      S.pieces.forEach(function (p, k) { var w = S.wins[k]; p.t = lerp(win(Ee, w[0], w[1]), win(man.Ev, w[0], w[1]), mk); });
      // cada pieza que llega se enciende (su renglón y su número en lima) hasta que llega la siguiente
      S.lit = null;
      if (!RM && mk < 0.02 && uo <= 0 && Es > 0 && Es < 1) S.pieces.forEach(function (p) { if (p.stage >= 0 && p.t > 0.02 && (S.lit === null || p.stage > S.lit)) S.lit = p.stage; });
      S.yawC = uo > 0 ? kf(S.kfOut.yaw, uo) : kf(S.kf.yaw, u);
      S.elC = uo > 0 ? kf(S.kfOut.el, uo) : kf(S.kf.el, u);
      S.dolly = kf(S.kf.dolly, u);
    }
    var _e = new T.Euler();
    function pivotRot(p, a) {
      if (Math.abs(a - p._rot) < 1e-6) return; p._rot = a;
      var s = p.spin, P = p.pivot, q = p.pos0;
      _e.set(0, 0, 0); _e[p.rotAxis] = a; s.rotation.copy(_e);
      _v.set(q.x - P[0], q.y - P[1], q.z - P[2]).applyEuler(_e);
      s.position.set(P[0] + _v.x, P[1] + _v.y, P[2] + _v.z);
    }
    function poseSheet(S, dt, hl, isCur, userHl) {
      var kE = damp(14, dt), n = S.pieces.length, busy = false;
      S.root.rotation.set(userPitch, S.yawC * D2R + userYaw + drift.off, 0);
      S.pieces.forEach(function (p) {
        var on = isCur && hl !== null && hl === p.stage, dim = isCur && hl !== null && !on;
        p._ta = on ? 1.12 : dim ? (userHl ? 0.36 : 0.62) : 1; p._tl = on ? 1 : 0; p._tf = on ? 1 : 0;
        p._tn = (on && userHl && !RM && S.Ee > 0.98) ? 1 : 0;
        p.em.a += (p._ta - p.em.a) * kE; p.em.l += (p._tl - p.em.l) * kE; p.em.f += (p._tf - p.em.f) * kE; p.em.n += (p._tn - p.em.n) * kE;
        if (Math.abs(p.em.a - p._ta) > 2e-3 || Math.abs(p.em.l - p._tl) > 2e-3 || Math.abs(p.em.n - p._tn) > 2e-3) busy = true;
        p.off = (p.offFn ? p.offFn(p) : p.shift * p.lift(p.t)) + p.em.n * 0.22;
        p.group.position.set(0, p.off, 0);
        if (p.pivot) pivotRot(p, S.tilt(p));
      });
      if (S.ringObj) { var pf0 = S.pieces[n - 1]; S.ringObj.position.y = pf0.yc + pf0.off - 0.4; }
      if (S.prongs) { // las patas del broche crecen con el despiece: las hojas siguen ensartadas
        var p0 = S.pieces[0], pf = S.pieces[n - 1];
        var H = Math.max(0.05, (p0.off + p0.yc + p0.th / 2) - (pf.off + pf.yc + pf.th / 2 + 0.014) + 0.3);
        if (Math.abs(H - (S._H || 0)) > 1e-5) {
          S._H = H; S.prongs.scale.y = H;
          var hd = S.hid, A = S.hidGeo.attributes.iA.array, B = S.hidGeo.attributes.iB.array, O = S.hidGeo.attributes.iO.array, kk = 0, DASH = 0.075, GAP = 0.055, cap = A.length / 3;
          for (var u = 0; u < 2; u++) for (var y = hd.y0; y < hd.y0 + H - 0.02 && kk < cap; y += DASH + GAP) {
            var y2 = Math.min(y + DASH, hd.y0 + H);
            A[kk * 3] = hd.u[u]; A[kk * 3 + 1] = y; A[kk * 3 + 2] = hd.v; B[kk * 3] = hd.u[u]; B[kk * 3 + 1] = y2; B[kk * 3 + 2] = hd.v; O[kk] = clamp((y - hd.y0) / 7); kk++;
          }
          S.hidGeo.instanceCount = kk; S.hidGeo.attributes.iA.needsUpdate = true; S.hidGeo.attributes.iB.needsUpdate = true; S.hidGeo.attributes.iO.needsUpdate = true;
        }
      }
      return busy;
    }
    var _inv = new T.Matrix4(), _cl = new T.Vector3();
    function updateSil(S) {
      S.pieces.forEach(function (p) {
        p.tubes.forEach(function (Tb) {
          _inv.copy(Tb.obj.matrixWorld).invert(); _cl.copy(camera.position).applyMatrix4(_inv);
          var pts = Tb.pts, n = pts.length, A = Tb.geo.attributes.iA.array, B = Tb.geo.attributes.iB.array, O = Tb.geo.attributes.iO.array, k = 0;
          var off = [];
          for (var i = 0; i < n; i++) {
            var p0 = pts[Tb.closed ? (i - 1 + n) % n : Math.max(0, i - 1)], p1 = pts[Tb.closed ? (i + 1) % n : Math.min(n - 1, i + 1)], pc = pts[i];
            _v.set(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]).normalize();
            _v2.set(_cl.x - pc[0], _cl.y - pc[1], _cl.z - pc[2]).normalize();
            var ox = _v.y * _v2.z - _v.z * _v2.y, oy = _v.z * _v2.x - _v.x * _v2.z, oz = _v.x * _v2.y - _v.y * _v2.x, L2 = Math.hypot(ox, oy, oz) || 1;
            off.push([ox / L2 * Tb.r, oy / L2 * Tb.r, oz / L2 * Tb.r]);
          }
          var last = Tb.closed ? n : n - 1;
          for (var j = 0; j < last; j++) {
            var q0 = pts[j], q1 = pts[(j + 1) % n], o0 = off[j], o1 = off[(j + 1) % n];
            for (var sg = -1; sg <= 1; sg += 2) {
              A[k * 3] = q0[0] + o0[0] * sg; A[k * 3 + 1] = q0[1] + o0[1] * sg; A[k * 3 + 2] = q0[2] + o0[2] * sg;
              B[k * 3] = q1[0] + o1[0] * sg; B[k * 3 + 1] = q1[1] + o1[1] * sg; B[k * 3 + 2] = q1[2] + o1[2] * sg; O[k] = last > 1 ? j / (last - 1) : 0; k++;
            }
          }
          Tb.geo.instanceCount = k; Tb.geo.attributes.iA.needsUpdate = true; Tb.geo.attributes.iB.needsUpdate = true; Tb.geo.attributes.iO.needsUpdate = true;
        });
      });
    }
    // trazo de la lámina: construcción → contornos → aristas medias → detalle → caras (cada pieza con su retardo)
    function colorSheet(S) {
      var fade = S.fade, D = S.D;
      S.pieces.forEach(function (p, k) {
        var j = S.drawJ[k];
        tmpI.copy(C.ink).lerp(C.acc, clamp(p.em.l));
        ['main', 'mid', 'det'].forEach(function (w) {
          var kk = clamp(p.em.a * WALPHA[w] * fade + p.em.l * (w === 'det' ? 0.18 : 0.06) * fade);
          p.mat[w].uniforms.color.value.copy(C.bg).lerp(tmpI, kk);
        });
        p.mat.main.uniforms.draw.value = win(D, 0.1 + j, 0.44 + j);
        p.mat.mid.uniforms.draw.value = win(D, 0.16 + j, 0.5 + j);
        p.mat.det.uniforms.draw.value = win(D, 0.36 + j, 0.72 + j);
        var fo = smooth(win(D, 0.5 + j, 0.76 + j)) * clamp(fade * 1.6);
        p.faceMat.opacity = fo; p.faceMat.visible = fo > 0.003;
        p.fillMat.color.copy(C.acc); p.fillMat.opacity = 0.075 * p.em.f * fade * fo;
        var fv = p.fillMat.opacity > 0.002; p.fills.forEach(function (f) { f.visible = fv; });
      });
      var ka = win(D, 0, 0.32);
      S.auxMat.uniforms.draw.value = ka; S.auxStrong.uniforms.draw.value = ka;
      S.auxMat.uniforms.color.value.copy(C.bg).lerp(C.ink, 0.36 * fade);
      S.auxStrong.uniforms.color.value.copy(C.bg).lerp(C.ink, 0.62 * fade);
      if (S.hidMat) {
        var pf = S.pieces[S.pieces.length - 1];
        S.hidMat.uniforms.draw.value = pf.mat.mid.uniforms.draw.value;
        S.hidMat.uniforms.color.value.copy(C.bg).lerp(C.ink, 0.4 * fade * Math.min(1, pf.em.a));
      }
    }
    // cada número se dibuja cuando llega su pieza: punto, línea guía de la pieza al número y luego la caja del número
    function tagVis(S, dt) {
      var busy = false;
      S.tags.forEach(function (t, i) {
        var p = S.stageP[i];
        var tv = (S.on && S.D > 0.985 && p.t >= 0.55 && S.R < 0.02) ? 1 : 0;
        if (RM) t.rv = tv; else t.rv = clamp(t.rv + (tv ? dt / 0.62 : -dt / 0.28));
        if (t.rv !== tv) busy = true;
      });
      return busy;
    }

    function step(dt, now) {
      var tA = performance.now(), busy = false;
      var scrollMode = !RM && !COMPACT;
      if (scrollMode) {
        pTarget = scrollProgress();
        var dp = pTarget - pShown;
        if (Math.abs(dp) > 0.3 && !anim) { pShown = pTarget; cutFade(); }
        else { pShown += dp * damp(6, dt); if (Math.abs(dp) > 1e-4) busy = true; else pShown = pTarget; }
        if (Math.abs(dp) > 2e-3) { lastScrollT = now; if (drift.t < 0) drift.armed = true; }
        if (man.on && Math.abs(pShown - man.at) > 0.03) man.on = false;
      }
      if (drive(dt)) busy = true;
      var S = cur; if (!S) return false;
      // botones Ensamblado / Despiece
      var mt = man.on ? 1 : 0; man.k += (mt - man.k) * damp(RM ? 60 : 7, dt);
      if (Math.abs(mt - man.k) < 1e-3) man.k = mt; else busy = true;
      if (man.on && man.Ev !== man.E) { man.Ev += clamp(man.E - man.Ev, -0.8 * dt, 0.8 * dt); busy = true; }
      var list = Object.keys(sheets).map(function (k) { return sheets[k]; });
      list.forEach(derive);
      syncModes(S.Ee);
      // pieza resaltada: la del cursor o el dedo manda; si no, la que acaba de llegar
      var userHl = hoverStage !== null || pinned !== null;
      var hl = hoverStage !== null ? hoverStage : pinned !== null ? pinned : S.lit;
      $$('.an-list[data-sheet="' + S.id + '"] .an-row').forEach(function (r, k) { var on = k === hl; if (r.classList.contains('is-on') !== on) r.classList.toggle('is-on', on); });
      // vida en reposo: una deriva muy lenta del giro cuando el scroll se detiene; para sola o al interactuar
      var settled = scrollMode ? Math.abs(pTarget - pShown) < 1e-3 : (!leaving && introStart >= 0 && S.uIn >= 1);
      driftOK = !RM && settled && !dragging && !userHl && S.on && S.D >= 1 && !anim;
      var quiet = driftOK && now - lastInteract > 1600 && now - lastScrollT > 1600;
      if (quiet && drift.armed && drift.t < 0) { drift.t = 0; drift.armed = false; }
      if (drift.t >= 0) {
        drift.t += dt; var dOn = quiet && drift.t < DRIFT_DUR;
        drift.amp += ((dOn ? 1 : 0) - drift.amp) * damp(dOn ? 1.1 : 2.6, dt);
        drift.off -= DRIFT_V * drift.amp * dt; busy = true;
        if (!dOn && drift.amp < 0.01) { drift.t = -1; drift.amp = 0; }
      }
      if (scrollMode && now - lastScrollT < 250 && !dragging) { // el scroll vuelve a mandar: se deshace lo girado a mano
        var kd = Math.exp(-2.4 * dt); drift.off *= kd; userYaw *= kd; userPitch *= kd;
        if (Math.abs(drift.off) + Math.abs(userYaw) + Math.abs(userPitch) > 1e-4) busy = true;
      }
      if (!dragging) {
        if (Math.abs(velYaw) > 1e-3 || Math.abs(velPitch) > 1e-3) { userYaw += velYaw * dt; userPitch = clamp(userPitch + velPitch * dt, -0.5, 0.5); velYaw *= Math.exp(-3.2 * dt); velPitch *= Math.exp(-3.2 * dt); busy = true; }
        else { velYaw = 0; velPitch = 0; }
      }
      var vis = [];
      list.forEach(function (Sh) { if (poseSheet(Sh, dt, Sh === S ? hl : null, Sh === S, userHl)) busy = true; Sh.base.visible = Sh.on; if (Sh.on) vis.push(Sh); });
      // cámara: la de la lámina en curso, mezclada con la otra durante la transformación
      var ca = mix.a ? camFor(mix.a, false, camA) : null, cb = (mix.b && mix.w > 0) ? camFor(mix.b, false, camB) : null;
      var cam = ca && cb ? mixCam(ca, cb, mix.w) : (ca || cb);
      if (cam) setCam(camera, cam);
      scene.updateMatrixWorld(true);
      vis.forEach(function (Sh) { updateSil(Sh); colorSheet(Sh); });
      list.forEach(function (Sh) { if (tagVis(Sh, dt)) busy = true; });
      var tB = performance.now();
      if (noRender) return busy;
      renderer.render(scene, camera);
      var tC = performance.now();
      overlay(vis);
      var tD = performance.now();
      perf.js = perf.js * 0.9 + (tB - tA) * 0.1; perf.gl = perf.gl * 0.9 + (tC - tB) * 0.1; perf.ov = perf.ov * 0.9 + (tD - tC) * 0.1; perf.calls = renderer.info.render.calls;
      return busy;
    }

    /* ---------- capa SVG: guías, puntos y cotas ---------- */
    function overlay(vis) {
      Object.keys(sheets).forEach(function (k) {
        var Sh = sheets[k], show = vis.indexOf(Sh) >= 0;
        if (Sh._shown !== show) { Sh._shown = show; Sh.tagBox.style.display = show ? '' : 'none'; Sh.svgG.style.display = show ? '' : 'none'; Sh.cota.g.style.display = show ? '' : 'none'; }
      });
      vis.forEach(function (S) {
        placeTags(S);
        var isCur = S === cur, active = null;
        if (isCur) { var rowsOn = sec.querySelector('.an-list[data-sheet="' + S.id + '"] .an-row.is-on'); active = rowsOn ? +rowsOn.dataset.i : null; }
        S.tags.forEach(function (t, k) {
          var rv = t.rv * S.fade, on = active === k, dim = active !== null && !on;
          if (t.el.classList.contains('is-on') !== on) t.el.classList.toggle('is-on', on);
          if (rv < 0.002) {
            if (t._o !== 0) { t._o = 0; t.el.style.opacity = '0'; t.el.style.visibility = 'hidden'; t.path.style.opacity = '0'; t.dot.style.opacity = '0'; }
            return;
          }
          if (t._o === 0 || t._o === -1) t.el.style.visibility = '';
          t._o = 1;
          var A = projectAnchor(S, k), cy = t.y + t.h / 2, x0 = t.x - 8, room = x0 - A[0];
          var ex = A[0] + Math.max(10, Math.min(46, room * 0.32));
          if (room < 12) ex = x0;
          var d = 'M' + A[0].toFixed(1) + ' ' + A[1].toFixed(1) + 'L' + ex.toFixed(1) + ' ' + cy.toFixed(1) + 'H' + x0.toFixed(1);
          var L = Math.hypot(ex - A[0], cy - A[1]) + Math.abs(x0 - ex);
          var fl = eout(win(rv, 0.06, 0.62)), ft = win(rv, 0.5, 1), fd = win(rv, 0, 0.14), dk = (dim ? 0.78 : 1) * S.fade;
          t.path.setAttribute('d', d);
          t.path.style.strokeDasharray = fl >= 1 ? '' : (L * fl).toFixed(1) + ' ' + (L + 4).toFixed(1);
          t.path.style.opacity = (fl > 0 ? dk * (on ? 1 : 0.7) : 0).toFixed(3);
          t.dot.setAttribute('cx', A[0].toFixed(1)); t.dot.setAttribute('cy', A[1].toFixed(1));
          t.dot.style.opacity = (fd * dk).toFixed(3);
          t.el.style.opacity = (dk * smooth(win(rv, 0.45, 0.72))).toFixed(3);
          t.el.style.clipPath = ft >= 1 ? '' : 'inset(0 ' + ((1 - eout(ft)) * 100).toFixed(1) + '% 0 0)';
        });
        cota(S);
      });
    }
    var _c1 = new T.Vector3(), _c2 = new T.Vector3(), _c3 = new T.Vector3(), _c4 = new T.Vector3(), _od = new T.Vector3();
    function cota(S) {
      // cota vertical sin número, a la izquierda: del pie al punto más alto de la lámina; se traza con la construcción
      var c = S.cota, P1, P2, Q1, Q2, yy = S.cotaY(), yB = yy[0], yT = yy[1];
      var left = _od.set(-1, 0, 0).applyQuaternion(camera.quaternion); left.y = 0; left.normalize();
      var yawNow = S.root.rotation.y, ext = -Infinity, cx = 0, cz = 0, cs = Math.cos(yawNow), sn = Math.sin(yawNow);
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (sg) { var x = sg[0] * S.foot[0] / 2, z = sg[1] * S.foot[1] / 2; var wx = x * cs + z * sn, wz = -x * sn + z * cs, e = wx * left.x + wz * left.z; if (e > ext) { ext = e; cx = wx; cz = wz; } });
      _c1.set(cx + left.x * 0.62, yT, cz + left.z * 0.62); _c2.set(cx + left.x * 0.62, yB, cz + left.z * 0.62);
      _c3.set(cx + left.x * 0.1, yT, cz + left.z * 0.1); _c4.set(cx + left.x * 0.1, yB, cz + left.z * 0.1);
      P1 = toScreen(_c1); P2 = toScreen(_c2); Q1 = toScreen(_c3); Q2 = toScreen(_c4);
      var fdr = eout(win(S.D, 0.12, 0.5));
      var dx = P2[0] - P1[0], dy = P2[1] - P1[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      var Pm = [P1[0] + dx * fdr, P1[1] + dy * fdr];
      var ex1x = P1[0] - Q1[0], ex1y = P1[1] - Q1[1], el1 = Math.hypot(ex1x, ex1y) || 1;
      var ex2x = P2[0] - Q2[0], ex2y = P2[1] - Q2[1], el2 = Math.hypot(ex2x, ex2y) || 1;
      var f = function (v) { return v.toFixed(1); };
      var lp = 'M' + f(Q1[0]) + ' ' + f(Q1[1]) + 'L' + f(P1[0] + ex1x / el1 * 7) + ' ' + f(P1[1] + ex1y / el1 * 7) +
        (fdr > 0.97 ? 'M' + f(Q2[0]) + ' ' + f(Q2[1]) + 'L' + f(P2[0] + ex2x / el2 * 7) + ' ' + f(P2[1] + ex2y / el2 * 7) : '') +
        'M' + f(P1[0]) + ' ' + f(P1[1]) + 'L' + f(Pm[0]) + ' ' + f(Pm[1]);
      var al = 8, aw = 2.1, nx = -uy, ny = ux;
      var ap = 'M' + f(P1[0]) + ' ' + f(P1[1]) + 'L' + f(P1[0] + ux * al + nx * aw) + ' ' + f(P1[1] + uy * al + ny * aw) + 'L' + f(P1[0] + ux * al - nx * aw) + ' ' + f(P1[1] + uy * al - ny * aw) + 'Z' +
        (fdr > 0.97 ? 'M' + f(P2[0]) + ' ' + f(P2[1]) + 'L' + f(P2[0] - ux * al + nx * aw) + ' ' + f(P2[1] - uy * al + ny * aw) + 'L' + f(P2[0] - ux * al - nx * aw) + ' ' + f(P2[1] - uy * al - ny * aw) + 'Z' : '');
      c.l.setAttribute('d', lp); c.a.setAttribute('d', ap);
      c.g.style.opacity = String(S.fade * (L > 30 && fdr > 0.01 ? 1 : 0));
    }

    /* ---------- visibilidad, scroll, tamaño, modo Mario, paleta ---------- */
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { visible = e.isIntersecting; });
      if (visible) kick();
    }, { rootMargin: '120px 0px' });
    io.observe(sec); OBS.push(io);
    // teléfono: la secuencia corre una vez cuando el dibujo entra
    var ioIntro = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting && introStart < 0) { introStart = performance.now(); kick(); } });
    }, { threshold: 0.35 });
    ioIntro.observe(view); OBS.push(ioIntro);
    var inSec = false; // ¿el centro de la ventana cae dentro de la sección? (para conservar el lugar al cambiar de modo)
    function onScroll() { var r = sec.getBoundingClientRect(), m = window.innerHeight / 2; inSec = r.top < m && r.bottom > m; kick(); }
    listen(window, 'scroll', onScroll, { passive: true }); onScroll();
    listen(document, 'visibilitychange', function () { if (!document.hidden) kick(); });
    var rzT = 0;
    listen(window, 'resize', function () { unlater(rzT); rzT = later(layout, 60); });
    if (window.ResizeObserver) { var rob = new ResizeObserver(function () { unlater(rzT); rzT = later(layout, 30); }); rob.observe(view); OBS.push(rob); }
    function setRM(on) {
      var keep = inSec && !COMPACT;
      RM = !!on; man.on = false; man.k = 0; hoverStage = null; userPitch = 0; drift.t = -1; drift.amp = 0;
      if (leaving) { leaving.on = false; leaving.fade = 1; leaving = null; }
      if (!RM && COMPACT && cur) { cur.uIn = 1; cur.uOut = 0; }
      nextFrame(function () {
        // la altura de la sección cambia (recorrido largo ↔ una pantalla): quien la estaba viendo sigue viendo su lámina, completa
        if (keep) {
          var top = sec.getBoundingClientRect().top + window.pageYOffset, L = Math.max(0, sec.offsetHeight - window.innerHeight);
          var g = SOLO ? G1.done : cur && cur.id === 'solucion' ? G.bDone : G.aDone;
          var y = RM ? top : top + g * L;
          if (!RM) pShown = pTarget = g;
          window.scrollTo({ top: Math.round(y), behavior: 'instant' });
        }
        layout(); kick();
      });
    }
    listen(window, 'rmchange', function (e) { setRM(e && e.detail ? e.detail.rm : HTML.classList.contains('rm')); });
    var mob = new MutationObserver(function () { var on = HTML.classList.contains('rm'); if (on !== RM) setRM(on); });
    mob.observe(HTML, { attributes: true, attributeFilter: ['class'] }); OBS.push(mob);
    listen(window, 'paletachange', function () { readPalette(); faceMats.forEach(function (m) { m.color.copy(C.bg); }); kick(); });
    if (mqCompact.addEventListener) listen(mqCompact, 'change', layout);
    else { mqCompact.addListener(layout); CLEAN.push(function () { mqCompact.removeListener(layout); }); }

    /* ---------- arranque ---------- */
    pShown = pTarget = scrollProgress();
    var firstId = SOLO || ((!RM && !COMPACT) ? (pShown > G.swap ? 'solucion' : 'orden') : (sec.dataset.anSheet === 'solucion' ? 'solucion' : 'orden'));
    getSheet(firstId);
    if (!SOLO && !RM && !COMPACT && pShown > G.b0 - 0.1) getSheet('orden');
    setCur(firstId, true);
    cur.on = true;
    layout();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!DEAD) layout(); });
    // prepara la otra lámina cuando el navegador esté libre
    var idle = function (f) { if (window.requestIdleCallback) { var h = window.requestIdleCallback(function () { if (!DEAD) f(); }); CLEAN.push(function () { window.cancelIdleCallback(h); }); } else later(f, 1200); };
    if (!SOLO) idle(function () { getSheet(firstId === 'orden' ? 'solucion' : 'orden'); kick(); });
  }
  return cleanup;
}
