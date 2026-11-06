/* «Nuestras prácticas»: el efecto «Trending Content» de la home de Baker McKenzie (demo v3, módulo
   practicas, bloque #pr-practicas; el que le gustó a Mario). Un solo bloque a todo lo ancho con UN fondo
   común (el degradado marino que deriva despacio) cortado por líneas de 1 px; al señalar o enfocar un
   cuadro, el fondo de todo el bloque se funde a la foto de su práctica bajo un velo y sube un panel
   #0F3F6B con filete lima solo en ese cuadro. Con toque o bajo 768 px, cada cuadro lleva su foto y un
   toque abre la práctica. Las cuatro prácticas, sus nombres y resúmenes vienen de la base
   (/api/practice-groups, editable en el panel); mientras responde, los del contenido del Inicio. */
import { useMemo, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { PracticeGroup } from "@shared/schema";
import { useCmsContent } from "@/hooks/useCmsContent";
import { home26 } from "@/components/home26/content";
import { useV3Module, v3SrcSet, type V3Lang } from "@/v3/shared";
import { homeCopy, PRACTICE_PHOTOS } from "./copy";
import { initPracticas } from "./scripts";

// Tamaños de las fotos: el cuadro mide ~294 px hasta 588 px de ancho y medio ancho después; el fondo
// (que en teléfono aparece un instante al tocar) elige el mismo archivo que el cuadro
const CUADRO_SIZES = "(max-width: 588px) 294px, 50vw";
const FONDO_SIZES = "(max-width: 588px) 294px, (max-width: 767.98px) or (hover: none) or (pointer: coarse) 50vw, 100vw";

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
  // El titular, del panel (home.practicas.title); la entrada y «Ver la práctica», de copy.ts
  const titulo = useCmsContent("home", home26)[lang].practicas.title;
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
              <img data-no-parallax="" src={p.img} srcSet={v3SrcSet(p.img, p.w)} sizes={FONDO_SIZES} alt="" width={p.w} height={p.h} decoding="async" loading="lazy" />
            </div>
          ) : null,
        )}
      </div>

      <div className="pr-bk-rejilla">
        <div className="pr-bk-cabeza">
          <h2 className="pr-titulo" id="pr-practicas-titulo">{titulo}</h2>
          <p className="pr-entrada">{t.entrada}</p>
        </div>

        <ul className="pr-bk-cuadros" role="list">
          {items.map((p) => (
            <li key={p.slug} className="pr-bk-item">
              <Link
                className="pr-bk-cuadro"
                href={`/practice-groups/${p.slug}`}
                data-clave={p.clave}
                aria-describedby={p.summary ? `pr-desc-${p.clave}` : undefined}
              >
                {/* La foto del cuadro con toque o bajo 768 px (sin panel): una <img> diferida en lugar
                    del fondo CSS de demo.css (que no se difiere); con cursor fino no se muestra ni se
                    descarga. Mismo encuadre y velo (home.css). */}
                {p.img ? (
                  <img className="hm-bk-foto" data-no-parallax="" src={p.img} srcSet={v3SrcSet(p.img, p.w)} sizes={CUADRO_SIZES} alt="" width={p.w} height={p.h} loading="lazy" decoding="async" />
                ) : null}
                <h3 className="pr-bk-nombre">{p.name}</h3>
                <div className="pr-bk-panel" aria-hidden="true">
                  <div className="pr-bk-dentro">
                    <p className="pr-bk-ptitulo">{p.name}</p>
                    <p className="pr-bk-desc">{p.summary}</p>
                  </div>
                  <span className="pr-bk-ver">{t.ver}</span>
                </div>
              </Link>
              {/* La descripción del enlace, fuera del panel (que es aria-hidden): oculta a la vista */}
              {p.summary ? <span className="sh-sr" id={`pr-desc-${p.clave}`}>{p.summary}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
