/* «Nuestras oficinas» de la demo v3 (contacto): el mosaico de seis fotos de la oficina, cada una se
   descubre una vez al entrar (shell.js), y al final el mapa que la página ya tenía. Fotos: las del
   sitio (panel → Medios, las mismas de /offices); textos del panel donde existen en 10 idiomas. */
import { useRef } from "react";
import { Link } from "wouter";
import cmsDefaults from "@shared/cms-defaults.json";
import type { LanguageCode } from "@shared/schema";
import { useCmsMedia, type mediaDefaults } from "@/lib/cmsMedia";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOfficeLabel } from "@/lib/officeLabel";
import { useV3Lang, useV3Module } from "@/v3/shared";
import { CT, type FotoClave } from "./textos";

type MediaFoto = keyof typeof mediaDefaults.photos;
type OfficesCms = Record<string, { intro?: string; alt?: Record<string, string> }>;

/* Orden y foto del panel de cada lugar del mosaico. La «biblioteca» de la demo es la foto del librero
   junto a la escalera (oficina-escalera en Medios). alt: la clave del texto alternativo en el panel
   (sección «offices»); si no hay, el de la galería de Medios o el de la demo. */
const FOTOS: { k: FotoClave; foto: MediaFoto; alt?: string; w: number; h: number; sizes: string }[] = [
  { k: "fachada", foto: "fachada", alt: "fachada", w: 1159, h: 900, sizes: "(min-width: 1416px) 720px, (min-width: 901px) 56vw, 92vw" },
  { k: "vestibulo", foto: "vestibulo", alt: "vestibulo", w: 1536, h: 1024, sizes: "(min-width: 1416px) 510px, (min-width: 901px) 40vw, (min-width: 561px) 46vw, 92vw" },
  { k: "trabajo", foto: "areaTrabajo", alt: "areaTrabajo", w: 1536, h: 1024, sizes: "(min-width: 1416px) 510px, (min-width: 901px) 40vw, (min-width: 561px) 46vw, 92vw" },
  { k: "escultura", foto: "escultura", alt: "escultura", w: 1024, h: 1536, sizes: "(min-width: 1416px) 300px, (min-width: 901px) 24vw, (min-width: 561px) 30vw, 92vw" },
  { k: "biblioteca", foto: "escalera", w: 1536, h: 1024, sizes: "(min-width: 1416px) 410px, (min-width: 901px) 32vw, (min-width: 561px) 62vw, 92vw" },
  { k: "mezanine", foto: "mezanine", w: 1536, h: 1024, sizes: "(min-width: 1416px) 510px, (min-width: 901px) 40vw, 92vw" },
];

/* La entrada de la demo: cada foto se descubre de abajo hacia arriba, en orden, una sola vez. La clase
   sh-js-ofi va en <html>, como en la demo, para que rijan también las reglas del Modo Mario
   (html.rm.sh-js-ofi: solo un fundido). */
function initOficinas(sec: HTMLElement): (() => void) | void {
  if (!("IntersectionObserver" in window)) return;
  const html = document.documentElement;
  const yaEstaba = html.classList.contains("sh-js-ofi");
  html.classList.add("sh-js-ofi");
  const figs = Array.from(sec.querySelectorAll<HTMLElement>(".sh-ofi__f"));
  const io = new IntersectionObserver((es) => {
    es.filter((e) => e.isIntersecting)
      .map((e) => e.target as HTMLElement)
      .sort((a, b) => figs.indexOf(a) - figs.indexOf(b))
      .forEach((f, i) => { f.style.setProperty("--d", `${i * 110}ms`); f.classList.add("is-visto"); io.unobserve(f); });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
  figs.forEach((f) => io.observe(f));
  return () => { io.disconnect(); if (!yaEstaba) html.classList.remove("sh-js-ofi"); };
}

export function Oficinas({
  direccion, mapaUrl, mapaTitulo,
}: {
  /** Líneas de la dirección del sitio (useSiteContact) */
  direccion: string[];
  mapaUrl: string;
  mapaTitulo: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useV3Module(ref, initOficinas);
  const { language } = useLanguage();
  const { lang, attrs } = useV3Lang();
  const ct = CT[lang];
  const nativo = language === "es" || language === "en";
  const media = useCmsMedia();
  const offices = useCmsContent("offices", cmsDefaults.offices as OfficesCms);
  const officeAlt = (offices[language] ?? offices.en)?.alt ?? {};
  const officeNameFor = useOfficeLabel();

  // Entrada: «calle, en ciudad» con los datos del sitio (en otros idiomas, la introducción de /offices)
  const calle = direccion[0] ?? "";
  // La ciudad: el primer tramo de la tercera línea del membrete («San Pedro Garza García, N.L.»)
  const ciudad = (direccion[2] ?? "").split(",")[0].trim();
  const lead = nativo
    ? (calle && ciudad ? ct.oficinasLead(calle, ciudad) : ct.oficinasLeadSinDir)
    : (offices[language]?.intro || CT.en.oficinasLeadSinDir);
  const titulo = nativo ? ct.oficinasH : officeNameFor(language);

  const altDe = (f: (typeof FOTOS)[number]): { alt: string; en?: boolean } => {
    if (f.alt && officeAlt[f.alt]) return { alt: officeAlt[f.alt] };
    const g = media.officeGallery.find((x) => x.photo === f.foto);
    if (g && (language === "es" ? g.altEs : g.alt)) return { alt: language === "es" ? g.altEs : g.alt, en: language !== "es" && language !== "en" };
    const txt = f.k === "mezanine" ? ct.altMezanine : ct.altBiblioteca;
    return { alt: txt, en: !nativo };
  };

  return (
    <section ref={ref} className="sh-oficinas" id="oficinas" aria-labelledby="oficinas-h" data-testid="section-contact-offices">
      <div className="sh-wrap sh-oficinas__cab">
        <h2 id="oficinas-h" className="sh-h2">{titulo}</h2>
        <div className="ct-ofi-texto">
          <p className="sh-oficinas__lead">{lead}</p>
          <p className="ct-ofi-mas" {...attrs}>
            <Link href="/offices" data-testid="link-contact-offices">{ct.oficinasMas}</Link>
          </p>
        </div>
      </div>
      <div className="sh-wrap">
        <div className="sh-ofi" data-ofi>
          {FOTOS.map((f) => {
            const m = media.photos[f.foto];
            const { alt, en } = altDe(f);
            const cap = ct.fotos[f.k];
            return (
              <figure key={f.k} className={`sh-ofi__f sh-ofi__f--${f.k}`}>
                <div className="sh-ofi__m">
                  <img
                    src={m.url}
                    srcSet={m.smallUrl && m.smallUrl !== m.url ? `${m.smallUrl} 768w, ${m.url} 1536w` : undefined}
                    sizes={f.sizes}
                    alt={alt}
                    {...(en ? { lang: "en" } : {})}
                    width={f.w}
                    height={f.h}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption {...attrs}><span className="sh-cap">{cap.cap}</span> {cap.txt}</figcaption>
              </figure>
            );
          })}
          {/* El mapa que la página ya tenía (Google Maps, diferido), como última lámina del mosaico */}
          <figure className="sh-ofi__f sh-ofi__f--mapa" data-ui="map" data-testid="panel-contact-map">
            <div className="sh-ofi__m">
              <iframe
                src={mapaUrl}
                title={mapaTitulo}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                data-testid="iframe-contact-map"
              />
            </div>
            <figcaption>
              <span className="sh-cap" {...attrs}>{ct.mapaCap}</span> {direccion.slice(0, 2).join(", ")}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
