import { useQuery } from "@tanstack/react-query";
import defaults from "@shared/cms-defaults.json";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useSiteDetails } from "@/components/home26/useSiteContact";
import type { LanguageCode } from "@shared/schema";
import { V3Main, V3NextPage, V3PageHeader } from "@/v3/shared";
import { Flecha, nextLabel, useChrome, useFotoOficina } from "@/v3/paginas-extra/piezas";

// Testimonios (junta 16-10-2026): muro sobrio de comentarios de clientes que el despacho
// aprobó. Cada uno es una cita en la romana, con nombre, puesto y, si el cliente lo autorizó,
// empresa. Sin estrellas, fotos, contadores ni llamadas a contratar: la firma no persigue al
// cliente; los elogios son de terceros. Textos editables en el panel (sección "testimonials").
// Con el lenguaje de la demo v3 (que no tenía esta página): cabecera con foto del vestíbulo y las citas
// sobre la banda azul de la demo («Lo que opinan nuestros clientes», pe-op): la primera grande y las
// demás en dos columnas.

export interface PublicTestimonial {
  id: string;
  quote: string;
  authorName: string;
  authorTitle: string;
  company: string;
  rating: number;
}

type Copy = (typeof defaults.testimonials)["es"];
export type TestimonialsCopy = typeof defaults.testimonials;

export function useTestimonialsCopy() {
  const { language } = useLanguage();
  const copy = useCmsContent("testimonials", defaults.testimonials);
  const t: Copy = (copy as unknown as Record<string, Copy>)[language] ?? copy.en;
  return { language, t, form: copy.form[language === "es" ? "es" : "en"] };
}

export default function Testimonials() {
  const { language, t } = useTestimonialsCopy();
  const { googleReviewsUrl } = useSiteDetails();
  const { data, isLoading, isError } = useQuery<PublicTestimonial[]>({
    queryKey: ["/api/testimonials"],
    staleTime: 60000,
  });
  const items = data ?? [];
  // Comillas de cada idioma: angulares en español, francés, italiano y ruso
  const [open, close] = ["es", "fr", "it", "ru"].includes(language)
    ? ["«", "»"]
    : language === "de"
      ? ["„", "“"]
      : ["zh", "ja"].includes(language)
        ? ["「", "」"]
        : ["“", "”"];

  const chrome = useChrome(language as LanguageCode);
  const foto = useFotoOficina();
  const vestibulo = foto("vestibulo2", language as LanguageCode);
  const monitor = chrome.nav.find((n) => n.href === "/news")?.label ?? chrome.nav[3].label;
  const cita = (item: PublicTestimonial, destacado = false) => {
    const role = [item.authorTitle, item.company].filter(Boolean).join(", ");
    return (
      <figure className={`px-test__uno${destacado ? " px-test__uno--destacado" : ""}`} data-testid={`testimonial-${item.id}`}>
        <div className="text-sm tracking-[0.18em] text-amber-500" aria-label={`${item.rating || 5} de 5 estrellas`} data-testid={`testimonial-rating-${item.id}`}>
          {"★".repeat(Math.min(5, Math.max(1, item.rating || 5)))}
          <span className="sr-only">{item.rating || 5} de 5 estrellas</span>
        </div>
        <blockquote className="px-test__q">
          <p>{`${open}${item.quote}${close}`}</p>
        </blockquote>
        <figcaption className="px-test__who">
          <strong>{item.authorName}</strong>
          {role ? <span>{role}</span> : null}
        </figcaption>
      </figure>
    );
  };
  const [primero, ...resto] = items;

  return (
    <div className="ss26 min-h-[100dvh]" data-testid="page-testimonials">
      <SEOHead page="testimonials" language={language} />
      <Header />
      <V3Main vista="testimonios" className="px">
        <div data-testid="section-testimonials-hero">
          <V3PageHeader
            id="px-testimonios-h"
            img={vestibulo.src}
            alt={vestibulo.alt}
            width={1536}
            height={1024}
            position="50% 62%"
            title={<span data-testid="text-testimonials-title">{t.title}</span>}
            lead={<span data-testid="text-testimonials-intro">{t.intro}</span>}
          >
            {/* Enlace discreto al Perfil de Negocio de Google, solo si el despacho lo configuró */}
            {googleReviewsUrl ? (
              <p className="px-cab-enlaces">
                <a href={googleReviewsUrl} target="_blank" rel="noopener noreferrer" className="sh-mas" data-testid="link-google-reviews">
                  {t.googleLink}
                  <span className="sr-only">{` ${t.newTab}`}</span>
                  <Flecha c="↗" />
                </a>
              </p>
            ) : null}
          </V3PageHeader>
        </div>

        {isError ? (
          <section className="px-test-vacio" aria-label={t.title}>
            <div className="sh-wrap">
              <div className="px-filete">
                <p role="status">{t.error}</p>
              </div>
            </div>
          </section>
        ) : !isLoading && items.length === 0 ? (
          <section className="px-test-vacio" aria-label={t.title}>
            <div className="sh-wrap">
              <div className="px-filete">
                <p role="status" data-testid="text-testimonials-empty">{t.empty}</p>
              </div>
            </div>
          </section>
        ) : isLoading ? (
          // Mientras llegan, sin banda vacía: el filete de la sección y nada más
          <section className="px-test-vacio" aria-label={t.title} aria-busy="true">
            <div className="sh-wrap">
              <div className="px-filete" data-testid="list-testimonials" />
            </div>
          </section>
        ) : (
          // Las citas sobre la banda azul de la demo; cada una entera (no se parte entre columnas)
          <section className="px-test sobre-azul" aria-labelledby="px-testimonios-h">
            <div className="sh-wrap" data-testid="list-testimonials">
              {primero ? cita(primero, true) : null}
              {resto.length ? (
                <ul className="px-test__lista px-test__resto">
                  {resto.map((item) => <li key={item.id}>{cita(item)}</li>)}
                </ul>
              ) : null}
            </div>
          </section>
        )}

        <V3NextPage href="/news" title={monitor} label={nextLabel(language as LanguageCode)} ariaLabel={t.title} />
      </V3Main>
      <Footer />
    </div>
  );
}
