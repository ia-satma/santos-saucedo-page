/* Piezas comunes de las páginas que no tenían equivalente en la demo v3. Ver ./paginas-extra.css. */
import "./paginas-extra.css";
import { useRef, type ReactNode } from "react";
import i18n from "@/i18n";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useCmsMedia, mediaDefaults } from "@/lib/cmsMedia";
import { chrome26 } from "@/components/home26/chrome26";
import type { LanguageCode } from "@shared/schema";
import { useV3Module } from "@/v3/shared";

/** Etiqueta «Siguiente» de V3NextPage en cada idioma (la misma de los botones del sitio) */
export const nextLabel = (language: LanguageCode) => i18n.getFixedT(language)("cta.next");

/** Textos del menú y del pie en el idioma de la página (panel, sección "chrome") */
export function useChrome(language: LanguageCode) {
  const chrome = useCmsContent("chrome", chrome26);
  return chrome[language] ?? chrome.en;
}

type PhotoKey = keyof typeof mediaDefaults.photos;
/** Foto de la oficina del catálogo del panel, con su srcset y el texto alternativo de la galería */
export function useFotoOficina() {
  const media = useCmsMedia();
  return (key: PhotoKey, language: LanguageCode, fallbackAlt = "Santos & Saucedo") => {
    const p = media.photos[key];
    const item = media.officeGallery.find((g) => g.photo === key);
    const alt = (language === "es" ? item?.altEs : item?.alt) || fallbackAlt;
    return {
      src: p.url,
      srcSet: p.smallUrl && p.smallUrl !== p.url ? `${p.smallUrl} 768w, ${p.url} 1536w` : undefined,
      alt,
      /** El texto alternativo de la galería solo existe en español e inglés */
      altIsEnglish: language !== "es" && !!item?.alt,
    };
  };
}

/** Banda azul con foto de la demo (sh-filo): la foto se asienta una vez al entrar (no en Modo Mario: demo.css) */
function initVisto(el: HTMLElement): () => void {
  if (!("IntersectionObserver" in window)) {
    el.classList.add("is-visto");
    return () => {};
  }
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) {
        el.classList.add("is-visto");
        io.disconnect();
      }
    });
  }, { threshold: 0.25 });
  io.observe(el);
  return () => io.disconnect();
}

export function BandaFoto({
  img, labelledBy, children, testId,
}: {
  img: { src: string; srcSet?: string };
  labelledBy: string;
  children: ReactNode;
  testId?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useV3Module(ref, initVisto);
  return (
    <section ref={ref} className="sh-filo sobre-azul px-banda" aria-labelledby={labelledBy} data-testid={testId}>
      <figure className="sh-filo__foto" aria-hidden="true">
        <img src={img.src} srcSet={img.srcSet} sizes="(min-width: 1001px) 60vw, 100vw" alt="" width={1536} height={1024} loading="lazy" decoding="async" />
      </figure>
      <div className="sh-wrap sh-filo__in">{children}</div>
    </section>
  );
}

/** Flecha de los enlaces de texto (en árabe la espeja el CSS) */
export const Flecha = ({ c = "→" }: { c?: string }) => <span aria-hidden="true" className="px-flecha">{c}</span>;
