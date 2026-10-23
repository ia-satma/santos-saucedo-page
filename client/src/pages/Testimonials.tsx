import { useQuery } from "@tanstack/react-query";
import defaults from "@shared/cms-defaults.json";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsContent } from "@/hooks/useCmsContent";
import { Eyebrow } from "@/components/editorial";
import { useSiteDetails } from "@/components/home26/useSiteContact";

// Testimonios (junta 16-10-2026): muro sobrio de comentarios de clientes que el despacho
// aprobó. Cada uno es una cita en la romana, con nombre, puesto y, si el cliente lo autorizó,
// empresa. Sin estrellas, fotos, contadores ni llamadas a contratar: la firma no persigue al
// cliente; los elogios son de terceros. Textos editables en el panel (sección "testimonials").

export interface PublicTestimonial {
  id: string;
  quote: string;
  authorName: string;
  authorTitle: string;
  company: string;
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

  return (
    <div className="min-h-screen bg-background" data-testid="page-testimonials">
      <SEOHead page="testimonials" language={language} />
      <Header />
      <main id="main-content">
        <section className="editorial-page-hero ss-principal-page-hero" data-testid="section-testimonials-hero">
          <div className="ss-container">
            <div className="max-w-3xl">
              <Eyebrow num="" tone="navy" className="mb-6" />
              <h1 className="mb-5" data-testid="text-testimonials-title">
                {t.title}
              </h1>
              <p data-testid="text-testimonials-intro">{t.intro}</p>
              {/* Enlace discreto al Perfil de Negocio de Google, solo si el despacho lo configuró */}
              {googleReviewsUrl && (
                <a
                  href={googleReviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ss-label group relative mt-8 inline-flex items-center gap-3 text-white before:absolute before:inset-x-0 before:-inset-y-3"
                  data-testid="link-google-reviews"
                >
                  <span className="ss-link">{t.googleLink}</span>
                  <span className="sr-only">{` ${t.newTab}`}</span>
                  <span aria-hidden="true" className="ss-arrow">
                    ↗
                  </span>
                </a>
              )}
            </div>
          </div>
        </section>

        <div className="py-16 lg:py-24">
          <div className="ss-container">
            {isError ? (
              <p role="status" className="text-ss-medio">
                {t.error}
              </p>
            ) : !isLoading && items.length === 0 ? (
              <p role="status" className="text-ss-medio" data-testid="text-testimonials-empty">
                {t.empty}
              </p>
            ) : (
              // Muro en una o dos columnas que se recorre al desplazarse. Cada testimonio no se
              // parte entre columnas; filete de 1 px al inicio, como las citas del sitio
              <div
                className="columns-1 gap-x-16 md:columns-2 xl:gap-x-24"
                aria-busy={isLoading || undefined}
                data-testid="list-testimonials"
              >
                {items.map((item) => {
                  const role = [item.authorTitle, item.company].filter(Boolean).join(", ");
                  return (
                    <figure
                      key={item.id}
                      className="mb-14 break-inside-avoid border-s border-ss-rule ps-6 md:mb-16 md:ps-8"
                      data-testid={`testimonial-${item.id}`}
                    >
                      <blockquote>
                        <p className="whitespace-pre-line font-heading text-[clamp(21px,1.9vw,26px)] font-normal leading-[1.42] tracking-[-0.005em] text-ss-marino [text-wrap:pretty]">
                          {`${open}${item.quote}${close}`}
                        </p>
                      </blockquote>
                      <figcaption className="mt-6">
                        <span className="block text-[17px] font-semibold leading-[1.4] text-ss-tinta">
                          {item.authorName}
                        </span>
                        {role && (
                          <span className="mt-1 block text-[16px] leading-[1.45] text-ss-medio">{role}</span>
                        )}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
