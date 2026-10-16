import type { CSSProperties, ReactNode } from "react";
import { Link } from "wouter";
import seccionUrl from "@assets/ss26/seccion.svg";

/** Envoltorio simple, sin entrada al aparecer (G3): el contenido se ve completo desde el
    inicio. Conserva la API anterior (delay, y, duration) para no tocar a quien lo usa; esas
    props ya no hacen nada. La única animación de entrada del sitio es la máscara del título
    del héroe de portada (Hero26). */
export function Reveal({
  children,
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
  const Tag = as as "div";
  return <Tag className={className || undefined}>{children}</Tag>;
}

/** Rejilla editorial de las páginas internas, la misma de la portada: el título (o una nota breve)
    en las columnas 1–4 y el cuerpo desde la 5 (en prosa larga, de la 6 a la 12). En teléfono, apilado.
    No incluye .ss-container: va dentro del contenedor de cada sección. */
export function SplitSection({
  aside,
  children,
  prose = false,
  className = "",
  asideClassName = "",
  bodyClassName = "",
}: {
  aside?: ReactNode;
  children: ReactNode;
  prose?: boolean;
  className?: string;
  asideClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:gap-x-6 ${className}`}>
      <div className={`lg:col-span-4 ${asideClassName}`}>{aside}</div>
      <div className={`${prose ? "lg:col-span-7 lg:col-start-6" : "lg:col-span-8 lg:col-start-5"} ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}

/** Filete corto de 24 × 1 px (ss26.css: blanco tenue sobre Azul Profundo, Línea sobre claro),
    completo desde el inicio: no se dibuja al aparecer. */
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
    El número es la posición de la sección en el menú (01 Nuestra firma, 02 Prácticas,
    03 Socios, 04 Monitor Laboral). Las secciones numeradas van sin etiqueta: el h2 ya las
    nombra. El manifiesto, que no está en el menú, lleva "§ —— Lo que creemos" (label, la
    etiqueta de la redacción): ningún § queda sin número ni nombre. § y cifras son gráficos
    (aria-hidden); la etiqueta sí se lee, como en <Eyebrow>. Sobre Hueso, el filete toma
    Entrada (.ss-paper .ss-bar). */
export function SectionHead({
  num,
  label,
  tone = "light",
  className = "",
}: {
  num?: string;
  /** Etiqueta tras el filete; solo en bandas sin número */
  label?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <p
      aria-hidden={label ? undefined : "true"}
      className={`ss-label flex items-center gap-4 ${dark ? "text-white/75" : "text-ss-medio"} ${className}`}
    >
      {/* Sobre Azul Profundo, solo el glifo § va en lima (eco del § del logotipo); las cifras,
          en blanco tenue. Sobre blanco y Hueso, § y cifras en Azul Marino (nunca lima).
          Es marcado y no ::first-letter: Chromium lo ignora en "§ 01". */}
      <span aria-hidden="true" className={`ss-num shrink-0 whitespace-nowrap ${dark ? "text-white/75" : "text-ss-marino"}`}>
        <span className={dark ? "text-ss-lime" : ""}>§</span>
        {num ? ` ${num}` : ""}
      </span>
      <ShortRule />
      {/* Etiqueta en Gris Medio (blanco tenue sobre Azul Profundo), como en <Eyebrow> */}
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
  "data-testid": testId,
}: {
  href: string;
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
  /** Para conservar el data-testid del botón o enlace al que sustituye */
  "data-testid"?: string;
}) {
  const dark = tone === "dark";
  return (
    <Link
      href={href}
      data-testid={testId}
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
