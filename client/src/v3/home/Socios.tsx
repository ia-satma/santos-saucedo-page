/* «Nuestros socios» (demo v3, sh-socini): los nombres en grande como índice y, a la izquierda, el
   retrato del socio activo, que cambia solo cada 4.2 s con la línea de turno; se detiene con el cursor
   o el foco en la lista y en modo Mario. Siempre los cuatro, en el orden de la firma. Nombres, cargos y
   retratos de la base (/api/team) con los recortes WebP del sitio (teamPhotoSources); Mario Saucedo
   Rodríguez con el trato del sitio: «Socio fundador (in memoriam)» sin partirse y su retrato a color. */
import { useMemo, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { TeamMember } from "@shared/schema";
import { CONFIRMED_PARTNER_SLUGS, fallbackToOriginalSrc, getTeamPhotoSrcSet } from "@/lib/teamPhotoSources";
import { useV3Module, type V3Lang } from "@/v3/shared";
import { homeCopy, PARTNERS_FALLBACK } from "./copy";
import { initSocini } from "./scripts";

type Partner = { slug: string; name: string; role: string; imageUrl: string };

const memoriam = (r: string) => r.replace(/\((in)\s+(memoriam)\)/gi, "($1 $2)");

function usePartners(lang: V3Lang): Partner[] {
  const { data, isError } = useQuery<TeamMember[]>({ queryKey: ["/api/team"] });
  return useMemo(() => {
    const bySlug = new Map((!isError && data ? data : []).map((m) => [m.slug, m]));
    return PARTNERS_FALLBACK.filter((p) => CONFIRMED_PARTNER_SLUGS.has(p.slug)).map((p) => {
      const m = bySlug.get(p.slug);
      const role = (lang === "es" ? m?.titleEs || m?.title : m?.title) || p[lang];
      return { slug: p.slug, name: m?.name || p.name, role: memoriam(role), imageUrl: m?.imageUrl || p.imageUrl };
    });
  }, [data, isError, lang]);
}

export function SociosBand({ lang }: { lang: V3Lang }) {
  const ref = useRef<HTMLElement>(null);
  const t = homeCopy[lang].socios;
  const people = usePartners(lang);
  useV3Module(ref, initSocini, [people.map((p) => p.slug + p.imageUrl).join("|")]);

  return (
    <section ref={ref} className="sh-socini" aria-labelledby="ini-socios-h" data-socini="">
      <div className="sh-wrap sh-socini__grid">
        <div className="sh-socini__cab">
          <h2 id="ini-socios-h" className="sh-h2">{t.titulo}</h2>
          <figure className="sh-socini__foto" aria-hidden="true">
            {people.map((p, i) => {
              const srcSet = getTeamPhotoSrcSet(p.imageUrl);
              return (
                <img
                  data-no-parallax=""
                  key={p.slug}
                  src={p.imageUrl}
                  {...(srcSet ? { srcSet, sizes: "(min-width: 1001px) 380px, (min-width: 601px) 40vw, 300px" } : {})}
                  alt=""
                  width={652}
                  height={652}
                  loading="lazy"
                  decoding="async"
                  data-i={i}
                  className={i === 0 ? "is-on" : undefined}
                  onError={fallbackToOriginalSrc}
                />
              );
            })}
          </figure>
        </div>
        <div className="sh-socini__der">
          <ul className="sh-socini__lista" role="list">
            {people.map((p, i) => (
              <li key={p.slug}>
                <Link href={`/team/${p.slug}`} data-i={i}>
                  <span className="sh-socini__n">{p.name}</span>
                  <span className="sh-socini__c">{p.role}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link className="sh-boton" href="/team">{t.boton}</Link>
        </div>
      </div>
    </section>
  );
}
