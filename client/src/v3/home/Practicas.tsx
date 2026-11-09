/* «Nuestras prácticas»: el efecto «Trending Content» de la home de Baker McKenzie (demo v3, módulo
   practicas, bloque #pr-practicas; el que le gustó a Mario). Un solo bloque a todo lo ancho con UN fondo
   común (el degradado marino que deriva despacio) cortado por líneas de 1 px; al señalar o enfocar un
   cuadro, el fondo de todo el bloque se funde a la foto de su práctica bajo un velo y sube un panel
   #0F3F6B con filete lima solo en ese cuadro. Con toque o bajo 768 px, cada cuadro lleva su foto y un
   toque abre la práctica. Las cuatro prácticas, sus nombres y resúmenes vienen de la base
   (/api/practice-groups, editable en el panel); mientras responde, los del contenido del Inicio. */
import { useFotosDiferidas } from "@/v3/fotosDiferidas";
import { useMemo, useRef, type ReactNode } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { PracticeGroup } from "@shared/schema";
import { useCmsContent } from "@/hooks/useCmsContent";
import { home26 } from "@/components/home26/content";
import { useV3Module, v3SrcSet, type V3Lang } from "@/v3/shared";
import { homeCopy, PRACTICE_PHOTOS } from "./copy";
import { initPracticas } from "./scripts";
// La foto de cada cuadro en el teléfono (hm-bk-foto): también la usa la página de Prácticas
import "./home.css";

// Tamaños de las fotos: el cuadro mide ~294 px hasta 588 px de ancho y medio ancho después; el fondo
// (que en teléfono aparece un instante al tocar) elige el mismo archivo que el cuadro
const CUADRO_SIZES = "(max-width: 588px) 294px, 50vw";
const FONDO_SIZES = "(max-width: 588px) 294px, (max-width: 767.98px) or (hover: none) or (pointer: coarse) 50vw, 100vw";

export type PracticeItem = {
  slug: string; clave: string; name: string; summary: string; img?: string; w: number; h: number;
  /** Fuera de ES/EN, el nombre o el resumen que se quedan en inglés lo declaran (lang="en") */
  nameLang?: string; summaryLang?: string;
};

/** La página de Prácticas usa el mismo bloque como cabecera: su h1 y su entrada en lugar del titular del
    Inicio, el nombre de cada práctica como h2 y la descripción también a la vista en teléfono y con toque. */
export type PaginaPracticas = { titulo: ReactNode; entrada: ReactNode; id: string; verAttrs?: { lang?: string; dir?: "ltr" } };

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

export function PracticasBaker({ lang, items, pagina }: { lang: V3Lang; items: PracticeItem[]; pagina?: PaginaPracticas }) {
  const ref = useRef<HTMLElement>(null);
  const t = homeCopy[lang].practicas;
  // El titular, del panel (home.practicas.title); la entrada y «Ver la práctica», de copy.ts
  const titulo = useCmsContent("home", home26)[lang].practicas.title;
  const key = items.map((p) => p.slug + p.name.length + p.summary.length).join("|");
  useV3Module(ref, initPracticas, [lang, key]);
  const tituloId = pagina?.id ?? "pr-practicas-titulo";
  const Nombre = pagina ? "h2" : "h3";
  // En el Inicio las fotos esperan a la portada; en «Prácticas» este bloque es la cabecera y van de inmediato
  const fotos = useFotosDiferidas(!pagina);

  return (
    <section ref={ref} className={`pr-practicas sobre-azul hm-practicas${pagina ? " pg-bk" : ""}`} id="pr-practicas" aria-labelledby={tituloId} data-testid={pagina ? "section-practice-groups-hero" : undefined}>
      {/* Fondo común: el degradado de la firma (en reposo) y una capa por práctica. La nueva entra encima y la anterior se retira después. */}
      <div className="pr-bk-fondos" aria-hidden="true">
        <div className="pr-bk-fluido" />
        {items.map((p) =>
          p.img ? (
            <div key={p.slug} className="pr-bk-fondo" data-clave={p.clave}>
              <img data-no-parallax="" src={fotos ? p.img : undefined} srcSet={fotos ? v3SrcSet(p.img, p.w) : undefined} sizes={FONDO_SIZES} alt="" width={p.w} height={p.h} decoding="async" loading="lazy" />
            </div>
          ) : null,
        )}
      </div>

      <div className="pr-bk-rejilla">
        <div className="pr-bk-cabeza">
          {pagina ? (
            <>
              <h1 className="pr-titulo" id={tituloId} tabIndex={-1} data-testid="text-practice-groups-title">{pagina.titulo}</h1>
              <p className="pr-entrada" data-testid="text-practice-groups-subtitle">{pagina.entrada}</p>
            </>
          ) : (
            <>
              <h2 className="pr-titulo" id={tituloId}>{titulo}</h2>
              <p className="pr-entrada">{t.entrada}</p>
            </>
          )}
        </div>

        <ul className="pr-bk-cuadros" role="list">
          {items.map((p) => {
            const descId = pagina ? `practice-desc-${p.slug}` : `pr-desc-${p.clave}`;
            return (
            <li key={p.slug} className="pr-bk-item" data-testid={pagina ? `card-practice-group-${p.slug}` : undefined}>
              <Link
                className="pr-bk-cuadro"
                href={`/practice-groups/${p.slug}`}
                data-clave={p.clave}
                aria-labelledby={pagina ? `practice-name-${p.slug}` : undefined}
                aria-describedby={p.summary ? descId : undefined}
                data-testid={pagina ? `link-practice-group-${p.slug}` : undefined}
              >
                {/* La foto del cuadro con toque o bajo 768 px (sin panel): una <img> diferida en lugar
                    del fondo CSS de demo.css (que no se difiere); con cursor fino no se muestra ni se
                    descarga. Mismo encuadre y velo (home.css). */}
                {p.img ? (
                  <img className="hm-bk-foto" data-no-parallax="" src={fotos ? p.img : undefined} srcSet={fotos ? v3SrcSet(p.img, p.w) : undefined} sizes={CUADRO_SIZES} alt="" width={p.w} height={p.h} loading="lazy" decoding="async" />
                ) : null}
                <Nombre
                  className="pr-bk-nombre"
                  id={pagina ? `practice-name-${p.slug}` : undefined}
                  lang={p.nameLang}
                  data-testid={pagina ? `text-practice-group-name-${p.slug}` : undefined}
                >
                  {p.name}
                </Nombre>
                {/* Página de Prácticas: la descripción a la vista en teléfono y con toque (sin panel); con
                    cursor fino se esconde y la muestra el panel (PracticeGroups.css) */}
                {pagina && p.summary ? (
                  <p className="pg-bk-resumen" id={descId} lang={p.summaryLang} data-testid={`text-practice-group-desc-${p.slug}`}>{p.summary}</p>
                ) : null}
                <div className="pr-bk-panel" aria-hidden="true">
                  <div className="pr-bk-dentro">
                    <p className="pr-bk-ptitulo" lang={p.nameLang}>{p.name}</p>
                    <p className="pr-bk-desc" lang={p.summaryLang}>{p.summary}</p>
                  </div>
                  <span className="pr-bk-ver" {...(pagina?.verAttrs ?? {})}>{t.ver}</span>
                </div>
              </Link>
              {/* La descripción del enlace, fuera del panel (que es aria-hidden): oculta a la vista */}
              {!pagina && p.summary ? <span className="sh-sr" id={descId}>{p.summary}</span> : null}
            </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
