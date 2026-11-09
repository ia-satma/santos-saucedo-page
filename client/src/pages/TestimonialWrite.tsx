import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useSiteDetails } from "@/components/home26/useSiteContact";
import { TESTIMONIAL_QUOTE_MAX } from "@shared/constants";
import { V3Main } from "@/v3/shared";
import { Flecha } from "@/v3/paginas-extra/piezas";
import { useTestimonialsCopy } from "./Testimonials";

// Formulario del enlace de invitación (/testimonios/escribir?t=…). Solo funciona con un enlace
// vigente y sin usar, que el despacho genera en el panel; se consume al enviar. El comentario
// entra como pendiente y no se publica sin aprobación. No se indexa (SEOHead testimonialWrite).
// Con el lenguaje de la demo v3 (que no tenía esta página): la forma de Contacto, con el título y la entrada a
// la izquierda y el formulario azul de la demo (sh-form, sh-campo, sh-check, sh-btn) a la derecha.

type Field = "fullName" | "title" | "company" | "quote" | "consent";
const MIN: Record<Exclude<Field, "consent" | "quote">, number> = { fullName: 3, title: 2, company: 2 };

export default function TestimonialWrite() {
  const { language, t, form: f } = useTestimonialsCopy();
  const { googleReviewsUrl } = useSiteDetails();
  const token = useMemo(() => new URLSearchParams(window.location.search).get("t") ?? "", []);
  const [state, setState] = useState<"checking" | "valid" | "invalid" | "sent">("checking");
  const [values, setValues] = useState({ fullName: "", title: "", company: "", quote: "", website: "" });
  const [consent, setConsent] = useState(false);
  const [showCompany, setShowCompany] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!/^[A-Za-z0-9_-]{40,64}$/.test(token)) return setState("invalid");
    let alive = true;
    fetch(`/api/testimonials/invite?t=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : { valid: false }))
      .then((d) => alive && setState(d.valid ? "valid" : "invalid"))
      .catch(() => alive && setState("invalid"));
    return () => {
      alive = false;
    };
  }, [token]);

  const fill = (text: string, vars: Record<string, string | number>) =>
    text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

  const validate = () => {
    const next: Partial<Record<Field, string>> = {};
    (Object.keys(MIN) as (keyof typeof MIN)[]).forEach((key) => {
      if (values[key].trim().length < MIN[key]) next[key] = fill(f.required, { min: MIN[key] });
    });
    const q = values.quote.trim().length;
    if (q < 20 || q > TESTIMONIAL_QUOTE_MAX) next.quote = fill(f.quoteLength, { max: TESTIMONIAL_QUOTE_MAX });
    if (!consent) next.consent = f.consentRequired;
    return next;
  };

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      setFormError(f.review);
      document.getElementById(`testimonial-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      const r = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, token, consent: true, showCompany, language }),
      });
      if (r.status === 410) return setState("invalid");
      if (r.status === 429) throw new Error(f.tooMany);
      if (r.status === 400) throw new Error(f.review);
      if (!r.ok) throw new Error(f.failed);
      setState("sent");
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (error) {
      setFormError((error as Error).message || f.failed);
    } finally {
      setBusy(false);
    }
  };

  const field = (key: Exclude<Field, "consent" | "quote">, label: string, autoComplete: string) => (
    <div className="sh-campo">
      <label htmlFor={`testimonial-${key}`}>
        {label}
        <span className="sh-req" aria-hidden="true"> *</span>
      </label>
      <input
        id={`testimonial-${key}`}
        value={values[key]}
        maxLength={160}
        autoComplete={autoComplete}
        aria-required="true"
        aria-invalid={!!errors[key] || undefined}
        aria-describedby={errors[key] ? `testimonial-${key}-error` : undefined}
        onChange={(e) => setValues({ ...values, [key]: e.target.value })}
        data-testid={`input-testimonial-${key}`}
      />
      {errors[key] && (
        <p id={`testimonial-${key}-error`} className="sh-error">
          {errors[key]}
        </p>
      )}
    </div>
  );

  const googleLine = googleReviewsUrl ? (
    <p className="px-google" data-testid="text-google-review-invite">
      {f.googleBefore}
      <a href={googleReviewsUrl} target="_blank" rel="noopener noreferrer">
        {f.googleLink}
        <span className="sr-only">{` ${t.newTab}`}</span>
      </a>
      {f.googleAfter}
    </p>
  ) : null;

  // Enlace inválido: una sola columna (no hay formulario)
  const solo = state === "invalid";

  return (
    <div className="ss26 min-h-[100dvh]" data-testid="page-testimonial-write">
      <SEOHead page="testimonialWrite" language={language} customPath="/testimonios/escribir" />
      <Header />
      <V3Main vista="testimonio-escribir" className="px">
        <section className={`sh-contacto px-escribir${solo ? " px-escribir--solo" : ""}`} aria-labelledby="px-escribir-h" data-testid="section-testimonial-write-hero">
          <div className="sh-wrap sh-contacto__grid">
            <div className="sh-contacto__datos">
              <p className="sh-cap px-escribir__k">{t.title}</p>
              <h1 id="px-escribir-h" className="sh-h2" data-testid="text-testimonial-write-title">
                {state === "invalid" ? f.invalidTitle : f.title}
              </h1>
              {/* Tras enviar, el agradecimiento va en el panel; aquí no se repite */}
              {(state === "valid" || state === "checking") && <p className="px-escribir__p">{f.intro}</p>}

              {state === "invalid" && (
                <div role="status" className="px-escribir__invalido" data-testid="text-invite-invalid">
                  <p className="px-escribir__cuerpo">{f.invalidBody}</p>
                  <p className="px-escribir__volver">
                    <Link href="/testimonios" className="sh-mas">
                      {t.title} <Flecha />
                    </Link>
                  </p>
                </div>
              )}
            </div>

            {state === "checking" && (
              <div className="sh-form px-form">
                <p role="status" className="px-estado">{f.checking}</p>
              </div>
            )}

            {state === "sent" && (
              <div className="sh-form px-form" role="status" data-testid="text-testimonial-sent">
                <p className="sh-form__ok">{f.success}</p>
                {googleLine}
              </div>
            )}

            {state === "valid" && (
              <form onSubmit={send} noValidate className="sh-form px-form" aria-labelledby="px-escribir-h" data-testid="form-testimonial">
                <div className="px-form__f">
                  {field("fullName", f.fullName, "name")}
                  <div className="px-form__par">
                    {field("title", f.jobTitle, "organization-title")}
                    {field("company", f.company, "organization")}
                  </div>
                  <div className="sh-campo">
                    <label htmlFor="testimonial-quote">
                      {f.quote}
                      <span className="sh-req" aria-hidden="true"> *</span>
                    </label>
                    <textarea
                      id="testimonial-quote"
                      rows={7}
                      value={values.quote}
                      maxLength={TESTIMONIAL_QUOTE_MAX}
                      aria-required="true"
                      aria-invalid={!!errors.quote || undefined}
                      aria-describedby="testimonial-quote-count"
                      onChange={(e) => setValues({ ...values, quote: e.target.value })}
                      data-testid="input-testimonial-quote"
                    />
                    <p id="testimonial-quote-count" className="px-cuenta" aria-live="polite">
                      {errors.quote ? (
                        <span className="sh-error">{errors.quote}</span>
                      ) : (
                        fill(f.count, { n: values.quote.length, max: TESTIMONIAL_QUOTE_MAX })
                      )}
                    </p>
                  </div>

                  {/* Autorización obligatoria y, aparte, si se muestra la empresa */}
                  <div className="px-checks">
                    <div>
                      <label className="sh-check">
                        <input
                          type="checkbox"
                          id="testimonial-consent"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          aria-required="true"
                          aria-invalid={!!errors.consent || undefined}
                          aria-describedby={errors.consent ? "testimonial-consent-error" : undefined}
                          data-testid="checkbox-testimonial-consent"
                        />
                        <span>{f.consent}</span>
                      </label>
                      {errors.consent && <p id="testimonial-consent-error" className="sh-error px-check-err">{errors.consent}</p>}
                    </div>
                    <label className="sh-check">
                      <input
                        type="checkbox"
                        id="testimonial-show-company"
                        checked={showCompany}
                        onChange={(e) => setShowCompany(e.target.checked)}
                        data-testid="checkbox-testimonial-show-company"
                      />
                      <span>{f.showCompany}</span>
                    </label>
                    <p className="px-aviso">
                      {f.privacyBefore}
                      <Link href="/privacy-policy" data-testid="link-testimonial-privacy">
                        {f.privacyLink}
                      </Link>
                      {f.privacyAfter}
                    </p>
                  </div>

                  {/* Campo trampa, como en Contacto: solo un programa lo rellena */}
                  <div className="sr-only" aria-hidden="true">
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={values.website}
                      onChange={(e) => setValues({ ...values, website: e.target.value })}
                    />
                  </div>

                  {formError && (
                    <p role="alert" className="sh-error" data-testid="text-testimonial-error">
                      {formError}
                    </p>
                  )}
                  <div className="sh-form__acciones">
                    <button type="submit" className="sh-btn" disabled={busy} data-testid="button-submit-testimonial">
                      {busy ? f.sending : f.submit}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>
      </V3Main>
      <Footer />
    </div>
  );
}
