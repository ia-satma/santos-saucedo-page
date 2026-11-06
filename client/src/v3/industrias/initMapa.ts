/* Módulo «mapa» (mp-) de la demo v3, de modules/mapa/script.js (ronda 10). Mismo comportamiento:
   La red de la firma se arma desde Monterrey hacia las 32 entidades federativas.
   - Armado: cada ruta crece desde su nodo de partida a ritmo parejo por la red; al llegar, el
     estado se tiñe y su nodo se enciende en lima un instante. En escritorio (≥1100 px) lo da el
     desplazamiento sobre un escenario fijo (60svh de recorrido); en tableta, el paso del mapa por
     la ventana; en teléfono, el tiempo: una vez, 3 s, al llegar. Nunca retrocede.
   - Después, estado vivo: envíos (un trazo corto y claro) salen de la sede y recorren la red
     hasta un estado; al llegar, su nodo se enciende. Siguen mientras el mapa está a la vista y
     tienen botón visible «Pausar» (regla de los 5 s). Fuera de vista o con la pestaña oculta, nada.
   - Modo Mario (html.rm, evento 'rmchange'): la red completa y quieta, con un fundido de
     240 ms; sin envíos ni botón. Al volver al movimiento, el armado se repite una vez.
   - Cursor o toque sobre un estado: su nombre (Nuevo León: la sede y su dirección).
   - Un solo requestAnimationFrame: corre mientras haya algo que mover y se duerme solo.
   Cambios del puerto: todo se busca dentro de la raíz; los textos (botón, etiqueta, nombres en inglés)
   vienen de React por textos() y se repintan con refrescar() al cambiar de idioma; destruir() quita
   escuchas, observadores, el rAF y los envíos. */
import { MAPA_SEDE } from "./mapaSvg";

export interface MapaTexts {
  sedeNombre: string;
  sedeDato: string;
  pausar: string;
  reanudar: string;
  pausarAria: string;
  reanudarAria: string;
  nombres: Record<string, string>;
}

export interface MapaApi {
  destruir: () => void;
  refrescar: () => void;
}

type Q6 = number[];
interface Estado {
  id: string; el: SVGPathElement; sede: boolean; nombre: string; x: number; y: number;
  nodo: SVGPathElement | null; ruta: Ruta | null; D: number; llego: boolean; camino: Ruta[];
}
interface Ruta {
  el: SVGPathElement; q: Q6; t: number; l: number; e: Estado; de: Estado | undefined;
  s0: number; f: number; acc: number[];
}
interface Envio { s: Estado; el: SVGPathElement; t0: number; dur: number; lam: number; llego: boolean; k: number }

const NS = "http://www.w3.org/2000/svg";

export function initMapa(root: HTMLElement, textos: () => MapaTexts): MapaApi {
  const nada: MapaApi = { destruir: () => {}, refrescar: () => {} };
  const html = document.documentElement;
  const pista = root.querySelector<HTMLElement>(".mp-pista");
  const escena = root.querySelector<HTMLElement>(".mp-escena");
  const recorrido = root.querySelector<HTMLElement>(".mp-recorrido");
  const plano = root.querySelector<HTMLElement>(".mp-plano");
  const svg = root.querySelector<SVGSVGElement>(".mp-svg");
  const gTintes = root.querySelector<SVGGElement>(".mp-tintes");
  const gRed = root.querySelector<SVGGElement>(".mp-red");
  const gEnvios = root.querySelector<SVGGElement>(".mp-envios");
  const tag = root.querySelector<HTMLElement>(".mp-etiqueta");
  const tagNombre = tag?.querySelector<HTMLElement>(".mp-etiqueta-nombre");
  const tagDato = tag?.querySelector<HTMLElement>(".mp-etiqueta-dato");
  const pausa = root.querySelector<HTMLButtonElement>(".mp-pausa");
  if (!pista || !escena || !plano || !svg || !gTintes || !gRed || !gEnvios || !tag || !tagNombre || !tagDato) return nada;

  root.classList.add("mp-js");
  let destruido = false;
  const limpiar: Array<() => void> = [];

  const VB = svg.viewBox.baseVal;
  const VW = (VB && VB.width) || 1000;
  const pct = (v: string | undefined) => parseFloat(v || "0") / 100;
  const SEDE_X = pct(MAPA_SEDE.x);
  const SEDE_Y = pct(MAPA_SEDE.y);
  const f1 = (v: number) => Math.round(v * 10) / 10;

  /* ---------- geometría: Bézier cuadráticas, con tabla de longitud de arco ---------- */
  const bez = (q: Q6, t: number): [number, number] => {
    const u = 1 - t;
    return [u * u * q[0] + 2 * u * t * q[2] + t * t * q[4], u * u * q[1] + 2 * u * t * q[3] + t * t * q[5]];
  };
  const MUESTRAS = 24;
  const tabla = (q: Q6) => {
    const acc = [0]; let p = bez(q, 0), L = 0;
    for (let i = 1; i <= MUESTRAS; i++) { const r = bez(q, i / MUESTRAS); L += Math.hypot(r[0] - p[0], r[1] - p[1]); acc.push(L); p = r; }
    return acc;
  };
  // parámetro t para una longitud s sobre la curva
  const tEn = (r: Ruta, s: number) => {
    const a = r.acc, L = a[MUESTRAS];
    if (s <= 0) return 0;
    if (s >= L) return 1;
    let i = 1; while (a[i] < s) i++;
    return (i - 1 + (s - a[i - 1]) / (a[i] - a[i - 1])) / MUESTRAS;
  };
  // tramo [t0, t1] como «M Q» (control del sub-arco: blossom(t0, t1))
  const tramo = (q: Q6, t0: number, t1: number) => {
    const a = bez(q, t0), b = bez(q, t1);
    const k0 = (1 - t0) * (1 - t1), k1 = (1 - t0) * t1 + t0 * (1 - t1), k2 = t0 * t1;
    return `M${f1(a[0])} ${f1(a[1])}Q${f1(k0 * q[0] + k1 * q[2] + k2 * q[4])} ${f1(k0 * q[1] + k1 * q[3] + k2 * q[5])} ${f1(b[0])} ${f1(b[1])}`;
  };

  /* ---------- datos: estados, nodos y rutas ---------- */
  const estados = new Map<string, Estado>();
  gTintes.querySelectorAll<SVGPathElement>(".mp-edo").forEach((el) => {
    const id = el.dataset.e || "";
    estados.set(id, {
      id, el, sede: el.classList.contains("mp-edo--sede"),
      nombre: el.dataset.nombre || "", x: pct(el.dataset.x), y: pct(el.dataset.y),
      nodo: root.querySelector<SVGPathElement>(`.mp-nodo[data-e="${id}"]`), ruta: null, D: 0, llego: false, camino: [],
    });
  });
  const lista = Array.from(estados.values());
  const sedeE = lista.find((s) => s.sede);
  if (sedeE) sedeE.llego = true;
  const rutas: Ruta[] = [];
  gRed.querySelectorAll<SVGPathElement>(".mp-ruta").forEach((el) => {
    const e = estados.get(el.dataset.e || "");
    if (!e) return;
    const q = (el.dataset.q || "").split(" ").map(Number);
    const r: Ruta = { el, q, t: +(el.dataset.t || 0), l: +(el.dataset.l || 0), e, de: estados.get(el.dataset.de || ""), s0: 0, f: -1, acc: [] };
    r.acc = tabla(q);
    r.l = r.acc[MUESTRAS];
    e.ruta = r;
    e.D = r.t + r.l;
    rutas.push(r);
  });
  // camino de la sede a cada estado (lista de rutas), para los envíos
  for (const s of lista) {
    const c: Ruta[] = []; let x: Estado | undefined = s;
    while (x && x.ruta) { c.unshift(x.ruta); x = x.ruta.de; }
    s.camino = c;
  }
  const DMAX = Math.max(1, ...rutas.map((r) => r.t + r.l));   // la llegada más lejana, por la red

  /* ---------- escala: unidades del viewBox por píxel ---------- */
  let u = 1;
  const RHO_PX = 12;      // las rutas de la sede arrancan fuera de la §
  const LAMBDA_PX = 24;   // largo del trazo de un envío
  const medir = () => {
    const w = plano.clientWidth;
    u = w ? VW / w : 1;
    for (const r of rutas) r.s0 = r.de && r.de.sede ? Math.min(RHO_PX * u, r.l * 0.5) : 0;
  };

  const mqTel = matchMedia("(max-width: 699.98px)");
  const mqEsc = matchMedia("(min-width: 1100px)");
  const isRM = () => html.classList.contains("rm");
  let rm = isRM();
  const hayIO = "IntersectionObserver" in window;
  const modo = () => (mqTel.matches ? "tiempo" : mqEsc.matches ? "pista" : "paso");

  /* ---------- un solo rAF: corre mientras haya algo que mover ---------- */
  let raf = 0, tPrev = 0, pendBajar = false;
  let pendPuntero: PointerEvent | null = null;
  const pedir = () => { if (!raf && !destruido) raf = requestAnimationFrame(cuadro); };

  /* ---------- armado de la red ---------- */
  let armado = false;   // la red empieza vacía y espera
  let T = DMAX;         // frente actual (unidades de red)
  let meta = DMAX;      // hasta dónde debe llegar
  let veloz = 0;        // u/ms máximos (0: sin límite)
  let suave = 0;        // constante de suavizado en ms (0: ritmo parejo)
  let cerca = false, aLaVista = false, escuchando = false;

  const llegar = (s: Estado) => {
    s.llego = true;
    s.el.classList.add("mp-llega");
    if (s.nodo) s.nodo.classList.add("mp-llega");
  };
  const dibujar = (forzar: boolean) => {
    for (const r of rutas) {
      let f = Math.max(0, Math.min(1, (T - r.t) / r.l));
      if (f > 0.9999) f = 1;
      if (!forzar && f === r.f) continue;
      r.f = f;
      const s = f * r.l;
      if (s <= r.s0 + 0.2) r.el.setAttribute("d", "");
      else r.el.setAttribute("d", tramo(r.q, tEn(r, r.s0), f >= 1 ? 1 : tEn(r, s)));
      if (f >= 1 && !r.e.llego) llegar(r.e);
    }
  };
  const vaciar = () => {
    for (const s of lista) {
      if (s.sede) continue;
      s.llego = false;
      s.el.classList.remove("mp-llega");
      if (s.nodo) s.nodo.classList.remove("mp-llega");
    }
  };
  // sin transición ni animación por un cuadro (para saltos de estado)
  const quieto = (fn: () => void) => {
    root.classList.add("mp-quieto");
    fn();
    void root.offsetWidth;
    root.classList.remove("mp-quieto");
  };
  const armar = () => {
    armado = true;
    T = 0; meta = 0;
    quieto(() => { vaciar(); root.classList.add("mp-armado"); dibujar(true); });
    pararVida();
  };
  const completarYa = () => {        // fuera de vista: la red completa, sin animar
    T = meta = DMAX;
    quieto(() => { root.classList.remove("mp-armado"); dibujar(true); });
    terminado();
  };
  const terminado = () => {
    armado = false;
    escuchar(false);
    root.classList.add("mp-completa");
    arrancarVida();
  };

  // avance 0…1 según el desplazamiento
  const progreso = () => {
    const vh = innerHeight || html.clientHeight;
    if (modo() === "pista") {
      const r = pista.getBoundingClientRect();
      if (r.bottom <= 0) return Infinity;
      const top = parseFloat(getComputedStyle(escena).top) || 56;
      const run = recorrido ? recorrido.offsetHeight : 0;
      const ini = vh * 0.42, fin = top - run * 0.8;
      return (ini - r.top) / Math.max(1, ini - fin);
    }
    const r = plano.getBoundingClientRect();
    if (!r.height) return -1;
    if (r.bottom <= 0) return Infinity;
    const ini = vh * 0.85;
    let fin = vh * 0.95 - r.height;
    if (fin > ini - vh * 0.35) fin = ini - vh * 0.35;
    return (ini - r.top) / (ini - fin);
  };
  const revisar = () => {
    if (!armado || document.hidden) return;
    if (modo() === "tiempo") {
      // teléfono: una sola vez, a ritmo parejo, cuando el mapa ya se ve
      if (aLaVista && meta < DMAX) { meta = DMAX; veloz = DMAX / 3000; suave = 0; pedir(); }
      return;
    }
    const p = progreso();
    if (p === -1) return;
    if (p === Infinity) { completarYa(); return; }
    const m = Math.max(0, Math.min(1, p)) * DMAX;
    if (m > meta) { meta = m; veloz = DMAX / 1400; suave = 140; pedir(); }
  };
  const alBajar = () => { pendBajar = true; pedir(); };
  const escuchar = (on: boolean) => {
    if (on === escuchando) return;
    escuchando = on;
    if (on) addEventListener("scroll", alBajar, { passive: true });
    else removeEventListener("scroll", alBajar);
  };
  const avanzar = (dt: number) => {
    if (T >= meta) return false;
    let paso = suave ? (meta - T) * (1 - Math.exp(-dt / suave)) : Infinity;
    if (veloz) paso = Math.min(paso, veloz * dt);
    if (suave) paso = Math.max(paso, Math.min(meta - T, 0.04 * dt));   // que no se arrastre al final
    T = Math.min(meta, T + paso);
    dibujar(false);
    if (T >= DMAX) { terminado(); return false; }
    return T < meta;
  };

  /* ---------- estado vivo: envíos por la red ---------- */
  const envios: Envio[] = [];
  let vivo = false, pausado = false, proxima = 0, turno = 0;
  // destinos: todos salvo los muy cercanos, en un orden que alterna regiones (por rumbo, con salto)
  const destinos = (() => {
    const d = lista.filter((s) => !s.sede && s.D > 60)
      .map((s) => ({ s, a: Math.atan2(s.y - SEDE_Y, s.x - SEDE_X) }))
      .sort((a, b) => a.a - b.a).map((o) => o.s);
    const n = d.length, out: Estado[] = [];
    if (!n) return out;
    let paso = 7; while (paso > 1 && (n % paso === 0 || paso >= n)) paso--;
    for (let i = 0, k = 0; i < n; i++, k = (k + paso) % n) out.push(d[k]);
    return out;
  })();
  const lima = getComputedStyle(root).getPropertyValue("--lima").trim() || "#B2EB3E";
  const puedeVivir = () => !rm && !pausado && aLaVista && !document.hidden && root.classList.contains("mp-completa") && destinos.length > 0;
  const arrancarVida = () => {
    if (!puedeVivir() || vivo) return;
    vivo = true;
    proxima = performance.now() + 500;
    pedir();
  };
  const pararVida = () => {
    vivo = false;
    for (const e of envios) e.el.remove();
    envios.length = 0;
  };
  const destello = (s: Estado) => {
    if (!s.nodo || !s.nodo.animate) return;
    // claves implícitas al principio y al final: vuelve solo a su valor de siempre
    const w = (parseFloat(getComputedStyle(s.nodo).strokeWidth) || 4) * 1.75 + "px";
    s.nodo.animate([{ stroke: lima, strokeWidth: w, offset: 0 }, { stroke: lima, strokeWidth: w, offset: 0.35 }], { duration: 1200, easing: "ease-out" });
    s.el.animate([{ fillOpacity: 0.14, offset: 0.3 }], { duration: 1400, easing: "ease-out" });
  };
  const salir = (now: number) => {
    const s = destinos[turno % destinos.length]; turno++;
    const el = document.createElementNS(NS, "path");
    el.setAttribute("class", "mp-envio");
    gEnvios.appendChild(el);
    const lam = LAMBDA_PX * u;
    envios.push({ s, el, t0: now, dur: Math.max(1300, 3400 * Math.pow(s.D / DMAX, 0.7)), lam, llego: false, k: 0 });
  };
  const curva = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);   // entra y sale suave
  const trazo = (e: Envio) => {
    const fin = e.s.D, cab = Math.min(fin, e.k * (fin + e.lam)), cola = cab - e.lam;
    let d = "";
    for (const r of e.s.camino) {
      const a = Math.max(cola, r.t + r.s0), b = Math.min(cab, r.t + r.l);
      if (b - a > 0.15) d += tramo(r.q, tEn(r, a - r.t), tEn(r, b - r.t));
    }
    return d;
  };
  const vida = (now: number) => {
    if (!vivo) return false;
    if (!puedeVivir()) { pararVida(); return false; }
    if (now >= proxima && envios.length < 3) { salir(now); proxima = now + 1050 + ((turno * 389) % 500); }
    for (let i = envios.length - 1; i >= 0; i--) {
      const e = envios[i];
      const x = Math.min(1, (now - e.t0) / e.dur);
      e.k = curva(x);
      e.el.setAttribute("d", trazo(e));
      if (!e.llego && e.k * (e.s.D + e.lam) >= e.s.D) { e.llego = true; destello(e.s); }
      if (x >= 1) { e.el.remove(); envios.splice(i, 1); }
    }
    return true;
  };

  function cuadro(now: number) {
    raf = 0;
    if (destruido) return;
    const dt = tPrev ? Math.min(64, now - tPrev) : 16;
    tPrev = now;
    if (pendBajar) { pendBajar = false; revisar(); }
    let sigue = false;
    if (armado) sigue = avanzar(dt) || sigue;
    sigue = vida(now) || sigue;
    if (pendPuntero) { const e = pendPuntero; pendPuntero = null; sobre(e); }
    if (sigue) { if (!raf) raf = requestAnimationFrame(cuadro); }   // una sola cadena, aunque algo la haya pedido
    else if (!raf) tPrev = 0;
  }

  /* ---------- botón «Pausar» ---------- */
  const rotularPausa = () => {
    if (!pausa) return;
    const t = textos();
    pausa.textContent = pausado ? t.reanudar : t.pausar;
    pausa.setAttribute("aria-label", pausado ? t.reanudarAria : t.pausarAria);
  };
  if (pausa) {
    const alPausar = () => {
      pausado = !pausado;
      rotularPausa();
      if (pausado) pararVida(); else arrancarVida();
    };
    rotularPausa();
    pausa.addEventListener("click", alPausar);
    limpiar.push(() => pausa.removeEventListener("click", alPausar));
  }

  /* ---------- Modo Mario ---------- */
  const fundido = () => {     // la red aparece completa con un fundido de 240 ms
    root.classList.add("mp-quieto", "mp-espera");
    void root.offsetWidth;
    root.classList.remove("mp-quieto");
    requestAnimationFrame(() => requestAnimationFrame(() => { if (!destruido) root.classList.remove("mp-espera"); }));
  };
  const final = () => {
    armado = false;
    escuchar(false);
    pararVida();
    T = meta = DMAX;
    quieto(() => {
      root.classList.remove("mp-armado");
      for (const s of lista) s.llego = true;
      dibujar(true);
      root.classList.add("mp-completa");
    });
  };

  /* ---------- arranque ---------- */
  medir();
  if (hayIO && !rm) armar();
  else { final(); if (hayIO) root.classList.add("mp-espera"); }   // Mario: completa; se funde al verse

  if (hayIO) {
    const ioCerca = new IntersectionObserver((es) => {
      for (const e of es) cerca = e.isIntersecting;
      escuchar(armado && cerca && modo() !== "tiempo");
      revisar();
    }, { rootMargin: "25% 0px 25% 0px" });
    ioCerca.observe(pista);
    const ioVista = new IntersectionObserver((es) => {
      let algo = false;
      for (const e of es) { aLaVista = e.isIntersecting && e.intersectionRatio >= 0.4; algo = e.isIntersecting; }
      if (algo && root.classList.contains("mp-espera")) root.classList.remove("mp-espera");
      revisar();
      if (aLaVista) arrancarVida(); else pararVida();
    }, { threshold: [0, 0.4, 0.6] });
    ioVista.observe(plano);
    const alOcultar = () => { if (document.hidden) pararVida(); else { revisar(); arrancarVida(); } };
    document.addEventListener("visibilitychange", alOcultar);
    limpiar.push(() => { ioCerca.disconnect(); ioVista.disconnect(); document.removeEventListener("visibilitychange", alOcultar); });
  }
  if ("ResizeObserver" in window) {
    let w0 = plano.clientWidth;
    const ro = new ResizeObserver(() => {
      const w = plano.clientWidth;
      if (w === w0) return;
      w0 = w; medir(); dibujar(true);
      for (const e of envios) e.lam = LAMBDA_PX * u;
      if (armado) alBajar();
    });
    ro.observe(plano);
    limpiar.push(() => ro.disconnect());
  }

  const alCambiarRM = (e: Event) => {
    const d = (e as CustomEvent<{ rm?: boolean }>).detail;
    const next = d && typeof d.rm === "boolean" ? d.rm : isRM();
    if (next === rm) return;
    rm = next;
    if (rm) { final(); fundido(); return; }
    if (!hayIO) return;
    // de vuelta al movimiento: el armado se repite una vez (si el mapa está a la vista, ya, por tiempo)
    root.classList.remove("mp-completa");
    armar();
    if (aLaVista) { meta = DMAX; veloz = DMAX / 3000; suave = 0; pedir(); }
    else { escuchar(cerca && modo() !== "tiempo"); revisar(); }
  };
  addEventListener("rmchange", alCambiarRM);
  limpiar.push(() => removeEventListener("rmchange", alCambiarRM));

  /* ---------- foco de un estado ---------- */
  let actual: Estado | null = null;    // estado señalado
  let fija: Estado | null = null;      // estado elegido con clic o toque (persiste)
  const visible = (s: Estado) => s.llego;
  const rotularSede = () => {
    const t = textos();
    tagNombre.textContent = t.sedeNombre;
    tagDato.textContent = t.sedeDato;
    tagDato.hidden = false;
  };
  const rotular = (s: Estado | null) => {
    if (!s || s.sede) { rotularSede(); return; }
    tagNombre.textContent = textos().nombres[s.id] || s.nombre;
    tagDato.textContent = " ";
    tagDato.hidden = true;
  };
  const poner = (s: Estado | null) => {
    if (s === actual) return;
    if (actual) { actual.el.classList.remove("mp-on"); if (actual.nodo) actual.nodo.classList.remove("mp-on"); }
    actual = s;
    tag.classList.toggle("mp-en-sede", !s);
    rotular(s);
    if (!s) { root.classList.remove("mp-foco"); return; }
    s.el.classList.add("mp-on");
    if (s.nodo) s.nodo.classList.add("mp-on");
    tag.style.setProperty("--x", (s.x * 100).toFixed(2) + "%");
    tag.style.setProperty("--y", (s.y * 100).toFixed(2) + "%");
    // la etiqueta se abre hacia afuera (lejos de Monterrey) y nunca se sale de la ventana
    let izq = s.x < SEDE_X || s.sede;        // Nuevo León: al oeste, para no tapar el letrero de la sede
    if (!mqTel.matches) {
      const r = plano.getBoundingClientRect(), w = tag.offsetWidth + 18, px = r.left + s.x * r.width;
      const vw = html.clientWidth;
      if (izq && px - w < 12) izq = false;
      else if (!izq && px + w > vw - 12) izq = true;
    }
    tag.classList.toggle("mp-izq", izq);
    root.classList.add("mp-foco");
  };
  const soltar = () => poner(fija);
  rotularSede();

  // el nodo más cercano al puntero, en píxeles reales (para los estados diminutos)
  const cercano = (cx: number, cy: number, radio: number) => {
    const r = plano.getBoundingClientRect();
    const px = cx - r.left, py = cy - r.top;
    let best: Estado | null = null, bd = radio * radio;
    for (const s of lista) {
      if (!visible(s)) continue;
      const dx = s.x * r.width - px, dy = s.y * r.height - py, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = s; }
    }
    return best;
  };
  const bajo = (e: MouseEvent, radio: number) => {
    let s = cercano(e.clientX, e.clientY, radio);
    if (!s) {
      const t = e.target instanceof Element ? e.target.closest<SVGPathElement>(".mp-edo") : null;
      s = t ? estados.get(t.dataset.e || "") || null : null;
    }
    return s && visible(s) ? s : null;
  };
  function sobre(e: PointerEvent) {
    const s = bajo(e, 12);
    plano!.classList.toggle("mp-sobre", !!s);
    poner(s || fija);
  }
  const alMover = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    pendPuntero = e;
    pedir();
  };
  const alSalir = () => {
    pendPuntero = null;
    plano.classList.remove("mp-sobre");
    soltar();
  };
  const alTocar = (e: MouseEvent) => {
    const s = bajo(e, mqTel.matches ? 18 : 12);
    fija = s && s !== fija ? s : null;
    poner(fija);
  };
  const alTecla = (e: KeyboardEvent) => {
    if (e.key === "Escape" && (actual || fija)) { fija = null; poner(null); }
  };
  plano.addEventListener("pointermove", alMover);
  plano.addEventListener("pointerleave", alSalir);
  plano.addEventListener("click", alTocar);
  root.addEventListener("keydown", alTecla);
  limpiar.push(() => {
    plano.removeEventListener("pointermove", alMover);
    plano.removeEventListener("pointerleave", alSalir);
    plano.removeEventListener("click", alTocar);
    root.removeEventListener("keydown", alTecla);
  });

  return {
    refrescar: () => { rotularPausa(); rotular(actual); },
    destruir: () => {
      destruido = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      escuchar(false);
      pararVida();
      limpiar.forEach((f) => f());
      // el mismo nodo puede volver a iniciarse (StrictMode, recarga en caliente): sale sin estado
      if (actual) { actual.el.classList.remove("mp-on"); if (actual.nodo) actual.nodo.classList.remove("mp-on"); }
      root.classList.remove("mp-armado", "mp-completa", "mp-espera", "mp-foco", "mp-quieto");
    },
  };
}
