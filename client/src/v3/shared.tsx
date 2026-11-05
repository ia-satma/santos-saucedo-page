/* Piezas comunes de las páginas con el diseño de la demo v3 (aprobada por el cliente el 5-11-2026).
   El CSS de la demo vive en ./demo.css, encerrado en .v3 para no tocar el resto del sitio.
   Ver client/src/v3/README.md. */
import "./demo.css";
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

/** Cabecera de página de la demo: foto horizontal a todo lo ancho y, debajo, el título y la entrada. */
export function V3PageHeader({
  id, img, alt, width, height, position = "50% 50%", title, lead, children,
}: {
  id: string; img: string; alt: string; width: number; height: number; position?: string;
  title: ReactNode; lead?: ReactNode; children?: ReactNode;
}) {
  return (
    <header className="sh-pp sh-cab" aria-labelledby={id}>
      <figure className="sh-pp__foto">
        <img src={img} alt={alt} width={width} height={height} decoding="async" style={{ objectPosition: position }} />
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
  href, title, label, practices, current, ariaLabel,
}: {
  href: string; title: string; label: string; ariaLabel: string;
  practices?: { href: string; label: string }[]; current?: string;
}) {
  return (
    <nav className="sh-sigue" aria-label={ariaLabel}>
      <div className="sh-wrap sh-sigue__in">
        {practices && practices.length ? (
          <ul className="sh-sigue__pr">
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
