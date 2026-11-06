/* «Nuestros socios» de la demo v3 (módulo personas, pe-socios): un retrato a la vez que se funde
   con el azul, los nombres grandes como índice con la línea del turno de 3 s y el cintillo bajo
   el retrato; en teléfono, segmentos en lugar de nombres. Marcado y clases de
   modules/personas/section.html; comportamiento en ./initLienzo.ts.
   Datos del sitio (/api/team, orden y visibilidad del panel): nombre, cargo, retrato (srcset de
   teamPhotoSources) y el tratamiento conmemorativo del retrato in memoriam (ss-photo +
   data-portrait-slug, ss26.css). Cada socio lleva a su ficha /team/<slug>. */
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import "./socios.css";
import { initLienzo } from "./initLienzo";
import type { SociosTexts } from "./texts";
import { fallbackToOriginalSrc, getTeamPhotoSrcSet, highFetchPriority } from "@/lib/teamPhotoSources";

export type LienzoPartner = {
  slug: string;
  name: string;
  /** cargo ya con «(in memoriam)» sin partir */
  role: string;
  /** "en" cuando el cargo va en inglés dentro de otro idioma */
  roleLang?: string;
  imageUrl?: string | null;
};

type Attrs = { lang?: string; dir?: "ltr" };

// Lado del retrato: --pe-w de demo.css (400 px máx. en escritorio, 100 % en teléfono)
const STAGE_SIZES = "(max-width: 719px) calc(100vw - 32px), (max-width: 1023px) clamp(260px, 36vw, 340px), clamp(320px, 28vw, 400px)";

function Reloj() {
  return <span className="pe-lz-linea" aria-hidden="true"><span className="pe-lz-reloj"></span></span>;
}

function Arrow() {
  return (
    <svg className="pe-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8h10M9 4.5L12.5 8 9 11.5" /></svg>
  );
}

export function SociosLienzo({
  partners, t, attrs, title, list, lead, children,
}: {
  partners: LienzoPartner[];
  t: SociosTexts;
  /** lang="en" en los textos nuevos cuando el visitante eligió otro idioma */
  attrs: Attrs;
  title: string;
  list: string;
  /** subtítulo del panel bajo el título (solo si algún idioma lo trae) */
  lead?: ReactNode;
  /** debajo del Lienzo, dentro de la misma sección (Of Counsel) */
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [, navigate] = useLocation();
  const navRef = useRef(navigate);
  navRef.current = navigate;
  const labels = { pause: t.pause, resume: t.resume, pauseAria: t.pauseAria, resumeAria: t.resumeAria };
  const labelsRef = useRef(labels);
  labelsRef.current = labels;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || partners.length === 0) return;
    return initLienzo(el, { labels: labelsRef.current, navigate: (href) => navRef.current(href) });
    // Team.tsx vuelve a montar el componente (key) cuando cambian los socios o el idioma
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const first = partners[0];
  const profileLabel = (p: LienzoPartner) => `${t.profile}: ${p.name}`;

  return (
    <section ref={ref} className="pe pe-socios sobre-azul" id="pe-socios" aria-labelledby="pe-socios-h" data-testid="section-partners">
      <div className="pe-wrap">
        <header className="pe-head pe-head--lz">
          <h1 className="pe-h2" id="pe-socios-h" tabIndex={-1} data-testid="text-team-title">{title}</h1>
          {/* Control del turno automático. En modo Mario no hay turno y no se muestra. */}
          {partners.length > 1 && (
            <button type="button" className="pe-turno" data-pe-lz-pause aria-label={t.pauseAria} {...attrs}>
              <svg className="pe-ico pe-ico-pause" viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5v9M10.5 3.5v9" /></svg>
              <svg className="pe-ico pe-ico-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6L12.5 8z" /></svg>
              <span className="pe-turno-t">{t.pause}</span>
            </button>
          )}
          {lead ? <p className="sc-lead" data-testid="text-team-subtitle">{lead}</p> : null}
        </header>

        <div className="pe-lz" data-pe-lienzo>
          {/* Índice (escritorio y tableta): cada nombre es el enlace a la ficha; el cursor o el foco
              le dan el turno a ese socio */}
          <ul className="pe-lz-names sc-idx" role="list" aria-label={list}>
            {partners.map((p, i) => (
              <li key={p.slug}>
                <Link
                  href={`/team/${p.slug}`}
                  className={i === 0 ? "pe-lz-name is-on" : "pe-lz-name"}
                  data-i={i}
                  data-cargo={p.role}
                  data-cargo-lang={p.roleLang}
                  data-perfil={profileLabel(p)}
                  aria-current={i === 0 ? "true" : undefined}
                  data-testid={`card-team-member-${p.slug}`}
                >
                  <span className="pe-lz-n">{p.name}</span>
                  <span className="pe-sr">, {p.roleLang ? <span lang={p.roleLang}>{p.role}</span> : p.role}</span>
                  <Reloj />
                </Link>
              </li>
            ))}
          </ul>

          {/* Escenario: los retratos apilados (decorativos: los nombres dicen quién está en turno);
              el que entra aparece con un fundido y se asienta. Debajo, el cintillo. */}
          <div className="pe-lz-stage" id="pe-lz-stage">
            <div className="pe-lz-q" aria-hidden="true">
              {partners.map((p, i) => {
                const srcSet = getTeamPhotoSrcSet(p.imageUrl);
                return (
                  <figure key={p.slug} className={i === 0 ? "pe-lz-canvas is-on" : "pe-lz-canvas"} data-i={i}>
                    {p.imageUrl ? (
                      <img
                        className="pe-lz-img ss-photo"
                        data-portrait-slug={p.slug}
                        src={p.imageUrl}
                        {...(srcSet ? { srcSet, sizes: STAGE_SIZES } : {})}
                        {...(i === 0 ? highFetchPriority : {})}
                        alt=""
                        width={652}
                        height={652}
                        decoding="async"
                        loading={i === 0 ? "eager" : "lazy"}
                        draggable={false}
                        onError={(e) => { if (!fallbackToOriginalSrc(e)) e.currentTarget.style.visibility = "hidden"; }}
                      />
                    ) : null}
                  </figure>
                );
              })}
            </div>
            {/* Cintillo de noticiero: uno solo; al cambiar el turno se traza el filete y entra el texto
                nuevo. «Ver perfil» sigue al socio en turno. */}
            {first && (
              <div className="pe-lz-chy" data-pe-chy>
                <span className="pe-lz-chy-f" aria-hidden="true"><span className="pe-lz-chy-m"></span></span>
                <p className="pe-lz-chy-n" aria-hidden="true">{first.name}</p>
                <p className="pe-lz-chy-a" aria-hidden="true" lang={first.roleLang}>{first.role}</p>
                <a className="sc-perfil" href={`/team/${first.slug}`} aria-label={profileLabel(first)} {...attrs}>
                  <span>{t.profile}</span><Arrow />
                </a>
              </div>
            )}
          </div>

          {/* Teléfono: cuatro segmentos que avanzan con el turno, como en las historias; no repiten el
              nombre que ya dice el cintillo. Botones de 44 px con el nombre para lectores. */}
          <ul className="pe-lz-names sc-segs" role="list" aria-label={list}>
            {partners.map((p, i) => (
              <li key={p.slug}>
                <button
                  type="button"
                  className={i === 0 ? "pe-lz-name is-on" : "pe-lz-name"}
                  data-i={i}
                  data-cargo={p.role}
                  data-cargo-lang={p.roleLang}
                  aria-current={i === 0 ? "true" : undefined}
                  aria-controls="pe-lz-stage"
                >
                  <span className="pe-lz-n">{p.name}</span>
                  <span className="pe-sr">, {p.roleLang ? <span lang={p.roleLang}>{p.role}</span> : p.role}</span>
                  <Reloj />
                </button>
              </li>
            ))}
          </ul>
        </div>
        {children}
      </div>
    </section>
  );
}

/** Mientras llega /api/team (o si falla): la misma sección y la misma altura, sin turno. */
export function SociosLienzoPlaceholder({ title, message, busy }: { title: string; message: string; busy: boolean }) {
  return (
    <section className="pe pe-socios sobre-azul" aria-labelledby="pe-socios-h" aria-busy={busy || undefined} data-testid={busy ? "section-partners-loading" : "container-team-error"}>
      <div className="pe-wrap">
        <header className="pe-head pe-head--lz">
          <h1 className="pe-h2" id="pe-socios-h" tabIndex={-1} data-testid="text-team-title">{title}</h1>
          <span className="pe-turno sc-sk-chy" aria-hidden="true">&nbsp;</span>
        </header>
        {busy ? <div className="pe-lz sc-lz-espera">
          <ul className="pe-lz-names sc-idx" role="list">
            {[0, 1, 2, 3].map((i) => (
              <li key={i}><span className="pe-lz-name"><span className="pe-lz-n sc-sk" aria-hidden="true">&nbsp;</span><Reloj /></span></li>
            ))}
          </ul>
          <div className="pe-lz-stage">
            <div className="pe-lz-q"><div className="pe-lz-canvas is-on sc-sk-foto" /></div>
            {/* El cintillo, invisible: el escenario mide lo mismo que con los datos */}
            <div className="pe-lz-chy sc-sk-chy" aria-hidden="true">
              <span className="pe-lz-chy-f"></span>
              <p className="pe-lz-chy-n">&nbsp;</p>
              <p className="pe-lz-chy-a">&nbsp;</p>
              <span className="sc-perfil"><span>&nbsp;</span></span>
            </div>
          </div>
          <ul className="pe-lz-names sc-segs" role="list" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <li key={i}><span className="pe-lz-name"><Reloj /></span></li>
            ))}
          </ul>
        </div> : null}
        <p className={busy ? "pe-sr" : "sc-error"} role="status" data-testid={busy ? undefined : "text-team-error"}>{message}</p>
      </div>
    </section>
  );
}

const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

/** Of Counsel (si el panel los tiene): bajo el Lienzo, en el mismo azul; cada uno lleva a su ficha. */
export function OfCounsel({ title, people }: { title: string; people: LienzoPartner[] }) {
  if (people.length === 0) return null;
  return (
    <div className="sc-oc" data-testid="section-ofcounsel">
      <h2 className="sc-oc-h">{title}</h2>
      <ul className="sc-oc-list" role="list">
        {people.map((p) => {
          const srcSet = getTeamPhotoSrcSet(p.imageUrl);
          return (
            <li key={p.slug}>
              <Link href={`/team/${p.slug}`} className="sc-oc-a" data-testid={`card-team-member-${p.slug}`}>
                <span className="sc-oc-foto" aria-hidden="true">
                  {p.imageUrl ? (
                    <img
                      className="ss-photo"
                      data-portrait-slug={p.slug}
                      src={p.imageUrl}
                      {...(srcSet ? { srcSet, sizes: "120px" } : {})}
                      alt=""
                      width={652}
                      height={652}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { if (!fallbackToOriginalSrc(e)) e.currentTarget.style.visibility = "hidden"; }}
                    />
                  ) : <span className="sc-oc-ini">{initials(p.name)}</span>}
                </span>
                <span className="sc-oc-t">
                  <span className="sc-oc-n">{p.name}</span>
                  <span className="sc-oc-c" lang={p.roleLang}>{p.role}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
