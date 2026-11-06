/* § del pie · módulo «marca» de la demo v3 (pieza 5). La § oficial, entera, Hueso al 7.5 % dentro del
   pie azul: al entrar el pie sube 14 % de su alto (menos que su margen inferior, así que nunca la
   corta el borde) y gana tinta hasta asentarse. Seguimiento del scroll con frenado exponencial
   (τ = 120 ms, como la demo). Un solo requestAnimationFrame, despierto solo con el pie a la vista
   y mientras se mueve. Modo Mario (html.rm): quieta en su lugar.
   initPie(capa) → limpieza. */

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const cubicOut = (t: number) => 1 - Math.pow(1 - t, 3);
function sigue(actual: number, meta: number, dt: number, tau: number) {
  const v = actual + (meta - actual) * (1 - Math.exp(-dt / tau));
  return Math.abs(meta - v) < 0.0004 ? meta : v;
}

export function initPie(capa: HTMLElement): () => void {
  const d = document, w = window, html = d.documentElement;
  const sube = capa.querySelector<HTMLElement>(".mk-pie__sube");
  // El pie que la contiene (la capa ocupa todo su recuadro)
  const anfitrion = (capa.closest("footer") as HTMLElement | null) || capa.parentElement || capa;
  if (!sube) return () => {};

  const limpiar: (() => void)[] = [];
  let vivo = true;
  const on = (t: EventTarget, ev: string, fn: EventListener, o?: AddEventListenerOptions) => {
    t.addEventListener(ev, fn, o);
    limpiar.push(() => t.removeEventListener(ev, fn, o));
  };

  const mq = w.matchMedia ? w.matchMedia("(prefers-reduced-motion: reduce)") : null;
  let rm = html.classList.contains("rm") || !!mq?.matches;
  let actual = 0, pintado = -1, recienVista = true, visible = false;
  let raf = 0, tPrev = 0, ultimoScroll = -1e9;

  function cuadroPie(dt: number) {
    const r = anfitrion.getBoundingClientRect(), vh = w.innerHeight;
    const meta = clamp((vh - r.top) / Math.max(1, Math.min(r.height, vh * 0.9)), 0, 1);
    actual = recienVista ? meta : sigue(actual, meta, dt, 120);
    recienVista = false;
    if (actual !== pintado) {
      pintado = actual;
      const e = cubicOut(actual);
      /* Sube 14 % de su alto (menos que su margen inferior) y gana tinta al asentarse. */
      sube!.style.transform = "translate3d(0," + (14 * (1 - e)).toFixed(2) + "%,0)";
      sube!.style.opacity = (0.075 * (0.35 + 0.65 * e)).toFixed(4);
    }
    return actual !== meta;
  }
  const despierto = () => vivo && visible && !rm && !d.hidden;
  function despertar() {
    if (raf || !despierto()) return;
    raf = w.requestAnimationFrame(cuadro);
  }
  function cuadro(t: number) {
    raf = 0;
    if (!despierto()) { tPrev = 0; return; }
    const dt = tPrev ? Math.min(64, t - tPrev) : 16.7;
    tPrev = t;
    const ocupado = cuadroPie(dt);
    if (ocupado || t - ultimoScroll < 200) raf = w.requestAnimationFrame(cuadro);
    else tPrev = 0;
  }
  limpiar.push(() => { if (raf) w.cancelAnimationFrame(raf); raf = 0; });

  /* Modo Mario: quieta, con el estado final del CSS (sin transform, 7.5 %) */
  function modo(si: boolean) {
    if (si === rm) return;
    rm = si;
    if (rm) { sube!.style.transform = ""; sube!.style.opacity = ""; pintado = -1; }
    else { recienVista = true; despertar(); }
  }
  if (rm) { sube.style.transform = ""; sube.style.opacity = ""; }
  // Primer cuadro al montar (antes de pintar, desde useLayoutEffect): con el pie ya a la vista (páginas
  // cortas), la § no aparece asentada para luego saltar a su posición de entrada
  else cuadroPie(16.7);

  if ("IntersectionObserver" in w) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        const antes = visible; visible = e.isIntersecting;
        if (antes && !visible) recienVista = true;
      });
      despertar();
    }, { rootMargin: "12% 0px 12% 0px" });
    io.observe(anfitrion);
    limpiar.push(() => io.disconnect());
  } else visible = true;

  on(w, "scroll", () => { ultimoScroll = performance.now(); despertar(); }, { passive: true });
  on(w, "resize", () => { ultimoScroll = performance.now(); pintado = -1; despertar(); });
  on(d, "visibilitychange", () => {
    if (d.hidden) { if (raf) w.cancelAnimationFrame(raf); raf = 0; tPrev = 0; }
    else despertar();
  });
  on(w, "rmchange", (e: Event) => {
    const det = (e as CustomEvent<{ rm?: boolean }>).detail;
    modo(det && typeof det.rm === "boolean" ? det.rm : html.classList.contains("rm"));
  });
  if ("MutationObserver" in w) {
    const mo = new MutationObserver(() => modo(html.classList.contains("rm")));
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    limpiar.push(() => mo.disconnect());
  }
  despertar();

  return () => {
    vivo = false;
    limpiar.forEach((f) => { try { f(); } catch { /* nada */ } });
    limpiar.length = 0;
  };
}
