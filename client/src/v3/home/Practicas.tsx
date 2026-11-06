/* «Nuestras prácticas»: el efecto «Trending Content» de la home de Baker McKenzie (demo v3, módulo
   practicas, bloque #pr-practicas; el que le gustó a Mario). Un solo bloque a todo lo ancho con UN fondo
   común (el degradado marino que deriva despacio) cortado por líneas de 1 px; al señalar o enfocar un
   cuadro, el fondo de todo el bloque se funde a la foto de su práctica bajo un velo y sube un panel
   #0F3F6B con filete lima solo en ese cuadro. Con toque o bajo 768 px, cada cuadro lleva su foto y un
   toque abre la práctica. Las cuatro prácticas, sus nombres y resúmenes vienen de la base
   (/api/practice-groups, editable en el panel); mientras responde, los del contenido del Inicio. */
import { useMemo, useRef, type CSSProperties } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { PracticeGroup } from "@shared/schema";
import { useCmsContent } from "@/hooks/useCmsContent";
import { home26 } from "@/components/home26/content";
import { useV3Module, type V3Lang } from "@/v3/shared";
import { homeCopy, PRACTICE_PHOTOS } from "./copy";
import { initPracticas } from "./scripts";

export type PracticeItem = { slug: string; clave: string; name: string; summary: string; img?: string; w: number; h: number };

/** Las prácticas del sitio (orden del panel), con su foto del bloque. */
export function usePracticeItems(lang: V3Lang): PracticeItem[] {
  const liveHome = useCmsContent("home", home26);
  const { data, isError } = useQuery<PracticeGroup[]>({ queryKey: ["/api/practice-groups"] });
  return useMemo(() => {
    const base = !isError && data && data.length
      ? [...data].filter((g) => g.published !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((g) => ({
          slug: g.slug,
          name: (lang === "es" ? g.nameEs || g.name : g.name) || "",
          summary: (lang === "es" ? g.descriptionEs || g.description : g.description) || "",
        }))
      : liveHome[lang].practicas.items.map((it) => ({ slug: it.slug, name: it.title, summary: it.body }));
    return base.map((p, i) => {
      const ph = PRACTICE_PHOTOS[p.slug];
      return { ...p, clave: ph?.clave ?? `p${i}`, img: ph?.img, w: ph?.w ?? 2000, h: ph?.h ?? 1333 };
    });
  }, [data, isError, lang, liveHome]);
}

export function PracticasBaker({ lang, items }: { lang: V3Lang; items: PracticeItem[] }) {
  const ref = useRef<HTMLElement>(null);
  const t = homeCopy[lang].practicas;
  const key = items.map((p) => p.slug + p.name.length + p.summary.length).join("|");
  useV3Module(ref, initPracticas, [lang, key]);

  return (
    <section ref={ref} className="pr-practicas sobre-azul hm-practicas" id="pr-practicas" aria-labelledby="pr-practicas-titulo">
      {/* Fondo común: el degradado de la firma (en reposo) y una capa por práctica. La nueva entra encima y la anterior se retira después. */}
      <div className="pr-bk-fondos" aria-hidden="true">
        <div className="pr-bk-fluido" />
        {items.map((p) =>
          p.img ? (
            <div key={p.slug} className="pr-bk-fondo" data-clave={p.clave}>
              <img data-no-parallax="" src={p.img} alt="" width={p.w} height={p.h} decoding="async" loading="lazy" />
            </div>
          ) : null,
        )}
      </div>

      <div className="pr-bk-rejilla">
        <div className="pr-bk-cabeza">
          <h2 className="pr-titulo" id="pr-practicas-titulo">{t.titulo}</h2>
          <p className="pr-entrada">{t.entrada}</p>
        </div>

        <ul className="pr-bk-cuadros" role="list">
          {items.map((p) => (
            <li key={p.slug} className="pr-bk-item">
              <Link
                className="pr-bk-cuadro"
                href={`/practice-groups/${p.slug}`}
                data-clave={p.clave}
                aria-describedby={`pr-desc-${p.clave}`}
                /* La foto del cuadro con toque o bajo 768 px (sin panel); con cursor fino no se usa */
                style={p.img ? ({ "--pr-bk-foto": `url(${p.img})` } as CSSProperties) : undefined}
              >
                <h3 className="pr-bk-nombre">{p.name}</h3>
                <div className="pr-bk-panel" aria-hidden="true">
                  <div className="pr-bk-dentro">
                    <p className="pr-bk-ptitulo">{p.name}</p>
                    <p className="pr-bk-desc" id={`pr-desc-${p.clave}`}>{p.summary}</p>
                  </div>
                  <span className="pr-bk-ver">{t.ver}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
