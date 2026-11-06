/* Baja del Monitor Laboral (/newsletter/unsubscribe?token=…) con el diseño de la demo v3, como la
   suscripción: el título y la frase a la izquierda y, en el panel azul, la confirmación. La baja es la de
   siempre: POST /api/newsletter/unsubscribe con el token del enlace del correo. Textos: panel «forms»
   (unsubscribe, en español e inglés). */
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsContent } from "@/hooks/useCmsContent";
import defaults from "@shared/cms-defaults.json";
import { chrome26 } from "@/components/home26/chrome26";
import { V3Main, V3NextPage } from "@/v3/shared";
import { etiquetaSiguiente } from "@/v3/paginas-sitio/textos";
import "@/v3/paginas-sitio/paginas.css";

export default function NewsletterUnsubscribe() {
  const { language } = useLanguage();
  const copy = useCmsContent("forms", defaults.forms).unsubscribe;
  const t = copy[language as "es" | "en"] || copy.en;
  // Fuera del español y el inglés, el texto es el inglés del panel: va marcado como tal
  const textLang = language === "es" || language === "en" ? undefined : "en";
  // Página siguiente: el Monitor Laboral, con la etiqueta del menú (nav[3]) en cada idioma
  const liveChrome = useCmsContent("chrome", chrome26);
  const nav = (liveChrome[language as keyof typeof chrome26] ?? liveChrome.en).nav;
  const nextLabel = etiquetaSiguiente(language);
  const [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState(false);
  const submit = async () => {
    setBusy(true);
    setError(false);
    try {
      const r = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: new URLSearchParams(window.location.search).get("token"),
        }),
      });
      if (!r.ok) throw new Error();
      setDone(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="ss26 min-h-screen" data-testid="page-newsletter-unsubscribe">
      <Header />
      <V3Main vista="boletin">
        <div className="ps">
          <section className="sh-contacto ps-bol ps-bol--baja" aria-labelledby="baja-h">
            <div className="sh-wrap sh-contacto__grid" lang={textLang}>
              <div className="sh-contacto__datos">
                <h1 id="baja-h" className="sh-h2" tabIndex={-1}>{t.title}</h1>
              </div>
              <div className="sh-form">
                {done ? (
                  <p role="status" className="ps-bol__ok" data-testid="text-unsubscribe-success">{t.success}</p>
                ) : (
                  <>
                    <p className="ps-bol__ok">{t.body}</p>
                    <button type="button" className="sh-btn" disabled={busy} onClick={() => void submit()} data-testid="button-unsubscribe">
                      {t.submit}
                    </button>
                  </>
                )}
                {error && <p role="alert" className="sh-error" data-testid="text-unsubscribe-error">{t.error}</p>}
              </div>
            </div>
          </section>

          <V3NextPage href="/news" label={nextLabel} title={nav[3].label} ariaLabel={nextLabel} />
        </div>
      </V3Main>
      <Footer />
    </div>
  );
}
