/* ===== Módulo «filosofia» (prefijo fi-) de la demo v3, para React =====
   Port de v3/modules/filosofia/script.js: las mismas curvas, tiempos y cortes. Diferencias con la demo:
   - busca dentro de la raíz que recibe y devuelve una limpieza que quita escuchas, observadores, rAF y relojes;
   - los datos de la turbina llegan como argumento (en la demo, un <script type="application/json">);
   - la lectura toma la descripción de la lista al momento (React cambia el idioma sin volver a montar);
   - cada lámina arranca por su cuenta (la raíz puede ser la propia .fi-lamina): el dibujo de la turbina
     llega aparte, cuando la lámina se acerca, y arrancarla entonces no reinicia el carnero.
   Un requestAnimationFrame por raíz; duerme fuera de pantalla, con la pestaña oculta y cuando nada se mueve.
   Modo Mario: html.rm y el evento 'rmchange'.
   #reaccion: escritorio ancho y alto, el avance del scroll dentro del escenario fijo; si no, una sola vez al entrar.
   #carnero: una sola vez al entrar (construcción → contorno → guías → embestida → números). */

export type ReaccionDatos = {
  frames: { E0: number[]; E1: number[]; J: number[] };
  mods: Record<string, { m: number[]; aE: number[]; aJ: number[] }>;
  lunge: number[];
  u: number[];
};

type Plate = {
  sec: HTMLElement;
  init(): void;
  reset(): void;
  visible(v: boolean, ratio: number): void;
  onScroll(): void;
  resize?(): void;
  needs(): boolean;
  step(now: number, dt: number): void;
  force(): void;
  set(p: number): void;
};

type Pos = { a: number[]; t: number[]; o: number; od?: number };

export function initFilosofia(root: HTMLElement, datos: ReaccionDatos): () => void {
  const html = document.documentElement;
  const secs = root.classList.contains("fi-lamina") ? [root] : Array.from(root.querySelectorAll<HTMLElement>(".fi-lamina"));
  if (!secs.length) return () => {};

  const undo: (() => void)[] = [];
  const listen = (t: EventTarget, ev: string, fn: EventListener, opt?: AddEventListenerOptions) => {
    t.addEventListener(ev, fn, opt);
    undo.push(() => t.removeEventListener(ev, fn, opt));
  };

  const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
  const c01 = (v: number) => clamp(v, 0, 1);
  const smooth = (t: number) => { t = c01(t); return t * t * (3 - 2 * t); };
  const easeOut = (t: number) => { t = c01(t); return 1 - Math.pow(1 - t, 3); };
  const isRM = () => html.classList.contains("rm");
  // escenario fijo con recorrido solo en escritorio ancho y pantalla alta (igual que el CSS);
  // si no, las láminas van apiladas o sin escenario fijo y el avión se arma solo al entrar
  const mqSticky = window.matchMedia ? window.matchMedia("(min-width: 1200px) and (min-height: 860px)") : null;
  const mqPhone = window.matchMedia ? window.matchMedia("(max-width: 820px)") : null;
  const stickyMQ = () => (mqSticky ? mqSticky.matches : true);
  const phoneMQ = () => (mqPhone ? mqPhone.matches : false);
  const $$ = <T extends Element = HTMLElement>(el: ParentNode, sel: string) => Array.from(el.querySelectorAll<T>(sel));
  const opC = new WeakMap<Element, string>();
  const setOp = (el: HTMLElement | SVGElement | null | undefined, v: number) => {
    if (!el) return;
    const s = v >= 0.999 ? "" : String(Math.round(v * 1000) / 1000);
    if (opC.get(el) !== s) { opC.set(el, s); el.style.opacity = s; }
  };
  const atC = new WeakMap<Element, Record<string, string>>();
  const setAttr = (el: Element | null | undefined, k: string, v: string) => {
    if (!el) return;
    let c = atC.get(el);
    if (!c) { c = {}; atC.set(el, c); }
    if (c[k] !== v) { c[k] = v; el.setAttribute(k, v); }
  };
  const setText = (el: Element | null, v: string) => { if (el && el.textContent !== v) el.textContent = v; };

  // ---------- numeración desde data-fi-lamina="n/7" ----------
  function numerar(sec: HTMLElement) {
    const lam = sec.getAttribute("data-fi-lamina") || "";
    const n = lam.split("/")[0];
    if (lam) setText(sec.querySelector(".fi-caj-n"), lam);
    if (!n) return;
    $$(sec, ".fi-fila").forEach((li) => setText(li.querySelector(".fi-n"), n + "." + li.getAttribute("data-p")));
    $$(sec, ".fi-tag").forEach((t) => setText(t.querySelector(".fi-tag-n"), n + "." + t.getAttribute("data-p")));
  }

  // ---------- resaltado compartido (cursor, foco, toque; clic o Enter lo fija, Esc lo suelta) ----------
  function Resalte(sec: HTMLElement, onChange?: (p: string | null, user: string | null) => void) {
    let hover: string | null = null, pinned: string | null = null, auto: string | null = null;
    let cur: string | null | undefined;
    const lectura = sec.querySelector<HTMLElement>(".fi-lectura");
    const desc = (p: string) => {
      const d = sec.querySelector(`.fi-fila[data-p="${p}"] .fi-desc`);
      return d ? d.innerHTML : "";
    };
    function apply(force?: boolean) {
      const user = pinned || hover;
      const p = user || auto;
      if (p === cur && !force) return;
      cur = p;
      if (user) sec.setAttribute("data-foco", ""); else sec.removeAttribute("data-foco");
      $$(sec, ".fi-pz[data-p], .fi-fila, .fi-tag, .fi-guia, .fi-punto").forEach((el) => {
        if (p && el.getAttribute("data-p") === p) el.setAttribute("data-on", ""); else el.removeAttribute("data-on");
      });
      $$(sec, ".fi-et").forEach((b) => b.setAttribute("aria-pressed", pinned && b.getAttribute("data-p") === pinned ? "true" : "false"));
      if (lectura) {
        const d = p ? desc(p) : "";
        if (p && d) { lectura.innerHTML = d; lectura.setAttribute("data-on", ""); }
        else lectura.removeAttribute("data-on");
      }
      if (onChange) onChange(p, user);
    }
    $$(sec, ".fi-et").forEach((b) => {
      const p = b.getAttribute("data-p");
      listen(b, "mouseenter", () => { hover = p; apply(); });
      listen(b, "mouseleave", () => { if (hover === p) hover = null; apply(); });
      listen(b, "focus", () => { hover = p; apply(); });
      listen(b, "blur", () => { if (hover === p) hover = null; apply(); });
      listen(b, "click", () => { pinned = pinned === p ? null : p; apply(); });
    });
    listen(sec, "keydown", (e) => { if ((e as KeyboardEvent).key === "Escape" && pinned) { pinned = null; apply(); } });
    // al cambiar el idioma, la lectura se vuelve a escribir con el texto nuevo
    const lista = sec.querySelector(".fi-lista");
    if (lista && "MutationObserver" in window) {
      const mo = new MutationObserver(() => apply(true));
      mo.observe(lista, { subtree: true, childList: true, characterData: true });
      undo.push(() => mo.disconnect());
    }
    apply();
    return { auto: (p: string | null) => { if (p !== auto) { auto = p; apply(); } } };
  }

  // ---------- lámina «Capacidad de reacción» ----------
  function Reaccion(sec: HTMLElement): Plate | null {
    const D = datos;
    const svg = sec.querySelector<SVGSVGElement>(".fi-fig");
    const tagBox = sec.querySelector<HTMLElement>(".fi-tags");
    if (!D || !svg || !tagBox) return null;
    const mundo = svg.querySelector(".fi-mundo");
    const mods: Record<string, SVGGElement> = {};
    $$<SVGGElement>(svg, ".fi-motor > .fi-pz").forEach((g) => { mods[g.getAttribute("data-p") || ""] = g; });
    const afs = $$<SVGGElement>(svg, ".fi-af").map((el) => ({
      el,
      d: +(el.getAttribute("data-d") || 0),
      fill: el.querySelector<SVGElement>(".fi-afc"),
      lines: $$<SVGPathElement>(el, ".fi-afl path[pathLength]"),
      cav: el.classList.contains("fi-cav"),
      fant: el.classList.contains("fi-fantasma"),
    }));
    const eje = svg.querySelector<SVGElement>(".fi-eje:not(.fi-eje-av)"), ejeAv = svg.querySelector<SVGElement>(".fi-eje-av");
    const escala = $$<SVGElement>(svg, ".fi-avion").concat(ejeAv ? [ejeAv] : []);
    const ids = ["1", "2", "3", "4", "5"];
    const guias: Record<string, SVGElement | null> = {}, puntos: Record<string, SVGElement | null> = {}, tags: Record<string, HTMLElement | null> = {};
    ids.forEach((i) => {
      guias[i] = svg.querySelector(`.fi-guia[data-p="${i}"]`);
      puntos[i] = svg.querySelector(`.fi-punto[data-p="${i}"]`);
      tags[i] = sec.querySelector(`.fi-tag[data-p="${i}"]`);
    });
    const st = { p: 1, target: 1, shown: -1, clock: 0, played: false, visible: false, lastU: 0, forced: false, avion: undefined as boolean | undefined };
    // en el avión armado solo se ve el número de la pieza que el usuario señala (los demás quedan como puntos)
    let userSel: string | null = null;
    const R = Resalte(sec, (_p, user) => { if (user !== userSel) { userSel = user; st.forced = true; wake(); } });
    const F = D.frames;
    // encuadres: motor armado, despiece, y la cámara se abre al avión mientras las piezas vuelven a su lugar
    const KEYS: [number, number[]][] = [[0, F.E0], [0.08, F.E0], [0.32, F.E1], [0.5, F.E1], [0.68, F.J], [1, F.J]];

    const trC = new WeakMap<Element, string>();
    function vbAt(p: number) {
      for (let k = 1; k < KEYS.length; k++) {
        if (p <= KEYS[k][0]) {
          const a = KEYS[k - 1], b = KEYS[k];
          const t = smooth((p - a[0]) / ((b[0] - a[0]) || 1));
          return [0, 1, 2, 3].map((j) => a[1][j] + (b[1][j] - a[1][j]) * t);
        }
      }
      return F.J.slice();
    }
    function explodeOf(i: number, p: number) {
      const out = smooth((p - 0.08 - (i - 1) * 0.035) / 0.17);
      const back = smooth((p - 0.5 - (5 - i) * 0.018) / 0.1);
      return out * (1 - back);
    }

    function render(p: number) {
      // primero se lee la caja (antes de escribir nada en este cuadro)
      const sr = svg!.getBoundingClientRect(), br = tagBox!.getBoundingClientRect();
      const offL = sr.left - br.left, offT = sr.top - br.top;
      const vb = vbAt(p);
      setAttr(svg, "viewBox", vb.map((v) => v.toFixed(2)).join(" "));
      const cw = sr.width || 1, ch = sr.height || 1;
      const s = Math.min(cw / vb[2], ch / vb[3]);
      const u = 1 / s;
      const ox = (cw - vb[2] * s) / 2, oy = (ch - vb[3] * s) / 2;
      if (Math.abs(u - st.lastU) / u > 0.004) { st.lastU = u; escala.forEach((g) => g.style.setProperty("--fi-u", u.toFixed(4))); }
      // avance final
      const le = smooth((p - 0.9) / 0.1);
      const wx = D.lunge[0] * (le - 1), wy = D.lunge[1] * (le - 1);
      setAttr(mundo, "transform", "translate(" + wx.toFixed(2) + " " + wy.toFixed(2) + ")");
      // despiece
      const E: Record<string, number> = {};
      ids.forEach((i) => {
        const e = explodeOf(+i, p); E[i] = e;
        const m = D.mods[i].m;
        setAttr(mods[i], "transform", e > 0.0005 ? "translate(" + (m[0] * e).toFixed(2) + " " + (m[1] * e).toFixed(2) + ")" : "");
      });
      if (eje) setOp(eje, 1 - smooth((p - 0.48) / 0.08));
      // el avión se dibuja: primero las líneas, después las caras
      const q = c01((p - 0.6) / 0.24);
      let fusel = 0;
      afs.forEach((a) => {
        if (a.cav) return;
        const lp = easeOut((q - a.d * 0.42) / 0.4);
        const fo = smooth((q - 0.42 - a.d * 0.32) / 0.24);
        if (a.d === 0) fusel = fo;
        a.lines.forEach((l) => setAttr(l, "stroke-dashoffset", (1 - lp).toFixed(4)));
        setOp(a.el, a.fant ? lp : lp > 0 ? 1 : 0);
        if (a.fill) setOp(a.fill, fo);
      });
      afs.forEach((a) => { if (a.cav) setOp(a.el, fusel); });
      if (ejeAv) setOp(ejeAv, smooth((q - 0.25) / 0.35) * 0.9);
      // números: en el despiece, sobre cada etapa; en el avión, sobre el motor visto por el corte
      const avion = p >= 0.55;
      if (avion !== st.avion) { st.avion = avion; if (avion) sec.setAttribute("data-estado", "avion"); else sec.removeAttribute("data-estado"); }
      const narrow = phoneMQ(); // guías más cortas solo en el teléfono
      const pos: Record<string, Pos> = {};
      if (!avion) {
        const H = (narrow ? 34 : 58) * u;
        ids.forEach((i) => {
          const m = D.mods[i].m, a = D.mods[i].aE, e = E[i];
          const ax = a[0] + m[0] * e + wx, ay = a[1] + m[1] * e + wy;
          pos[i] = { a: [ax, ay], t: [ax, ay - H], o: smooth((e - 0.82) / 0.16) * (1 - smooth((p - 0.47) / 0.04)) };
        });
      } else {
        // en el avión armado quedan los cinco puntos; el número (con su guía perpendicular al eje, hacia el lado
        // lejano) aparece solo para la pieza que el usuario señala en la lista
        const ua = D.u, n = [ua[1], -ua[0]];
        const A: Record<string, number[]> = {};
        let cmax = -1e9;
        ids.forEach((i) => { const a = D.mods[i].aJ; A[i] = [a[0] + wx, a[1] + wy]; cmax = Math.max(cmax, A[i][0] * n[0] + A[i][1] * n[1]); });
        const c = cmax + (narrow ? 40 : 70) * u;
        const od = smooth((p - 0.86) / 0.06);
        ids.forEach((i) => {
          const a = A[i], dn = c - (a[0] * n[0] + a[1] * n[1]);
          pos[i] = { a, t: [a[0] + n[0] * dn, a[1] + n[1] * dn], o: userSel === i ? od : 0, od };
        });
      }
      ids.forEach((i) => {
        const P = pos[i];
        setAttr(guias[i], "d", "M" + P.a[0].toFixed(1) + " " + P.a[1].toFixed(1) + "L" + P.t[0].toFixed(1) + " " + P.t[1].toFixed(1));
        setAttr(puntos[i], "cx", P.a[0].toFixed(1)); setAttr(puntos[i], "cy", P.a[1].toFixed(1));
        setAttr(puntos[i], "r", (2.6 * u).toFixed(2));
        setOp(guias[i], P.o); setOp(puntos[i], P.od === undefined ? P.o : P.od); setOp(tags[i], P.o);
        const tag = tags[i];
        if (!tag) return;
        const x = offL + ox + (P.t[0] - vb[0]) * s, y = offT + oy + (P.t[1] - vb[1]) * s;
        const tr = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(-50%,-50%)";
        if (trC.get(tag) !== tr) { trC.set(tag, tr); tag.style.transform = tr; }
      });
      // la etapa que acaba de llegar se enciende sola durante el despiece
      let auto: string | null = null;
      if (p > 0.1 && p < 0.46) ids.forEach((i) => { if (E[i] > 0.9) auto = i; });
      R.auto(auto);
    }

    const sticky = () => !isRM() && stickyMQ();
    function measure() {
      if (isRM()) { st.target = 1; st.p = 1; return; }
      if (sticky()) {
        const r = sec.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        st.target = span > 0 ? c01(-r.top / span) : 1;
      }
    }
    return {
      sec,
      init() {
        sec.classList.add("fi-js");
        ids.forEach((i) => { const t = tags[i]; if (t) { t.style.left = "0"; t.style.top = "0"; } });
        this.reset();
      },
      reset() {
        st.played = false; st.clock = 0;
        if (isRM()) { st.p = st.target = 1; }
        else if (sticky()) { measure(); st.p = st.target; }
        else { st.p = st.target = 0; }
        st.shown = -1;
      },
      visible(v, ratio) {
        st.visible = v;
        if (v && !isRM() && !sticky() && !st.played && ratio > 0.3) { st.played = true; st.clock = performance.now(); }
      },
      onScroll() { if (sticky()) measure(); },
      needs() { return st.visible && (st.shown < 0 || st.forced || Math.abs(st.target - st.p) > 0.0002 || Math.abs(st.shown - st.p) > 0.00005 || st.clock > 0); },
      step(now, dt) {
        if (isRM()) st.p = st.target = 1;
        else if (sticky()) { measure(); const k = 1 - Math.exp(-dt / 90); st.p += (st.target - st.p) * k; if (Math.abs(st.target - st.p) < 0.0003) st.p = st.target; }
        else if (st.clock > 0) { st.p = c01((now - st.clock) / 8600); if (st.p >= 1) st.clock = 0; }
        if (st.shown !== st.p || st.forced) { st.forced = false; render(st.p); st.shown = st.p; }
      },
      force() { st.forced = true; st.shown = -1; },
      // gancho de prueba (capturas): fija el avance
      set(p) { st.clock = 0; st.p = st.target = p; st.played = true; render(p); st.shown = p; },
    };
  }

  // ---------- lámina «Preparados para el litigio» ----------
  function Carnero(sec: HTMLElement): Plate | null {
    const svg = sec.querySelector<SVGSVGElement>(".fi-fig");
    if (!svg) return null;
    const LEAN = +(sec.getAttribute("data-fi-lean") || 5);
    const vbW = +(svg.getAttribute("viewBox") || "0 0 1 1").split(/\s+/)[2];
    const cons = $$<SVGPathElement>(svg, ".fi-cons[pathLength]");
    const ejes = $$<SVGElement>(svg, ".fi-eje, .fi-est");
    const dib = $$<SVGPathElement>(svg, ".fi-dib");
    const fills = $$<SVGElement>(svg, ".fi-animal .fi-f, .fi-achure, .fi-animal path.fi-fa:not([pathLength]), .fi-ojo");
    const fis = $$<SVGElement>(svg, ".fi-fis");
    const vecs = $$<SVGPathElement>(svg, ".fi-vec:not([data-vec])");
    const golpe = svg.querySelector<SVGPathElement>('[data-vec="impacto"]');
    const punta = golpe && golpe.parentNode ? (golpe.parentNode as Element).querySelector(".fi-punta") : null;
    let gl = 0;
    if (golpe) { const gd = (golpe.getAttribute("d") || "").match(/-?[\d.]+/g)!.map(Number); gl = gd[2] - gd[0]; }
    const animal = svg.querySelector(".fi-animal");
    const sigue = $$<SVGElement>(svg, ".fi-sigue");
    const marks = ($$<HTMLElement | SVGElement>(svg, ".fi-guia, .fi-punto") as (HTMLElement | SVGElement)[]).concat($$<HTMLElement>(sec, ".fi-tag"));
    const puntos = $$<SVGCircleElement>(svg, ".fi-punto");
    Resalte(sec);
    const T = 3900;
    const st = { t: T, clock: 0, played: false, visible: false, shown: -1 };

    function render(t: number) {
      const c = easeOut(t / 1150);
      cons.forEach((l) => setAttr(l, "stroke-dashoffset", (1 - c).toFixed(4)));
      ejes.forEach((l) => setOp(l, smooth((t - 250) / 650)));
      const d = easeOut((t - 450) / 1500);
      dib.forEach((l) => setAttr(l, "stroke-dashoffset", (1 - d).toFixed(4)));
      const f = smooth((t - 1150) / 900);
      fills.forEach((el) => setOp(el, f));
      const g = smooth((t - 1800) / 600);
      fis.forEach((el) => setOp(el, g));
      vecs.forEach((l) => setAttr(l, "stroke-dashoffset", (1 - easeOut((t - 1800) / 600)).toFixed(4)));
      // embestida: unos grados hacia adelante y el vector de impacto se alarga
      const k = easeOut((t - 2550) / 650);
      const a = LEAN * k, tn = Math.tan((a * Math.PI) / 180);
      setAttr(animal, "transform", a > 0.001 ? "skewX(" + (-a).toFixed(3) + ")" : "");
      sigue.forEach((el) => { const h = +(el.getAttribute("data-h") || 0); setAttr(el, "transform", a > 0.001 ? "translate(" + (h * tn).toFixed(2) + " 0)" : ""); });
      if (golpe) {
        const ext = 0.42 + 0.58 * k;
        setAttr(golpe, "stroke-dashoffset", (1 - ext * easeOut((t - 1800) / 600)).toFixed(4));
        if (punta) setAttr(punta, "transform", "translate(" + (-(1 - ext) * gl).toFixed(2) + " 0)");
      }
      const m = smooth((t - 3150) / 550);
      marks.forEach((el) => setOp(el, m));
    }
    function scale() {
      const w = svg!.clientWidth || 1;
      const u = vbW / w;
      svg!.style.setProperty("--fi-u", u.toFixed(4));
      puntos.forEach((c) => c.setAttribute("r", (2.6 * u).toFixed(2)));
    }
    return {
      sec,
      init() { sec.classList.add("fi-js"); scale(); this.reset(); },
      reset() {
        if (isRM() || st.played) { st.t = T; st.clock = 0; }
        else st.t = 0;
        st.shown = -1;
      },
      visible(v, ratio) {
        st.visible = v;
        if (v && !isRM() && !st.played && ratio > 0.35) { st.played = true; st.clock = performance.now(); }
      },
      onScroll() {},
      resize: scale,
      needs() { return st.visible && (st.shown < 0 || st.clock > 0); },
      step(now) {
        if (isRM()) { st.t = T; st.clock = 0; }
        else if (st.clock > 0) { st.t = clamp(now - st.clock, 0, T); if (st.t >= T) st.clock = 0; }
        if (st.shown !== st.t) { render(st.t); st.shown = st.t; }
      },
      force() { st.shown = -1; },
      set(t) { st.clock = 0; st.played = true; st.t = t * T; render(st.t); st.shown = st.t; },
    };
  }

  // ---------- arranque ----------
  const plates: Plate[] = [];
  const porObjetivo = new Map<Element, Plate>();
  secs.forEach((sec) => {
    numerar(sec);
    const pl = sec.classList.contains("fi-reaccion") ? Reaccion(sec) : sec.classList.contains("fi-carnero") ? Carnero(sec) : null;
    if (!pl) return;
    pl.init();
    plates.push(pl);
    (sec as HTMLElement & { __fi?: Plate }).__fi = pl;
    undo.push(() => { delete (sec as HTMLElement & { __fi?: Plate }).__fi; });
    if ("MutationObserver" in window) {
      const mo = new MutationObserver(() => numerar(sec));
      mo.observe(sec, { attributes: true, attributeFilter: ["data-fi-lamina"] });
      undo.push(() => mo.disconnect());
    }
  });

  let raf = 0, last = 0;
  function loop(now: number) {
    raf = 0;
    const dt = last ? Math.min(64, now - last) : 16;
    last = now;
    let more = false;
    plates.forEach((pl) => { if (pl.needs()) { pl.step(now, dt); more = more || pl.needs(); } });
    if (more && !document.hidden) raf = requestAnimationFrame(loop);
    else last = 0;
  }
  function wake() { if (!raf && !document.hidden) raf = requestAnimationFrame(loop); }
  undo.push(() => { if (raf) cancelAnimationFrame(raf); raf = 0; });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { const pl = porObjetivo.get(e.target); if (pl) pl.visible(e.isIntersecting, e.intersectionRatio); });
      wake();
    }, { threshold: [0, 0.15, 0.3, 0.35, 0.5] });
    plates.forEach((pl) => {
      // el teléfono arranca cuando el dibujo entra, no cuando entra el título
      const target = pl.sec.querySelector(".fi-plano") || pl.sec;
      porObjetivo.set(target, pl);
      io.observe(target);
    });
    undo.push(() => io.disconnect());
  } else plates.forEach((pl) => pl.visible(true, 1));

  // el dibujo cambia de tamaño sin que cambie la ventana (letras que cargan, fotos de arriba)
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => { plates.forEach((pl) => { if (pl.resize) pl.resize(); pl.force(); }); wake(); });
    plates.forEach((pl) => { const t = pl.sec.querySelector(".fi-plano"); if (t) ro.observe(t); });
    undo.push(() => ro.disconnect());
  }

  listen(window, "scroll", () => { plates.forEach((pl) => pl.onScroll()); wake(); }, { passive: true });
  listen(window, "resize", () => { plates.forEach((pl) => { if (pl.resize) pl.resize(); pl.force(); }); wake(); });
  listen(document, "visibilitychange", () => { if (!document.hidden) wake(); });
  const modo = () => { plates.forEach((pl) => { pl.reset(); pl.force(); }); wake(); };
  listen(window, "rmchange", modo);
  if ("MutationObserver" in window) {
    let wasRM = isRM();
    const mo = new MutationObserver(() => { const r = isRM(); if (r !== wasRM) { wasRM = r; modo(); } });
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    undo.push(() => mo.disconnect());
  }
  if (mqSticky && mqSticky.addEventListener) {
    mqSticky.addEventListener("change", modo);
    undo.push(() => mqSticky.removeEventListener("change", modo));
  }
  wake();

  return () => {
    while (undo.length) { const f = undo.pop(); try { f && f(); } catch { /* nada */ } }
  };
}
