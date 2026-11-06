/* Módulo «figuras» de la demo v3 (modules/figuras/script.js), como función de arranque con limpieza.
   Láminas isométricas tipo plano. Un solo requestAnimationFrame por lámina, dormido fuera de pantalla y
   con la pestaña oculta. Al entrar en pantalla, el despiece se abre una vez (escalonado, frenado
   exponencial). Señalar un letrero adelanta su pieza y atenúa las demás. Modo Mario (html.rm): despiece
   final quieto; señalar solo cambia el color.
   Piezas que solo se mueven (.fg-mv): data-m (despiece), data-i (turno), y si responden a letreros,
   data-q (los letreros, separados por espacio) y data-n (lo que suben al señalarlos).
   Mismos tiempos y reglas que la demo; solo cambia que todo se busca dentro de la raíz y se deshace al salir. */

type Vec = [number, number];
interface Grupo { el: SVGGElement; k: number }
interface Guia { el: SVGPathElement; pts: Vec[] }
interface Extra { el: SVGGElement; m: number[]; n: number[]; q: string[]; i: number; s: number; h: number; hm: number }
interface Pieza {
  id: string; i: number; m: number[]; n: number[]; s: number; h: number; hm: number; llego: boolean;
  grupos: Grupo[]; guias: Guia[]; punto: SVGElement | null; ancla: Extra | null; marcas: Element[];
  boton: HTMLButtonElement | null; desc: string; nombre: string;
}
interface Lamina {
  el: HTMLElement; escena: Element; visto: boolean; visible: boolean; inicio: number;
  sel: string | null; fijo: string | null; piezas: Record<string, Pieza>; ids: string[];
  lectura: HTMLElement | null; paso: number; extras: Extra[];
}

const DUR = 800; // ms por pieza
const PASO = 120; // ms entre piezas
const TAU = 0.12; // s, seguimiento del adelanto al señalar
const expo = (p: number) => (p >= 1 ? 1 : (1 - Math.pow(2, -10 * p)) / (1 - Math.pow(2, -10)));

export function initFiguras(root: HTMLElement): () => void {
  const planos = Array.from(root.querySelectorAll<HTMLElement>(".fg-plano[data-fg]"));
  if (!planos.length) return () => {};

  const html = document.documentElement;
  // el modo Mario lo decide el sitio (html.rm, según «reducir movimiento»); el módulo solo lo lee
  const esRm = () => html.classList.contains("rm");
  const quitar: Array<() => void> = [];
  const on = (t: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) => {
    t.addEventListener(type, fn, opts);
    quitar.push(() => t.removeEventListener(type, fn, opts));
  };
  const timers = new Set<number>();
  let frame = 0, last = 0;

  const lista = <T extends Element>(el: Element, sel: string) => Array.from(el.querySelectorAll<T>(sel));
  const puntos = (s: string): Vec[] => s.split(" ").map((p) => { const a = p.split(","); return [+a[0], +a[1]] as Vec; });
  const camino = (pts: Vec[]) => pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("");

  const cadaPieza = (L: Lamina, f: (q: Pieza) => void) => L.ids.forEach((p) => f(L.piezas[p]));
  const marcar = (q: Pieza, v: boolean) => q.marcas.forEach((m) => { if (v) m.setAttribute("data-v", ""); else m.removeAttribute("data-v"); });

  function montar(el: HTMLElement): Lamina {
    const datos = JSON.parse(el.getAttribute("data-fg") || "{}") as { stagger: string[]; paso?: number; piezas: Record<string, { m: number[]; n: number[] }> };
    const ids = datos.stagger.filter((p) => !!datos.piezas[p]);
    // visto: la lámina ya entró en pantalla una vez (el despiece no se repite)
    const L: Lamina = {
      el, escena: el.querySelector(".fg-escena") || el, visto: false, visible: false, inicio: -1, sel: null, fijo: null,
      piezas: {}, ids, lectura: (el.closest(".fg-hoja") || el).querySelector<HTMLElement>(".fg-lectura"),
      paso: datos.paso || PASO, extras: [],
    };
    L.extras = lista<SVGGElement>(el, ".fg-mv[data-m]").map((g) => ({
      el: g,
      m: (g.getAttribute("data-m") || "0,0").split(",").map(Number),
      n: (g.getAttribute("data-n") || "0,0").split(",").map(Number),
      q: (g.getAttribute("data-q") || "").split(" ").filter(Boolean),
      i: +(g.getAttribute("data-i") || 0), s: 1, h: 0, hm: 0,
    }));
    ids.forEach((p) => {
      const d = datos.piezas[p];
      const q = '[data-p="' + p + '"]';
      const li = el.querySelector(".fg-pieza" + q);
      L.piezas[p] = {
        id: p, i: datos.stagger.indexOf(p), m: d.m, n: d.n, s: 1, h: 0, hm: 0, llego: true,
        grupos: lista<SVGGElement>(el, ".fg-pz" + q).map((g) => ({ el: g, k: +(g.getAttribute("data-k") || 1) })),
        guias: lista<SVGPathElement>(el, "path[data-pts]" + q).map((g) => ({ el: g, pts: puntos(g.getAttribute("data-pts") || "") })),
        punto: el.querySelector<SVGElement>(".fg-punto" + q),
        // si la guía termina en una pieza que solo se mueve (data-a), la guía sigue a esa pieza
        ancla: null,
        marcas: lista(el, ".fg-pieza" + q + ", .fg-tag" + q + ", .fg-guia" + q + ", .fg-guia-t" + q + ", .fg-punto" + q),
        boton: el.querySelector<HTMLButtonElement>(".fg-et" + q),
        desc: li ? li.querySelector(".fg-desc")?.textContent || "" : "",
        nombre: li ? li.querySelector(".fg-nom")?.textContent || "" : "",
      };
    });
    L.extras.forEach((x) => {
      (x.el.getAttribute("data-a") || "").split(" ").forEach((p) => { if (L.piezas[p]) L.piezas[p].ancla = x; });
    });
    el.setAttribute("data-js", "");
    if (esRm()) final(L); else cerrar(L);
    eventos(L);
    return L;
  }

  // ---- estados ----
  function cerrar(L: Lamina) {
    L.inicio = -1;
    cadaPieza(L, (q) => { q.s = 0; q.llego = false; marcar(q, false); });
    L.extras.forEach((x) => { x.s = 0; });
    pintar(L);
  }
  function final(L: Lamina) {
    L.inicio = -1;
    cadaPieza(L, (q) => { q.s = 1; q.h = 0; q.hm = 0; q.llego = true; marcar(q, true); });
    L.extras.forEach((x) => { x.s = 1; x.h = 0; x.hm = 0; });
    pintar(L);
  }

  // ---- dibujo: solo transformaciones y el primer punto de cada guía ----
  function pintar(L: Lamina) {
    L.extras.forEach((x) => {
      const dx = x.m[0] * x.s + x.n[0] * x.h, dy = x.m[1] * x.s + x.n[1] * x.h;
      if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) x.el.removeAttribute("transform");
      else x.el.setAttribute("transform", "translate(" + dx.toFixed(2) + " " + dy.toFixed(2) + ")");
    });
    cadaPieza(L, (q) => {
      const dx = q.m[0] * q.s + q.n[0] * q.h, dy = q.m[1] * q.s + q.n[1] * q.h;
      q.grupos.forEach((g) => {
        const x = dx * g.k, y = dy * g.k;
        if (Math.abs(x) < 0.01 && Math.abs(y) < 0.01) g.el.removeAttribute("transform");
        else g.el.setAttribute("transform", "translate(" + x.toFixed(2) + " " + y.toFixed(2) + ")");
      });
      // las guías y el punto se dibujaron en la posición abierta: corrimiento respecto a ella
      const a = q.ancla;
      const ax = a ? a.m[0] * a.s + a.n[0] * a.h : dx, ay = a ? a.m[1] * a.s + a.n[1] * a.h : dy;
      const ox = ax - q.m[0], oy = ay - q.m[1];
      if (q.punto) {
        if (Math.abs(ox) < 0.01 && Math.abs(oy) < 0.01) q.punto.removeAttribute("transform");
        else q.punto.setAttribute("transform", "translate(" + ox.toFixed(2) + " " + oy.toFixed(2) + ")");
      }
      q.guias.forEach((g) => {
        const pts = g.pts.slice();
        pts[0] = [g.pts[0][0] + ox, g.pts[0][1] + oy];
        g.el.setAttribute("d", camino(pts));
      });
    });
  }

  // ---- selección ----
  function senalar(L: Lamina, p: string | null) {
    if (L.sel === p) return;
    L.sel = p;
    const rm = esRm();
    cadaPieza(L, (q) => {
      const act = q.id === p;
      q.hm = act && !rm ? 1 : 0;
      q.grupos.forEach((g) => { if (act) g.el.setAttribute("data-on", ""); else g.el.removeAttribute("data-on"); });
      q.marcas.forEach((m) => { if (act) m.setAttribute("data-on", ""); else m.removeAttribute("data-on"); });
      if (q.boton) q.boton.setAttribute("aria-pressed", act ? "true" : "false");
    });
    L.extras.forEach((x) => {
      if (!x.q.length) return;
      const act = !!p && x.q.indexOf(p) >= 0;
      x.hm = act && !rm ? 1 : 0;
      if (act) x.el.setAttribute("data-on", ""); else x.el.removeAttribute("data-on");
    });
    if (p) L.el.setAttribute("data-foco", ""); else L.el.removeAttribute("data-foco");
    if (L.lectura) {
      if (p) {
        const q = L.piezas[p];
        L.lectura.textContent = "";
        const b = document.createElement("b"); b.textContent = q.id + "  ";
        L.lectura.appendChild(b);
        L.lectura.appendChild(document.createTextNode(q.desc));
        L.lectura.setAttribute("data-on", "");
      } else L.lectura.removeAttribute("data-on");
    }
    arrancar();
  }

  function eventos(L: Lamina) {
    let soltar = 0;
    const limpiar = () => { window.clearTimeout(soltar); timers.delete(soltar); };
    const entrar = (p: string) => (e: Event) => { if ((e as PointerEvent).pointerType === "touch") return; limpiar(); if (!L.fijo) senalar(L, p); };
    const salir = () => { limpiar(); soltar = window.setTimeout(() => { timers.delete(soltar); if (!L.fijo) senalar(L, null); }, 90); timers.add(soltar); };
    const alternar = (p: string) => { L.fijo = L.fijo === p ? null : p; senalar(L, L.fijo); };
    cadaPieza(L, (q) => {
      if (q.boton) {
        on(q.boton, "pointerenter", entrar(q.id));
        on(q.boton, "pointerleave", salir);
        on(q.boton, "focus", () => { limpiar(); if (!L.fijo) senalar(L, q.id); });
        on(q.boton, "blur", salir);
        on(q.boton, "click", () => alternar(q.id));
      }
      q.grupos.forEach((g) => {
        g.el.setAttribute("data-mano", "");
        on(g.el, "pointerenter", entrar(q.id));
        on(g.el, "pointerleave", salir);
        on(g.el, "click", () => alternar(q.id));
      });
    });
    on(L.el, "keydown", (e) => {
      if ((e as KeyboardEvent).key === "Escape" && (L.sel || L.fijo)) { L.fijo = null; senalar(L, null); }
    });
  }

  // ---- ciclo único ----
  function ocupada(L: Lamina) {
    if (!L.visible) return false;
    if (L.inicio >= 0) return true;
    for (let i = 0; i < L.ids.length; i++) { const q = L.piezas[L.ids[i]]; if (q.h !== q.hm) return true; }
    for (let j = 0; j < L.extras.length; j++) if (L.extras[j].h !== L.extras[j].hm) return true;
    return false;
  }
  function tick(now: number) {
    frame = 0;
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    const rm = esRm();
    let sigue = false;
    laminas.forEach((L) => {
      if (!L.visible) return;
      let cambio = false;
      if (L.inicio >= 0) {
        if (L.inicio === 0) L.inicio = now;
        let todas = true;
        cadaPieza(L, (q) => {
          const p = rm ? 1 : Math.max(0, Math.min(1, (now - L.inicio - q.i * L.paso) / DUR));
          q.s = expo(p);
          if (p >= 0.86 && !q.llego) { q.llego = true; marcar(q, true); }
          if (p < 1) todas = false;
        });
        L.extras.forEach((x) => {
          const p = rm ? 1 : Math.max(0, Math.min(1, (now - L.inicio - x.i * L.paso) / DUR));
          x.s = expo(p);
          if (p < 1) todas = false;
        });
        if (todas) L.inicio = -1;
        cambio = true;
      }
      const seguir = (q: { h: number; hm: number }) => {
        if (q.h === q.hm) return;
        if (rm) q.h = q.hm;
        else {
          q.h += (q.hm - q.h) * (1 - Math.exp(-dt / TAU));
          if (Math.abs(q.hm - q.h) < 0.002) q.h = q.hm;
        }
        cambio = true;
      };
      cadaPieza(L, seguir);
      L.extras.forEach(seguir);
      if (cambio) pintar(L);
      if (ocupada(L)) sigue = true;
    });
    if (sigue && !document.hidden) frame = requestAnimationFrame(tick);
    else last = 0;
  }
  function arrancar() {
    if (frame || document.hidden) return;
    if (!laminas.some(ocupada)) return;
    last = 0;
    frame = requestAnimationFrame(tick);
  }

  const laminas = planos.map(montar);

  // punto lima de 4 px a cualquier escala: radio en unidades del viewBox (2 px + medio contorno de 1.6 px)
  let ro: ResizeObserver | null = null;
  if ("ResizeObserver" in window) {
    ro = new ResizeObserver((es) => {
      es.forEach((e) => {
        const t = e.target as SVGSVGElement;
        const vb = t.viewBox && t.viewBox.baseVal, w = e.contentRect.width;
        if (w && vb && vb.width) t.style.setProperty("--fg-r", (2.8 * vb.width / w).toFixed(2) + "px");
      });
    });
    planos.forEach((el) => { const f = el.querySelector(".fg-fig"); if (f) ro!.observe(f); });
  }

  // ---- entrada en pantalla ----
  let io: IntersectionObserver | null = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const L = laminas.filter((x) => x.escena === en.target)[0];
        if (!L) return;
        L.visible = en.isIntersecting;
        // se abre con un tercio de la figura a la vista (o media pantalla, si la figura es más alta que ella)
        const basta = en.intersectionRatio >= 0.3 || en.intersectionRect.height >= window.innerHeight * 0.5;
        if (L.visible && !L.visto && basta) {
          L.visto = true;
          if (esRm()) final(L); else L.inicio = 0;
        }
      });
      arrancar();
    }, { rootMargin: "120px 0px", threshold: [0, 0.15, 0.3, 0.5, 0.75] });
    laminas.forEach((L) => io!.observe(L.escena));
  } else laminas.forEach((L) => { L.visto = true; L.visible = true; final(L); });

  on(document, "visibilitychange", () => {
    if (document.hidden) { if (frame) cancelAnimationFrame(frame); frame = 0; last = 0; }
    else arrancar();
  });

  // ---- modo Mario en vivo ----
  on(window, "rmchange", () => {
    const rm = esRm();
    laminas.forEach((L) => {
      if (rm) {
        final(L);
        cadaPieza(L, (q) => { q.h = 0; q.hm = 0; });
        L.extras.forEach((x) => { x.h = 0; x.hm = 0; });
        pintar(L);
      } else if (!L.visto) cerrar(L);
    });
    arrancar();
  });

  return () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    timers.forEach((t) => window.clearTimeout(t));
    timers.clear();
    quitar.forEach((f) => f());
    io?.disconnect();
    ro?.disconnect();
  };
}
