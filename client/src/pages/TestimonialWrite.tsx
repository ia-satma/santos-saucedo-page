import { useEffect, useMemo, useState, type FormEvent } from "react";
import "@/styles/careers-contact.css";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Eyebrow } from "@/components/editorial";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useSiteDetails } from "@/components/home26/useSiteContact";
import { TESTIMONIAL_QUOTE_MAX } from "@shared/schema";
import { useTestimonialsCopy } from "./Testimonials";

// Formulario del enlace de invitación (/testimonios/escribir?t=…). Solo funciona con un enlace
// vigente y sin usar, que el despacho genera en el panel; se consume al enviar. El comentario
// entra como pendiente y no se publica sin aprobación. No se indexa (SEOHead testimonialWrite).

type Field = "fullName" | "title" | "company" | "quote" | "consent";
const MIN: Record<Exclude<Field, "consent" | "quote">, number> = { fullName: 3, title: 2, company: 2 };
const inputCls = "h-[44px]";
const linkCls = "inline-link text-ss-marino underline decoration-ss-input underline-offset-4 hover:decoration-ss-marino";

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
    <div className="space-y-2">
      <label htmlFor={`testimonial-${key}`} className="block text-[17px] text-ss-tinta">
        {label}
      </label>
      <Input
        id={`testimonial-${key}`}
        className={inputCls}
        value={values[key]}
        maxLength={160}
        autoComplete={autoComplete}
        aria-invalid={!!errors[key] || undefined}
        aria-describedby={errors[key] ? `testimonial-${key}-error` : undefined}
        onChange={(e) => setValues({ ...values, [key]: e.target.value })}
        data-testid={`input-testimonial-${key}`}
      />
      {errors[key] && (
        <p id={`testimonial-${key}-error`} className="text-[15px] text-destructive">
          {errors[key]}
        </p>
      )}
    </div>
  );

  const googleLine = googleReviewsUrl ? (
    <p className="mt-6 text-[18px] leading-[1.55] text-ss-tinta" data-testid="text-google-review-invite">
      {f.googleBefore}
      <a href={googleReviewsUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
        {f.googleLink}
        <span className="sr-only">{` ${t.newTab}`}</span>
      </a>
      {f.googleAfter}
    </p>
  ) : null;

  return (
    <div className="min-h-screen bg-background" data-testid="page-testimonial-write">
      <SEOHead page="testimonialWrite" language={language} customPath="/testimonios/escribir" />
      <Header />
      <main id="main-content">
        <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-testimonial-write-hero">
          <div className="ss-container">
            <div className="max-w-3xl">
              <Eyebrow num="" tone="navy" label={t.title} className="mb-6" />
              <h1 className="mb-5" data-testid="text-testimonial-write-title">
                {state === "invalid" ? f.invalidTitle : f.title}
              </h1>
              {/* Tras enviar, el agradecimiento va abajo; aquí no se repite */}
              {(state === "valid" || state === "checking") && <p>{f.intro}</p>}
            </div>
          </div>
        </section>

        <div className="py-16 lg:py-20">
          <div className="ss-container">
            <div className="max-w-2xl">
              {state === "checking" && (
                <p role="status" className="text-ss-medio">
                  {f.checking}
                </p>
              )}

              {state === "invalid" && (
                <div role="status" data-testid="text-invite-invalid">
                  <p className="text-[19px] leading-[1.6] text-ss-tinta [text-wrap:pretty]">{f.invalidBody}</p>
                  <p className="mt-8">
                    <Link href="/testimonios" className={linkCls}>
                      {t.title}
                    </Link>
                  </p>
                </div>
              )}

              {state === "sent" && (
                <div role="status" data-testid="text-testimonial-sent">
                  <p className="text-[19px] leading-[1.6] text-ss-tinta [text-wrap:pretty]">{f.success}</p>
                  {googleLine}
                </div>
              )}

              {state === "valid" && (
                <form onSubmit={send} noValidate className="public-form-card public-form-card--testimonial space-y-6" data-testid="form-testimonial">
                  {field("fullName", f.fullName, "name")}
                  <div className="grid gap-6 sm:grid-cols-2">
                    {field("title", f.jobTitle, "organization-title")}
                    {field("company", f.company, "organization")}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="testimonial-quote" className="block text-[17px] text-ss-tinta">
                      {f.quote}
                    </label>
                    <Textarea
                      id="testimonial-quote"
                      className="min-h-[200px]"
                      value={values.quote}
                      maxLength={TESTIMONIAL_QUOTE_MAX}
                      aria-invalid={!!errors.quote || undefined}
                      aria-describedby="testimonial-quote-count"
                      onChange={(e) => setValues({ ...values, quote: e.target.value })}
                      data-testid="input-testimonial-quote"
                    />
                    <p id="testimonial-quote-count" className="text-[15px] text-ss-medio" aria-live="polite">
                      {errors.quote ? (
                        <span className="text-destructive">{errors.quote}</span>
                      ) : (
                        fill(f.count, { n: values.quote.length, max: TESTIMONIAL_QUOTE_MAX })
                      )}
                    </p>
                  </div>

                  {/* Autorización obligatoria y, aparte, si se muestra la empresa. El ::before
                      amplía el área táctil de la casilla, como en Contacto */}
                  <div className="space-y-5 border-t border-ss-rule pt-6">
                    <div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="testimonial-consent"
                          checked={consent}
                          onCheckedChange={(v) => setConsent(v === true)}
                          aria-invalid={!!errors.consent || undefined}
                          className="relative mt-[3px] h-5 min-h-0 w-5 border-ss-medio data-[state=checked]:border-primary before:absolute before:-inset-3"
                          data-testid="checkbox-testimonial-consent"
                        />
                        <label htmlFor="testimonial-consent" className="text-[18px] leading-[1.5] text-ss-tinta">
                          {f.consent}
                        </label>
                      </div>
                      {errors.consent && <p className="mt-2 ps-8 text-[15px] text-destructive">{errors.consent}</p>}
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="testimonial-show-company"
                        checked={showCompany}
                        onCheckedChange={(v) => setShowCompany(v === true)}
                        className="relative mt-[3px] h-5 min-h-0 w-5 border-ss-medio data-[state=checked]:border-primary before:absolute before:-inset-3"
                        data-testid="checkbox-testimonial-show-company"
                      />
                      <label htmlFor="testimonial-show-company" className="text-[18px] leading-[1.5] text-ss-tinta">
                        {f.showCompany}
                      </label>
                    </div>
                    <p className="text-[17px] leading-[1.5] text-ss-medio">
                      {f.privacyBefore}
                      <Link href="/privacy-policy" className={linkCls} data-testid="link-testimonial-privacy">
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
                    <p role="alert" className="text-[16px] text-destructive" data-testid="text-testimonial-error">
                      {formError}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="min-h-[44px] w-full px-6 sm:w-auto"
                    disabled={busy}
                    data-testid="button-submit-testimonial"
                  >
                    {busy ? f.sending : f.submit}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
