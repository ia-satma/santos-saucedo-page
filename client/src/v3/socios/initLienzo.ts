/* «Nuestros socios» (pe-socios) de la demo v3, de modules/personas/script.js (parte 1, «Lienzo»).
   Un retrato a la vez; turno automático de 3 s con su reloj en la línea del nombre, solo con el
   retrato en pantalla, siempre desde el primero. Cursor o foco lo detienen y sigue desde donde iba;
   un toque deja al socio elegido 8 s; botón de pausa; se detiene solo tras dos vueltas.
   Un solo requestAnimationFrame, que corre solo con el retrato en pantalla y la pestaña visible.
   Modo Mario (html.rm, evento 'rmchange'): el turno no arranca; lo que el usuario cambia, cambia
   con un fundido corto.
   Cambios respecto a la demo, para que cada socio lleve a su ficha (/team/<slug>):
   - En escritorio y tableta los nombres son enlaces: el cursor o el foco le dan el turno (como en
     la demo) y el clic abre la ficha. En teléfono los segmentos son botones aparte (como en la
     demo, tocar uno le da el turno).
   - El cintillo lleva «Ver perfil», que sigue al socio en turno; en escritorio el retrato también
     abre la ficha (en teléfono, tocarlo pasa al siguiente socio, como en la demo).
   Las reseñas, El equipo con tarjetas y las afiliaciones del módulo no se portan (ocultas en la demo). */

export type LienzoOptions = {
  labels: { pause: string; resume: string; pauseAria: string; resumeAria: string };
  /** Navegación del sitio (wouter) para los enlaces que el script actualiza */
  navigate: (href: string) => void;
};

const CYCLE = 3000;
const TAP_HOLD = 8000;

export function initLienzo(socios: HTMLElement, opts: LienzoOptions): () => void {
  const doc = document;
  const html = doc.documentElement;
  const box = socios.querySelector<HTMLElement>("[data-pe-lienzo]");
  if (!box) return () => {};
  const names = Array.from(box.querySelectorAll<HTMLAnchorElement>(".sc-idx .pe-lz-name"));
  const segs = Array.from(box.querySelectorAll<HTMLButtonElement>(".sc-segs .pe-lz-name"));
  const canv = Array.from(box.querySelectorAll<HTMLElement>(".pe-lz-canvas"));
  const stage = box.querySelector<HTMLElement>(".pe-lz-stage");
  const chy = box.querySelector<HTMLElement>("[data-pe-chy]");
  const chyN = chy?.querySelector<HTMLElement>(".pe-lz-chy-n");
  const chyA = chy?.querySelector<HTMLElement>(".pe-lz-chy-a");
  const chyL = chy?.querySelector<HTMLAnchorElement>(".sc-perfil");
  const pauseBtn = socios.querySelector<HTMLButtonElement>("[data-pe-lz-pause]");
  const pauseT = pauseBtn?.querySelector<HTMLElement>(".pe-turno-t");
  const n = canv.length;
  if (!n || !stage || !chy || !chyN || !chyA) return () => {};

  const offs: Array<() => void> = [];
  function on(el: EventTarget, type: string, fn: EventListener, o?: boolean | AddEventListenerOptions) {
    el.addEventListener(type, fn, o);
    offs.push(() => el.removeEventListener(type, fn, o));
  }
  const isRM = () => html.classList.contains("rm");
  const kbFocus = (el: Element) => { try { return el.matches(":focus-visible"); } catch { return true; } };
  const plainClick = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

  let act = 0;
  const MAX_STEPS = n * 2;
  const st = { inView: false, hover: false, focus: false, paused: false, done: false, elapsed: 0, steps: 0 };
  let chyTimer = 0;

  /* ---------- Reloj único (un rAF) ---------- */
  let rafId = 0, last = 0;
  // En modo Mario nada avanza solo: el reloj ni siquiera arranca (rmchange lo vuelve a encender)
  const anyLive = () => !isRM() && st.inView;
  function frame(now: number) {
    const dt = last ? Math.min(now - last, 100) : 16;
    last = now;
    tick(dt);
    if (!doc.hidden && anyLive()) rafId = requestAnimationFrame(frame);
    else { rafId = 0; last = 0; }
  }
  function kick() { if (!rafId && !doc.hidden && anyLive()) { last = 0; rafId = requestAnimationFrame(frame); } }
  on(doc, "visibilitychange", kick);

  function setReloj(p: number) { box!.style.setProperty("--pe-t", Math.max(0, Math.min(1, p)).toFixed(4)); }
  // El reloj solo se ve cuando el turno puede correr; si no, el socio en turno lleva la marca de 32 px
  function setRelojMode() { box!.classList.toggle("is-reloj", !isRM() && !st.done); }

  function fillChy(i: number) {
    const b = names[i] || segs[i];
    chyN!.textContent = b?.querySelector(".pe-lz-n")?.textContent || "";
    chyA!.textContent = b?.getAttribute("data-cargo") || "";
    const lang = b?.getAttribute("data-cargo-lang");
    if (lang) chyA!.setAttribute("lang", lang); else chyA!.removeAttribute("lang");
    if (chyL && names[i]) {
      chyL.setAttribute("href", names[i].getAttribute("href") || "");
      const aria = names[i].getAttribute("data-perfil");
      if (aria) chyL.setAttribute("aria-label", aria);
    }
  }
  function cintillo(i: number, animar: boolean) {
    clearTimeout(chyTimer);
    if (!animar) {
      fillChy(i);
      chy!.classList.remove("is-sale", "is-entra");
      if (isRM()) { void chy!.offsetWidth; chy!.classList.add("is-entra"); }
      return;
    }
    chy!.classList.remove("is-entra");
    chy!.classList.add("is-sale");
    chyTimer = window.setTimeout(() => {
      fillChy(i);
      chy!.classList.remove("is-sale");
      void chy!.offsetWidth;
      chy!.classList.add("is-entra");
    }, 120);
  }
  function mark(list: HTMLElement[], i: number) {
    list.forEach((b, k) => {
      const onI = k === i;
      b.classList.toggle("is-on", onI);
      if (onI) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
  }
  function show(i: number) {
    if (i === act) return;
    act = i; st.elapsed = 0; setReloj(0);
    mark(names, i);
    mark(segs, i);
    canv.forEach((c, k) => c.classList.toggle("is-on", k === i));
    cintillo(i, !isRM());
  }
  function setPauseUI() {
    if (pauseBtn) {
      const stopped = st.paused || st.done;
      pauseBtn.classList.toggle("is-paused", stopped);
      pauseBtn.setAttribute("aria-label", stopped ? opts.labels.resumeAria : opts.labels.pauseAria);
      if (pauseT) pauseT.textContent = stopped ? opts.labels.resume : opts.labels.pause;
    }
    setRelojMode();
  }
  // Modo Mario: el turno no corre nunca (nada cambia solo); el socio se elige con cursor, toque o teclado
  const running = () => !isRM() && st.inView && !st.hover && !st.focus && !st.paused && !st.done;

  function tick(dt: number) {
    if (!running()) return;
    st.elapsed += dt;
    setReloj(st.elapsed / CYCLE);
    if (st.elapsed >= CYCLE) {
      st.steps++;
      if (st.steps >= MAX_STEPS) { st.done = true; setReloj(0); setPauseUI(); return; }
      show((act + 1) % n);
    }
  }

  /* Entra con el 55 % del retrato visible, sale cuando ya no se ve nada; siempre desde el primero */
  const q = box.querySelector<HTMLElement>(".pe-lz-q") || stage;
  function onView(vis: boolean) {
    st.inView = vis;
    if (vis && !isRM()) {
      st.done = false; st.steps = 0; setPauseUI();
      if (act === 0) { st.elapsed = 0; setReloj(0); } else show(0);
    }
    if (vis) kick();
  }
  let io: IntersectionObserver | null = null;
  if ("IntersectionObserver" in window) {
    let vis = false;
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!vis && e.isIntersecting && e.intersectionRatio >= 0.55) { vis = true; onView(true); }
        else if (vis && !e.isIntersecting) { vis = false; onView(false); }
      });
    }, { threshold: [0, 0.55] });
    io.observe(q);
  } else onView(true);

  // Cursor (solo ratón: el toque emula mouseenter y dejaría el turno detenido para siempre)
  on(box, "pointerenter", ((e: PointerEvent) => { if (e.pointerType === "mouse") st.hover = true; }) as EventListener);
  on(box, "pointerleave", ((e: PointerEvent) => { if (e.pointerType === "mouse") st.hover = false; }) as EventListener);
  let lastPointer = "mouse";
  on(box, "pointerdown", ((e: PointerEvent) => { lastPointer = e.pointerType; }) as EventListener, true);
  function tapOpen(i: number) {
    show(i);
    // Táctil: el socio elegido se queda 8 s y luego sigue el turno
    if (lastPointer !== "mouse") st.elapsed = CYCLE - TAP_HOLD;
  }
  // Nombres (enlaces a la ficha): cursor o foco del teclado le dan el turno; el clic lo lleva wouter
  names.forEach((b, i) => {
    on(b, "pointerenter", ((e: PointerEvent) => { if (e.pointerType === "mouse") show(i); }) as EventListener);
    on(b, "focus", () => { if (kbFocus(b)) show(i); });
  });
  // Segmentos del teléfono: tocar uno le da el turno (como en la demo)
  segs.forEach((b, i) => {
    on(b, "focus", () => { if (kbFocus(b)) show(i); });
    on(b, "click", () => tapOpen(i));
  });
  const mqPhone = window.matchMedia ? window.matchMedia("(max-width: 719px)") : null;
  // Retrato: en teléfono pasa al siguiente socio (demo); en escritorio abre la ficha del socio en turno
  on(stage, "click", ((e: MouseEvent) => {
    if ((e.target as Element | null)?.closest?.("a")) return;
    if (mqPhone && mqPhone.matches) { tapOpen((act + 1) % n); return; }
    const href = names[act]?.getAttribute("href");
    if (href && plainClick(e)) opts.navigate(href);
  }) as EventListener);
  // «Ver perfil» del cintillo: su href sigue al socio en turno, así que navega con la ruta actual
  if (chyL) on(chyL, "click", ((e: MouseEvent) => {
    const href = chyL.getAttribute("href");
    if (!href || !href.startsWith("/") || !plainClick(e)) return;
    e.preventDefault();
    opts.navigate(href);
  }) as EventListener);
  on(box, "focusin", ((e: FocusEvent) => { if (e.target instanceof Element && kbFocus(e.target)) st.focus = true; }) as EventListener);
  on(box, "focusout", ((e: FocusEvent) => {
    const to = e.relatedTarget as Node | null;
    if (!(to && box.contains(to))) st.focus = false;
  }) as EventListener);
  if (pauseBtn) on(pauseBtn, "click", () => {
    if (st.paused || st.done) { st.paused = false; st.done = false; st.steps = 0; }
    else st.paused = true;
    setPauseUI(); kick();
  });
  // Teclado: flechas entre nombres (y entre segmentos)
  [names, segs].forEach((list: HTMLElement[]) => {
    const ul = list[0]?.closest("ul");
    if (!ul) return;
    on(ul, "keydown", ((e: KeyboardEvent) => {
      const k = list.indexOf(doc.activeElement as HTMLElement); if (k < 0) return;
      const to = e.key === "ArrowDown" || e.key === "ArrowRight" ? k + 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? k - 1 : null;
      if (to === null) return;
      e.preventDefault(); list[(to + n) % n].focus();
    }) as EventListener);
  });
  // Modo Mario en vivo: se enciende, el turno se detiene y deja el socio actual; se apaga, sigue
  on(window, "rmchange", ((e: CustomEvent<{ rm?: boolean }>) => {
    const rm = typeof e?.detail?.rm === "boolean" ? e.detail.rm : isRM();
    if (rm) { setReloj(0); setRelojMode(); }
    else { st.elapsed = 0; st.done = false; st.steps = 0; setPauseUI(); kick(); }
  }) as EventListener);

  setRelojMode();

  return () => {
    offs.forEach((off) => off());
    io?.disconnect();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    clearTimeout(chyTimer);
  };
}
