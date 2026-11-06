/* Comportamiento del Inicio v3, portado de la demo (modules/practicas/script.js y shell.js, bloque
   «Inicio: la banda de la turbina… socios con retrato»). Mismos tiempos y puntos de corte. Cada init
   recibe su raíz, busca solo dentro de ella y devuelve una limpieza que deshace escuchas, observadores
   y temporizadores (React monta y desmonta al navegar; StrictMode duplica efectos en desarrollo). */
import { isRM } from "@/v3/shared";

type Off = () => void;

function on<K extends keyof HTMLElementEventMap>(
  el: HTMLElement | Window | Document, type: K | string, fn: (e: any) => void, opts?: AddEventListenerOptions,
): Off {
  el.addEventListener(type, fn as EventListener, opts);
  return () => el.removeEventListener(type, fn as EventListener, opts);
}

function onMQ(mq: MediaQueryList, fn: () => void): Off {
  if (mq.addEventListener) { mq.addEventListener("change", fn); return () => mq.removeEventListener("change", fn); }
  mq.addListener(fn); return () => mq.removeListener(fn);
}

/* =====================================================================
   Nuestras prácticas · selector de Baker
   · Señalar o enfocar un cuadro funde el fondo de TODO el bloque a la foto de su práctica (0.4 s).
     La capa nueva entra encima y la anterior se retira cuando ya está cubierta: nunca se asoma un hueco oscuro.
   · Al salir hay 100 ms de gracia (como Baker), para que cruzar la línea entre dos cuadros no parpadee.
   · El panel azul lo mueve el CSS (:hover y :focus-visible). Aquí se igualan las alturas al panel más alto.
   ===================================================================== */
export function initPracticas(sec: HTMLElement): Off {
  const offs: Off[] = [];
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => { const t = window.setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
  const cancel = (t: number) => { if (t) { clearTimeout(t); timers.delete(t); } };

  const DUR_FONDO = 400;
  const mqPanel = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)");
  const cuadros = Array.from(sec.querySelectorAll<HTMLElement>(".pr-bk-cuadro"));
  const cabeza = sec.querySelector<HTMLElement>(".pr-bk-cabeza");
  const fondos: Record<string, HTMLElement> = {};
  sec.querySelectorAll<HTMLElement>(".pr-bk-fondo").forEach((f) => { fondos[f.getAttribute("data-clave") || ""] = f; });

  let actual: string | null = null, z = 1, tGracia = 0;
  const tRetira: Record<string, number> = {};

  function mostrar(claveIn: string | null) {
    cancel(tGracia);
    const clave = claveIn && fondos[claveIn] ? claveIn : null;
    if (clave === actual) return;
    const nueva = clave ? fondos[clave] : null, previa = actual ? fondos[actual] : null, cp = actual;
    if (nueva && clave) {
      cancel(tRetira[clave]);
      nueva.style.zIndex = String(++z);
      nueva.classList.add("pr-ve");
    }
    if (previa && cp) {
      cancel(tRetira[cp]);
      if (nueva && !isRM()) {
        tRetira[cp] = later(() => { if (actual !== cp) previa.classList.remove("pr-ve"); }, DUR_FONDO + 40);
      } else {
        previa.classList.remove("pr-ve"); /* de vuelta al degradado: la foto se apaga encima de él */
      }
    }
    actual = clave;
    sec.setAttribute("data-fondo", clave || "reposo");
  }
  function enFoco(): HTMLElement | null {
    const a = document.activeElement as HTMLElement | null;
    if (!a || !a.classList || !a.classList.contains("pr-bk-cuadro") || !sec.contains(a)) return null;
    try { if (!a.matches(":focus-visible")) return null; } catch { /* navegador sin :focus-visible */ }
    return a;
  }
  function salir() {
    cancel(tGracia);
    tGracia = later(() => {
      const h = sec.querySelector<HTMLElement>(".pr-bk-cuadro:hover"), f = enFoco();
      mostrar(h ? h.getAttribute("data-clave") : f ? f.getAttribute("data-clave") : null);
    }, 100);
  }

  cuadros.forEach((a) => {
    const clave = a.getAttribute("data-clave");
    offs.push(on(a, "pointerenter", (e: PointerEvent) => { if (e.pointerType !== "touch") mostrar(clave); }));
    offs.push(on(a, "pointerleave", (e: PointerEvent) => { if (e.pointerType !== "touch") salir(); }));
    offs.push(on(a, "focus", () => { if (enFoco() === a) mostrar(clave); }));
    offs.push(on(a, "blur", salir));
    /* Toque: el fondo cambia en el instante del dedo (como Baker) y el enlace navega */
    offs.push(on(a, "pointerdown", (e: PointerEvent) => { if (e.pointerType === "touch") mostrar(clave); }, { passive: true }));
  });
  /* El cuadro del título regresa al degradado, como el «Trending Content» de Baker */
  if (cabeza) offs.push(on(cabeza, "pointerenter", (e: PointerEvent) => { if (e.pointerType !== "touch") mostrar(null); }));
  offs.push(on(sec, "pointerleave", (e: PointerEvent) => { if (e.pointerType !== "touch") salir(); }));
  /* Al volver al inicio (también desde la caché del navegador), el bloque está en reposo */
  offs.push(on(window, "pageshow", () => mostrar(null)));

  /* Alturas iguales: todos los cuadros miden lo que pide el panel más alto (Baker hace lo mismo). Solo con panel. */
  let tAlto = 0;
  function igualar() {
    if (!mqPanel.matches) { sec.style.removeProperty("--pr-bk-alto"); return; }
    let max = 0;
    sec.querySelectorAll<HTMLElement>(".pr-bk-panel").forEach((p) => {
      const cs = getComputedStyle(p), dentro = p.querySelector<HTMLElement>(".pr-bk-dentro"), ver = p.querySelector<HTMLElement>(".pr-bk-ver");
      if (!dentro || !ver) return;
      const h = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) +
        dentro.offsetHeight + parseFloat(getComputedStyle(dentro).marginBottom) + ver.offsetHeight;
      if (h > max) max = h;
    });
    if (max > 0) sec.style.setProperty("--pr-bk-alto", Math.ceil(max) + "px");
  }
  const pedirIgualar = () => { cancel(tAlto); tAlto = later(igualar, 60); };
  igualar();
  let vivo = true;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (vivo) igualar(); });
  offs.push(on(window, "load", igualar));
  if ("ResizeObserver" in window) {
    let ancho = 0;
    const ro = new ResizeObserver((en) => {
      const w = Math.round(en[0].contentRect.width);
      if (w !== ancho) { ancho = w; pedirIgualar(); }
    });
    ro.observe(sec);
    offs.push(() => ro.disconnect());
  } else {
    offs.push(on(window, "resize", pedirIgualar));
  }
  offs.push(onMQ(mqPanel, () => { mostrar(null); igualar(); }));

  /* El degradado se mueve muy despacio, solo mientras el bloque está en pantalla (y nunca en modo Mario: lo quita el CSS) */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((en) => { sec.classList.toggle("pr-bk-fuera", !en[0].isIntersecting); }, { rootMargin: "80px 0px" });
    io.observe(sec);
    offs.push(() => io.disconnect());
  }

  /* Modo Mario en vivo: los cambios del fondo pasan a ser instantáneos (el CSS quita transiciones y deriva) */
  offs.push(on(window, "rmchange", () => {
    sec.querySelectorAll<HTMLElement>(".pr-bk-fondo").forEach((f) => {
      if (f.getAttribute("data-clave") !== sec.getAttribute("data-fondo")) f.classList.remove("pr-ve");
    });
  }));

  return () => {
    vivo = false;
    offs.forEach((off) => off());
    timers.forEach((t) => clearTimeout(t));
    timers.clear();
    sec.style.removeProperty("--pr-bk-alto");
    sec.removeAttribute("data-fondo");
    sec.classList.remove("pr-bk-fuera");
    Object.values(fondos).forEach((f) => { f.classList.remove("pr-ve"); f.style.removeProperty("z-index"); });
  };
}

/* =====================================================================
   Filosofía: la foto de la turbina se asienta al entrar (una vez)
   ===================================================================== */
export function initFilo(filo: HTMLElement): Off {
  if (!("IntersectionObserver" in window)) { filo.classList.add("is-visto"); return () => {}; }
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { filo.classList.add("is-visto"); io.disconnect(); } });
  }, { threshold: 0.25 });
  io.observe(filo);
  return () => io.disconnect();
}

/* =====================================================================
   Socios: el retrato cambia solo cada 4.2 s mientras la banda está a la vista, con la línea de turno
   bajo el nombre activo; se detiene con el cursor o el foco en la lista y en modo Mario.
   ===================================================================== */
export function initSocini(soc: HTMLElement): Off {
  const offs: Off[] = [];
  const links = Array.from(soc.querySelectorAll<HTMLElement>(".sh-socini__lista a"));
  const fotos = Array.from(soc.querySelectorAll<HTMLElement>(".sh-socini__foto img"));
  if (!links.length) return () => {};
  let actual = 0, turno = 0, visible = false, encima = false;

  function poner(i: number | string) {
    actual = +i;
    links.forEach((a) => a.classList.toggle("is-on", a.dataset.i === String(i)));
    fotos.forEach((f) => f.classList.toggle("is-on", f.dataset.i === String(i)));
  }
  /* Turno automático: cada socio queda 4.2 s mientras la banda está a la vista */
  function ciclo() {
    clearTimeout(turno);
    if (!visible || encima || isRM()) { soc.classList.remove("is-auto"); return; }
    soc.classList.add("is-auto");
    turno = window.setTimeout(() => { poner((actual + 1) % links.length); ciclo(); }, 4200);
  }
  links.forEach((a) => {
    offs.push(on(a, "pointerenter", () => poner(a.dataset.i || "0")));
    offs.push(on(a, "focus", () => { encima = true; poner(a.dataset.i || "0"); ciclo(); }));
    offs.push(on(a, "blur", () => { encima = false; ciclo(); }));
  });
  const lista = soc.querySelector<HTMLElement>(".sh-socini__lista");
  if (lista) {
    offs.push(on(lista, "pointerenter", (e: PointerEvent) => { if (e.pointerType === "mouse") { encima = true; ciclo(); } }));
    offs.push(on(lista, "pointerleave", () => { encima = false; ciclo(); }));
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; ciclo(); }, { threshold: 0.35 });
    io.observe(soc);
    offs.push(() => io.disconnect());
  }
  offs.push(on(window, "rmchange", ciclo));
  poner(0);

  return () => {
    clearTimeout(turno);
    offs.forEach((off) => off());
    soc.classList.remove("is-auto");
  };
}
