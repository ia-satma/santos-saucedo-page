import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "wouter";
import seccionUrl from "@assets/ss26/seccion.svg";

/* Revelado por posición, no por IntersectionObserver: si el hilo principal va lento
   y la página se desplaza rápido, un elemento puede cruzar la pantalla sin que el
   observador lo registre. Aquí basta con que su borde superior haya pasado el 92%
   de la altura de la ventana, aunque ya esté por encima. */
const pending = new Map<Element, () => void>();
let attached = false;
let frame = 0;
let timer = 0;

function checkPending() {
  frame = 0;
  const limit = window.innerHeight * 0.92;
  pending.forEach((reveal, el) => {
    if (el.getBoundingClientRect().top < limit) {
      pending.delete(el);
      reveal();
    }
  });
  if (pending.size === 0) detach();
}

function schedule() {
  if (frame || pending.size === 0) return;
  frame = requestAnimationFrame(checkPending);
}

/* Escuchas activas solo mientras queda algo por revelar. */
function attach() {
  if (attached) return;
  attached = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  // La altura cambia al cargar fuentes e imágenes: volver a medir entonces.
  if (document.readyState !== "complete") window.addEventListener("load", schedule, { once: true });
  document.fonts?.ready.then(schedule);
  timer = window.setTimeout(schedule, 800);
}

/* Mapa vacío: fuera escuchas, temporizador y cuadro pendiente. */
function detach() {
  if (!attached) return;
  attached = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  window.removeEventListener("load", schedule);
  window.clearTimeout(timer);
  timer = 0;
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
}

/** Marca `is-in` la primera vez que el elemento entra en pantalla. */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    pending.set(el, () => setInView(true));
    attach();
    schedule();
    return () => {
      pending.delete(el);
      if (pending.size === 0) detach();
    };
  }, []);
  return [ref, inView] as const;
}

/** Entrada única al aparecer; con movimiento reducido el CSS la deja estática. */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  duration = 560,
  as = "div",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  as?: "div" | "li";
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLElement>();
  const Tag = as as "div";
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`ss-reveal ${inView ? "is-in" : ""} ${className}`}
      style={{ "--ss-delay": `${Math.min(delay, 0.32)}s`, "--ss-y": `${y}px`, "--ss-dur": `${duration}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/** Filete corto de 24 × 1 px (ss26.css: blanco tenue sobre Azul Profundo, Línea sobre claro);
    se dibuja cuando su bloque entra (clase is-in del Reveal padre). */
export function ShortRule({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`ss-bar shrink-0 ${className}`} />;
}

/** El § de la marca como forma de color libre (máscara sobre el trazo del isotipo). */
export function SectionMark({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none block select-none ${className}`}
      style={{
        aspectRatio: "1200 / 1838",
        WebkitMaskImage: `url("${seccionUrl}")`,
        maskImage: `url("${seccionUrl}")`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        ...style,
      }}
    />
  );
}

/** Cabecera de sección del expediente: "§ 01 ——", como <Eyebrow> en las páginas internas.
    Solo el héroe lleva etiqueta ("§ 00 —— San Pedro Garza García…"): en las secciones el h2
    ya nombra la sección y la etiqueta lo repetía. § y cifras son gráficos (aria-hidden). */
export function SectionHead({
  num,
  label,
  tone = "light",
  className = "",
}: {
  num: string;
  label?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <p
      aria-hidden={label ? undefined : true}
      className={`ss-label flex items-center gap-4 ${dark ? "text-white/75" : "text-ss-medio"} ${className}`}
    >
      {/* Sobre Azul Profundo, solo el glifo § va en lima (eco del § del logotipo); las cifras,
          en blanco tenue. Es marcado y no ::first-letter: Chromium lo ignora en "§ 01". */}
      <span aria-hidden="true" className={`ss-num shrink-0 whitespace-nowrap ${dark ? "text-white/75" : "text-ss-marino"}`}>
        <span className={dark ? "text-ss-lime" : ""}>§</span> {num}
      </span>
      <ShortRule />
      {label && <span>{label}</span>}
    </p>
  );
}

/** Enlace de texto con flecha, sin botón: la firma no persigue al cliente. */
export function TextLink({
  href,
  children,
  tone = "light",
  className = "",
}: {
  href: string;
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <Link
      href={href}
      // before: amplía el área táctil a ~42px sin mover el diseño (index.css ya no fuerza 44px en .ss26)
      className={`ss-label group relative inline-flex items-center gap-3 before:absolute before:inset-x-0 before:-inset-y-3 ${dark ? "text-white" : "text-ss-marino"} ${className}`}
    >
      {/* Subrayado de 1 px y flecha en el color del texto: la lima no va en enlaces */}
      <span className="ss-link">{children}</span>
      <span aria-hidden className="ss-arrow">
        →
      </span>
    </Link>
  );
}
