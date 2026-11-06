/* Piezas comunes de las páginas con el diseño de la demo v3 (aprobada por el cliente el 5-11-2026).
   El CSS de la demo vive en ./demo.css, encerrado en .v3 para no tocar el resto del sitio.
   Ver client/src/v3/README.md. */
import "./demo.css";
// Fondo «piedra» con grano: el que la demo aprobada mostraba por omisión
import "./tema.css";
import "./sitio.css";
import { useEffect, type ReactNode } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export type V3Lang = "es" | "en";

/** Idioma de los textos nuevos de la demo: español o inglés (los demás idiomas ven el inglés). */
export function useV3Lang(): { lang: V3Lang; attrs: { lang?: string; dir?: "ltr" } } {
  const { displayLanguage, language } = useLanguage();
  const lang: V3Lang = displayLanguage === "es" ? "es" : "en";
  // Si el visitante eligió otro idioma (de, ar, ja…), el bloque declara que está en inglés
  const attrs: { lang?: string; dir?: "ltr" } = lang === "en" && language !== "en" ? { lang: "en", dir: "ltr" } : {};
  return { lang, attrs };
}

export { isRM } from "./rm";

/** <main> de una página v3. vista = nombre de la página en la demo (inicio, firma, laboral,
    industrias, socios…): algunas reglas de la demo dependen de él. */
export function V3Main({ vista, children, className = "" }: { vista: string; children: ReactNode; className?: string }) {
  return (
    <main id="main-content" className={`v3 ${className}`} data-vista={vista}>
      {children}
    </main>
  );
}

/** Fotos de client/public/v3 que tienen, junto al original, variantes WebP de 640 y 1200 px de ancho
    (<nombre>-640.webp y <nombre>-1200.webp: mismo encuadre y mismo color). */
const V3_VARIANTES = new Set([
  "c-acumulado", "c-atardecer", "c-cerro-luna", "c-corporativo", "c-estructura", "c-ind-acero", "c-ind-automotriz",
  "c-ind-bebidas", "c-ind-energia", "c-laboral", "c-migratorio", "c-prevencion", "c-reaccion", "c-san-pedro",
]);

/** srcset de una foto de /v3/ con variantes: «/v3/c-laboral.webp» (con la base del sitio delante o sin
    ella) y su ancho real → «…/c-laboral-640.webp 640w, …/c-laboral-1200.webp 1200w, …/c-laboral.webp 2000w».
    undefined si la foto no tiene variantes. */
export function v3SrcSet(src: string, width: number): string | undefined {
  const m = /^(.*\/v3\/)([\w-]+)\.webp$/.exec(src);
  if (!m || !V3_VARIANTES.has(m[2]) || width <= 1200) return undefined;
  return `${m[1]}${m[2]}-640.webp 640w, ${m[1]}${m[2]}-1200.webp 1200w, ${src} ${width}w`;
}

/** sizes de la foto de V3PageHeader: el ancho que ocupa recortada con cover. Hasta 640 px el marco es 4:3
    (una foto más apaisada queda más ancha que la pantalla); después va a todo lo ancho (21:8 y 12:4). */
export function v3HeaderSizes(width: number, height: number): string {
  return `(max-width: 640px) ${Math.max(100, Math.ceil((75 * width) / height))}vw, 100vw`;
}

// La cabecera de Industrias acerca su foto con scale (×1,15 / ×1,3 / ×1,7 en el teléfono, industrias.css):
// el navegador no cuenta esa escala al elegir del srcset, así que esa foto va sin él.
const SIN_SRCSET_AUTO = /\/v3\/c-atardecer\.webp$/;
// fetchpriority en minúsculas: React 18 no conoce fetchPriority (lo pasa, pero avisa en desarrollo)
const PRIORIDAD_ALTA = { fetchpriority: "high" } as Record<string, string>;

/** Cabecera de página de la demo: foto horizontal a todo lo ancho y, debajo, el título y la entrada. */
export function V3PageHeader({
  id, img, alt, width, height, position = "50% 50%", title, lead, children, imgAttrs, srcSet, sizes,
}: {
  id: string; img: string; alt: string; width: number; height: number; position?: string;
  title: ReactNode; lead?: ReactNode; children?: ReactNode;
  /** lang/dir del texto alternativo cuando viene de la copia v3 (inglés en los otros 8 idiomas) */
  imgAttrs?: { lang?: string; dir?: "ltr" | "rtl" };
  /** srcset de la foto. Sin él, las fotos de /v3/ con variantes lo arman solas (v3SrcSet); null: ninguno. */
  srcSet?: string | null;
  /** sizes de la foto. Sin él: v3HeaderSizes(width, height). */
  sizes?: string;
}) {
  const set = srcSet === null ? undefined : srcSet ?? (SIN_SRCSET_AUTO.test(img) ? undefined : v3SrcSet(img, width));
  return (
    <header className="sh-pp sh-cab" aria-labelledby={id}>
      <figure className="sh-pp__foto">
        <img
          src={img}
          srcSet={set}
          sizes={set ? sizes ?? v3HeaderSizes(width, height) : undefined}
          alt={alt}
          width={width}
          height={height}
          {...PRIORIDAD_ALTA}
          style={{ objectPosition: position }}
          {...imgAttrs}
        />
      </figure>
      <div className="sh-wrap sh-pp__cuerpo">
        <div className="sh-pp__texto">
          <h1 id={id} className="sh-h1" tabIndex={-1}>{title}</h1>
          {lead ? <p className="sh-lead">{lead}</p> : null}
          {children}
        </div>
      </div>
    </header>
  );
}

/** Final de cada página: la siguiente parte de la historia (y, en las prácticas, las otras prácticas). */
export function V3NextPage({
  href, title, label, practices, current, ariaLabel, practicesLabel,
}: {
  href: string; title: string; label: string; ariaLabel: string;
  practices?: { href: string; label: string }[]; current?: string;
  /** Nombre de la lista de prácticas para lectores de pantalla («Prácticas») */
  practicesLabel?: string;
}) {
  return (
    <nav className="sh-sigue" aria-label={ariaLabel}>
      <div className="sh-wrap sh-sigue__in">
        {practices && practices.length ? (
          <ul className="sh-sigue__pr" aria-label={practicesLabel}>
            {practices.map((p) => (
              <li key={p.href}>
                <Link href={p.href} aria-current={p.href === current ? "page" : undefined}>{p.label}</Link>
              </li>
            ))}
          </ul>
        ) : null}
        <Link className="sh-sigue__a" href={href}>
          <span className="sh-sigue__k">{label}</span>
          <span className="sh-sigue__t">{title}</span>
        </Link>
      </div>
    </nav>
  );
}

/** Corre un módulo de la demo (init(raíz) → limpieza) cuando el elemento existe. */
export function useV3Module(ref: React.RefObject<HTMLElement | null>, init: (root: HTMLElement) => void | (() => void), deps: unknown[] = []) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const clean = init(el);
    return () => { if (typeof clean === "function") clean(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
