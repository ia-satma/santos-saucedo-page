/* Final de las páginas de prácticas: las cuatro prácticas y la página siguiente. Mismo marcado y clases
   que V3NextPage (client/src/v3/shared.tsx, la «sh-sigue» de la demo), con una diferencia: cada texto
   declara su idioma. En los ocho idiomas sin texto propio, «Siguiente» se muestra en inglés y lleva
   lang="en" (y dir="ltr"); los nombres de las prácticas y de Industrias van en el idioma de la página.
   El nombre de la navegación es el rótulo visible (aria-labelledby), con su idioma.
   Sobre la fila de prácticas, la vuelta al listado (/practice-groups) con el rótulo del menú
   («Prácticas» en cada idioma): un enlace callado, como encabezado de la fila. */
import { useId } from "react";
import { Link } from "wouter";

type LangAttrs = { lang?: string; dir?: "ltr" | "rtl" };

export function SiguientePractica({
  href, label, labelAttrs, title, titleAttrs, practices, current, practicesLabel, allHref,
}: {
  href: string;
  /** «Siguiente» / «Next» */
  label: string;
  /** lang/dir del rótulo cuando es inglés en otro idioma */
  labelAttrs: LangAttrs;
  title: string;
  titleAttrs?: LangAttrs;
  practices?: { href: string; label: string }[];
  current?: string;
  /** Nombre de la lista de prácticas (el rótulo del menú, en el idioma de la página) */
  practicesLabel?: string;
  /** Enlace al listado de prácticas, con practicesLabel como texto (sobre la fila) */
  allHref?: string;
}) {
  const id = useId();
  return (
    <nav className="sh-sigue" aria-labelledby={`${id}-k`}>
      <div className="sh-wrap sh-sigue__in">
        {practices && practices.length ? (
          <div className="pd-sigue__fila">
            {allHref && practicesLabel ? (
              <Link className="pd-sigue__todas" href={allHref} data-testid="link-back-to-practice-groups">{practicesLabel}</Link>
            ) : null}
            <ul className="sh-sigue__pr" aria-label={practicesLabel}>
              {practices.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} aria-current={p.href === current ? "page" : undefined}>{p.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <Link className="sh-sigue__a" href={href}>
          <span className="sh-sigue__k" id={`${id}-k`} {...labelAttrs}>{label}</span>
          <span className="sh-sigue__t" {...titleAttrs}>{title}</span>
        </Link>
      </div>
    </nav>
  );
}
