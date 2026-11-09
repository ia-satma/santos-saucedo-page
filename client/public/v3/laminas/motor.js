/* Plano: motor de las figuras isométricas de línea de las láminas de Santos & Saucedo.
   Aplica a mano las diez reglas de hairline (licencia MIT, Lucas Marques):
   01 el cursor se compara con la pose de reposo, nunca con lo que se mueve (zonas fijas);
   02 el movimiento se escalona por distancia a la pieza activa (45 ms por paso);
   03 todo tiene tope: nada sale del cuadro;
   04 el único resalte es el trazo: tenue → claro → lima, y una sola pieza en lima a la vez;
   05 el reposo es una composición y lleva una marca lima donde empieza la lectura;
   06 los sólidos son opacos y se pintan de atrás hacia adelante;
   07 un solo ciclo de animación, dormido fuera de pantalla o con la pestaña oculta;
   08 cambio de pieza con curva de 700 ms; seguimiento del cursor con resorte;
   09 esquinas redondas y poco trazo: silueta clara más un pliegue tenue, sin aristas verticales;
   10 sin palabras, números ni flechas dentro de la figura.
   Uso: Plano.figura({ id, total, caja, zonas, dibujar, recorrido, ... }) dentro de un <canvas id="c">. */
(function () {
  "use strict";
  const C30 = Math.cos(Math.PI / 6);
  const RGB = {
    fondo: [12, 35, 64], claro: [243, 241, 234], lima: [178, 235, 62], agua: [96, 150, 204],
  };
  const reducido = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* curva de 700 ms: cubic-bezier(.16, 1, .3, 1), la del sitio */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) { const e = sx(t) - x; const d = dx(t); if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break; t -= e / d; }
      return sy(Math.min(1, Math.max(0, t)));
    };
  }
  const curva = bezier(0.16, 1, 0.3, 1);
  const suave = bezier(0.45, 0, 0.25, 1);
  const lim = (v, a, b) => Math.max(a, Math.min(b, v));
  const mezcla = (a, b, t) => a + (b - a) * t;

  /* tinta del trazo: a = de tenue (0) a claro (1); l = hacia lima (0–1); o = opacidad extra */
  function tinta(a, l, o) {
    a = lim(a || 0, 0, 1); l = lim(l || 0, 0, 1); o = o == null ? 1 : o;
    const al = mezcla(0.30, 1, a);
    const r = mezcla(RGB.claro[0], RGB.lima[0], l), g = mezcla(RGB.claro[1], RGB.lima[1], l), b = mezcla(RGB.claro[2], RGB.lima[2], l);
    return `rgba(${r | 0},${g | 0},${b | 0},${(mezcla(al, 1, l) * o).toFixed(3)})`;
  }
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  /* resorte para seguir al cursor (regla 08) */
  function resorte(v0) {
    return { x: v0, v: 0, meta: v0, paso(dt, k, z) {
      if (reducido) { this.x = this.meta; this.v = 0; return this.x; }
      k = k || 170; z = z || 26;
      const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n;
      for (let i = 0; i < n; i++) { const f = -k * (this.x - this.meta) - z * this.v; this.v += f * h; this.x += this.v * h; }
      return this.x;
    } };
  }
  /* tránsito de 700 ms con la curva del sitio */
  function transito(v0) {
    return { de: v0, a: v0, t0: 0, dur: 700, v: v0, ir(a, ahora, dur) { this.de = this.v; this.a = a; this.t0 = ahora; this.dur = reducido ? 0 : (dur == null ? 700 : dur); },
      paso(ahora, f) { const t = this.dur ? lim((ahora - this.t0) / this.dur, 0, 1) : 1; this.v = mezcla(this.de, this.a, (f || curva)(t)); return this.v; },
      listo(ahora) { return !this.dur || ahora - this.t0 >= this.dur; } };
  }

  function puntoEn(p, poly) {
    let dentro = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) dentro = !dentro;
    }
    return dentro;
  }

  function figura(F) {
    const cv = document.getElementById("c");
    const ctx = cv.getContext("2d");
    const total = F.total;
    let W = 0, H = 0, dpr = 1, esc = 1, ox = 0, oy = 0;
    let zonas = [];
    const est = {
      activa: -1, previa: -1, cambio: transito(1), foco: [], ahora: 0, t: 0, puntero: null, tocado: false,
      reducido, total,
    };
    for (let i = 0; i < total; i++) est.foco.push(transito(0));

    /* proyección isométrica: x hacia abajo a la derecha, y hacia abajo a la izquierda, z hacia arriba */
    const P = (x, y, z) => [ox + (x - y) * C30 * esc, oy + ((x + y) * 0.5 - (z || 0)) * esc];

    function encuadre() {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(2.5, window.devicePixelRatio || 1);
      W = Math.max(10, r.width); H = Math.max(10, r.height);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      // límites de la figura proyectados a escala 1
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      F.caja.forEach(([x, y, z]) => { const sx = (x - y) * C30, sy = (x + y) * 0.5 - z; x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy); });
      const m = F.margen == null ? 0.07 : F.margen;
      esc = Math.min((W * (1 - 2 * m)) / (x1 - x0), (H * (1 - 2 * m)) / (y1 - y0));
      ox = W / 2 - ((x0 + x1) / 2) * esc; oy = H / 2 - ((y0 + y1) / 2) * esc;
      zonas = F.zonas ? F.zonas(g) : [];
      // cambiar el tamaño borra el lienzo: se vuelve a pintar aunque esté fuera de pantalla
      if (!pedido) { pedido = true; requestAnimationFrame(cuadro); }
    }

    /* ---------- dibujo ---------- */
    function trazo(t, w) { ctx.strokeStyle = t; ctx.lineWidth = (w || 1.25); ctx.lineJoin = "round"; ctx.lineCap = "round"; }
    function camino(pts, cerrar, r) {
      ctx.beginPath();
      if (!r || pts.length < 3) {
        pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        if (cerrar) ctx.closePath();
        return;
      }
      const n = pts.length;
      const medio = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (cerrar) {
        const ini = medio(pts[n - 1], pts[0]);
        ctx.moveTo(ini[0], ini[1]);
        for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; ctx.arcTo(p[0], p[1], q[0], q[1], r); }
        ctx.closePath();
      } else {
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < n - 1; i++) ctx.arcTo(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], r);
        ctx.lineTo(pts[n - 1][0], pts[n - 1][1]);
      }
    }
    const g = {
      P, ctx, tinta, rgba, RGB, lim, mezcla, curva, suave, resorte, transito, est,
      get esc() { return esc; }, get W() { return W; }, get H() { return H; },
      /* polígono 3D: relleno opaco (por omisión, el fondo) y trazo */
      poly(pts3, o) {
        o = o || {};
        const pts = pts3.map((p) => P(p[0], p[1], p[2]));
        camino(pts, true, o.r == null ? 2.5 : o.r);
        if (o.relleno !== false) { ctx.fillStyle = o.relleno || rgba(RGB.fondo, 1); ctx.fill(); }
        if (o.trazo !== false) { trazo(o.trazo || tinta(o.a, o.l), o.w); ctx.stroke(); }
        return pts;
      },
      linea(pts3, o) {
        o = o || {};
        const pts = pts3.map((p) => P(p[0], p[1], p[2]));
        camino(pts, false, o.r || 0);
        trazo(o.trazo || tinta(o.a, o.l, o.o), o.w);
        if (o.guiones) ctx.setLineDash(o.guiones.map((d) => d * esc));
        ctx.stroke(); ctx.setLineDash([]);
      },
      /* caja sólida: silueta clara + dos pliegues tenues de la tapa (sin arista vertical frontal) */
      caja(x, y, z, w, d, h, o) {
        o = o || {};
        const x1 = x + w, y1 = y + d, z1 = z + h;
        const sil = [[x, y, z1], [x1, y, z1], [x1, y, z], [x1, y1, z], [x, y1, z], [x, y1, z1]].map((p) => P(...p));
        camino(sil, true, o.r == null ? 3 : o.r);
        ctx.fillStyle = o.relleno || rgba(RGB.fondo, 1); ctx.fill();
        trazo(o.trazo || tinta(o.a, o.l), o.w); ctx.stroke();
        if (o.pliegue !== false) {
          const c = P(x1, y1, z1);
          camino([P(x1, y, z1), c, P(x, y1, z1)], false, 0);
          trazo(o.trazoPliegue || tinta(mezcla(0, o.a || 0, 0.5), (o.l || 0) * 0.6, 0.8), o.w); ctx.stroke();
        }
        return sil;
      },
      /* círculo en un plano horizontal, como polilínea */
      anillo(cx, cy, z, r, o) {
        o = o || {};
        const n = o.n || 48, pts = [];
        const a0 = o.desde || 0, a1 = o.hasta == null ? Math.PI * 2 : o.hasta;
        for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; pts.push(P(cx + r * Math.cos(a), cy + r * Math.sin(a), z)); }
        camino(pts, o.hasta == null, 0);
        if (o.relleno) { ctx.fillStyle = o.relleno; ctx.fill(); }
        if (o.trazo !== false) { trazo(o.trazo || tinta(o.a, o.l, o.o), o.w); ctx.stroke(); }
        return pts;
      },
      /* cilindro vertical opaco: silueta (tapa completa, costados y arco frontal de la base) */
      cilindro(cx, cy, z, r, h, o) {
        o = o || {};
        const n = 64, top = [], bot = [];
        for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; top.push(P(cx + r * Math.cos(a), cy + r * Math.sin(a), z + h)); bot.push(P(cx + r * Math.cos(a), cy + r * Math.sin(a), z)); }
        // tangentes: extremos izquierdo y derecho en pantalla (para un círculo horizontal están en a = 3π/4 y 7π/4)
        const iz = Math.round(n * 0.375), de = Math.round(n * 0.875);
        const frente = []; for (let i = de; i !== iz; i = (i + 1) % n) frente.push(bot[i]); frente.push(bot[iz]);
        const sil = [top[de]].concat(frente.slice(0)).concat([top[iz]]);
        // silueta: costado derecho, arco frontal de la base, costado izquierdo y arco trasero de la tapa
        ctx.beginPath();
        ctx.moveTo(top[de][0], top[de][1]);
        frente.forEach((p) => ctx.lineTo(p[0], p[1]));
        ctx.lineTo(top[iz][0], top[iz][1]);
        for (let i = iz; i !== de; i = (i + 1) % n) ctx.lineTo(top[i][0], top[i][1]);
        ctx.closePath();
        ctx.fillStyle = o.relleno || rgba(RGB.fondo, 1); ctx.fill();
        trazo(o.trazo || tinta(o.a, o.l), o.w); ctx.stroke();
        // arco frontal de la tapa: el pliegue
        ctx.beginPath(); for (let i = de, k = 0; k <= n / 2; i = (i + 1) % n, k++) (k ? ctx.lineTo(top[i][0], top[i][1]) : ctx.moveTo(top[i][0], top[i][1]));
        trazo(o.trazoPliegue || tinta(mezcla(0, o.a || 0, 0.5), (o.l || 0) * 0.6, 0.85), o.w); ctx.stroke();
        return sil;
      },
      punto(x, y, z, r, o) {
        o = o || {};
        const p = P(x, y, z);
        ctx.beginPath(); ctx.arc(p[0], p[1], r * (o.px ? 1 : esc), 0, Math.PI * 2);
        if (o.relleno !== false) { ctx.fillStyle = o.relleno || rgba(RGB.fondo, 1); ctx.fill(); }
        if (o.trazo !== false) { trazo(o.trazo || tinta(o.a, o.l), o.w); ctx.stroke(); }
      },
      /* proyecta y devuelve el polígono en pantalla (para zonas de reposo) */
      zona(pts3) { return pts3.map((p) => P(p[0], p[1], p[2])); },
      /* foco escalonado: valor 0–1 de cada pieza (regla 02) */
      foco(i) { return est.foco[i] ? est.foco[i].v : 0; },
    };

    /* ---------- selección ---------- */
    function avisar() {
      try { if (window.parent !== window) window.parent.postMessage({ lamina: F.id, activa: est.activa, total }, "*"); } catch (e) {}
    }
    function elegir(i, origen) {
      i = i == null ? -1 : lim(i | 0, -1, total - 1);
      if (i === est.activa) return;
      est.previa = est.activa; est.activa = i;
      const ahora = performance.now();
      est.cambio = transito(0); est.cambio.ir(1, ahora);
      est.foco.forEach((f, k) => {
        const d = i < 0 ? 0 : Math.abs(k - i);
        f.ir(k === i ? 1 : 0, ahora + (reducido ? 0 : d * 45), F.durFoco);
        f.t0 = ahora + (reducido ? 0 : d * 45);
      });
      if (F.alElegir) F.alElegir(i, est.previa, ahora, origen);
      if (origen !== "fuera") avisar();
      pedir();
    }
    est.elegir = elegir;

    /* zonas fijas de reposo (regla 01) */
    function zonaEn(p) {
      // cada zona es un polígono (su índice es la pieza) o { poly, i } cuando una pieza tiene varias
      for (let k = zonas.length - 1; k >= 0; k--) {
        const z = zonas[k]; if (!z) continue;
        if (Array.isArray(z)) { if (puntoEn(p, z)) return k; }
        else if (puntoEn(p, z.poly)) return z.i;
      }
      return -1;
    }
    const local = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    let arrastrando = false;
    function fin() { recorridoAlto(); est.tocado = true; }
    cv.addEventListener("pointermove", (e) => {
      const p = local(e); est.puntero = p;
      if (F.mover) { F.mover(p, arrastrando, e); pedir(); }
      if (e.pointerType === "mouse" || arrastrando) { const z = zonaEn(p); if (z >= 0) { fin(); elegir(z, "cursor"); } }
      pedir();
    });
    cv.addEventListener("pointerdown", (e) => {
      const p = local(e); arrastrando = true; fin();
      try { cv.setPointerCapture(e.pointerId); } catch (er) {}
      if (F.presionar && F.presionar(p, e) === true) { pedir(); return; }
      const z = zonaEn(p); if (z >= 0) elegir(z, "cursor");
      pedir();
    });
    const soltar = (e) => { arrastrando = false; if (F.soltar) F.soltar(e); pedir(); };
    cv.addEventListener("pointerup", soltar);
    cv.addEventListener("pointercancel", soltar);
    cv.addEventListener("pointerleave", () => { est.puntero = null; if (F.salir) F.salir(); pedir(); });
    cv.addEventListener("keydown", (e) => {
      const k = e.key;
      if (k === "ArrowRight" || k === "ArrowDown") { fin(); elegir(est.activa < 0 ? 0 : (est.activa + 1) % total, "teclado"); e.preventDefault(); }
      else if (k === "ArrowLeft" || k === "ArrowUp") { fin(); elegir(est.activa <= 0 ? total - 1 : est.activa - 1, "teclado"); e.preventDefault(); }
      else if (k === "Home") { fin(); elegir(0, "teclado"); e.preventDefault(); }
      else if (k === "End") { fin(); elegir(total - 1, "teclado"); e.preventDefault(); }
    });
    window.addEventListener("message", (e) => {
      const d = e.data;
      if (!d || d.lamina !== F.id || typeof d.ir !== "number") return;
      fin(); elegir(d.ir, "fuera");
    });

    /* recorrido automático una vez, al entrar en pantalla, hasta que el visitante toque algo */
    let rec = null;
    function recorridoAlto() { if (rec) { rec.alto = true; rec = null; } }
    function recorrido() {
      if (reducido || !F.recorrido || est.tocado) return;
      rec = { paradas: F.recorrido.slice(), k: 0, t: performance.now() + 500, alto: false };
    }
    function pasoRecorrido(ahora) {
      if (!rec || rec.alto || ahora < rec.t) return;
      if (rec.k >= rec.paradas.length) { rec = null; return; }
      elegir(rec.paradas[rec.k], "recorrido"); rec.k++; rec.t = ahora + (F.pausa || 1900);
    }

    /* ---------- ciclo único, dormido fuera de pantalla (regla 07) ---------- */
    let visible = true, pedido = false, ultimo = 0, quieto = 0;
    function pedir() { if (!pedido && visible && !document.hidden) { pedido = true; requestAnimationFrame(cuadro); } }
    function cuadro(ahora) {
      pedido = false;
      const dt = ultimo ? Math.min(0.05, (ahora - ultimo) / 1000) : 1 / 60; ultimo = ahora;
      est.ahora = ahora; est.t += dt;
      est.cambio.paso(ahora);
      est.foco.forEach((f) => f.paso(ahora));
      pasoRecorrido(ahora);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const sigue = F.dibujar(g, est, dt, ahora);
      const enMovimiento = sigue || !est.cambio.listo(ahora) || est.foco.some((f) => !f.listo(ahora)) || rec;
      // el ambiente (reloj lento) sigue mientras la figura está a la vista; sin él, se duerme
      if (enMovimiento || (F.ambiente && !reducido)) { quieto = 0; pedir(); }
      else if (quieto++ < 2) pedir();
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => {
        es.forEach((en) => {
          visible = en.isIntersecting; if (visible) { ultimo = 0; pedir(); if (en.intersectionRatio > 0.45 && !est.tocado && !rec && !F._recorrido) { F._recorrido = true; recorrido(); } }
        });
      }, { threshold: [0, 0.5] }).observe(cv);
    }
    document.addEventListener("visibilitychange", () => { ultimo = 0; pedir(); });
    window.addEventListener("resize", encuadre);
    cv.setAttribute("tabindex", "0");
    if (F.aria) cv.setAttribute("aria-label", F.aria);
    cv.setAttribute("role", "img");
    if (F.crear) F.crear(g, est);
    encuadre();
    // reposo diseñado: la primera pieza queda marcada (regla 05)
    if (F.reposo != null) { elegir(F.reposo, "fuera"); est.foco.forEach((f) => { f.v = f.a; f.dur = 0; }); est.cambio.v = 1; est.cambio.dur = 0; }
    return { elegir, est, g };
  }

  window.Plano = { figura, tinta, RGB, curva, suave, resorte, transito, reducido };
})();
