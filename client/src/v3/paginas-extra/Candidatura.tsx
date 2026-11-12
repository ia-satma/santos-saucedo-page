/* Formulario de candidatura (Carreras y Pasantías S&S) con la forma del formulario de la demo v3
   (sh-form, sh-campo, sh-check, sh-btn: panel azul, campos con filete, botón claro).
   El envío es el mismo de features/public-forms/CareerForm: POST multipart a /api/careers/apply con
   el CV en PDF (máximo 10 MB), el idioma del visitante, el consentimiento y el campo trampa; los textos
   y el interruptor del panel (forms.careers: activo, mensaje si no lo está, rótulos es/en). */
import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import defaults from "@shared/cms-defaults.json";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useV3Lang } from "@/v3/shared";
import { PX } from "./textos";

const MAX_CV = 10 * 1024 * 1024;

export function Candidatura({ source = "careers", idPrefix }: { source?: string; idPrefix: string }) {
  const { language } = useLanguage();
  const { locale, attrs } = useV3Lang();
  const T = PX[locale];
  const settings = useCmsContent("forms", defaults.forms).careers;
  // Rótulos del panel en español e inglés; en los demás idiomas, el inglés (y el bloque lo declara)
  const t = settings.labels[language as "es" | "en"] || settings.labels.en;
  const formAttrs = language === "es" || language === "en" ? {} : attrs;
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  // Nombre del PDF elegido, a la vista junto al botón
  const [archivo, setArchivo] = useState("");
  const id = (k: string) => `${idPrefix}-${k}`;

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const body = new FormData(form);
    const file = body.get("cv");
    if (!(file instanceof File) || !file.size || file.size > MAX_CV) {
      setError(t.error);
      return;
    }
    body.set("preferredLanguage", language);
    body.set("consent", body.get("consent") === "true" ? "true" : "false");
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/careers/apply", { method: "POST", body });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || t.error);
      setSuccess(true);
      form.reset();
      setArchivo("");
    } catch (err) {
      setError(`${t.error} ${(err as Error).message === t.error ? "" : (err as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  // Formulario apagado en el panel: el mismo panel azul con su título y el mensaje del panel
  if (!settings.enabled)
    return (
      <div className="sh-form px-form px-form--off" data-testid="career-application-form-disabled" {...formAttrs}>
        <h3 className="sh-form__h">{t.title}</h3>
        <p role="status" className="sh-form__ok">
          {settings.disabledMessage[language as "es" | "en"] || settings.disabledMessage.en}
        </p>
      </div>
    );

  const req = <span className="sh-req" aria-hidden="true"> *</span>;
  const campo = (key: "fullName" | "email" | "phone" | "interest") => (
    <div className="sh-campo" key={key}>
      <label htmlFor={id(key)}>
        {key === "fullName" ? t.name : t[key]}
        {key === "fullName" || key === "email" ? req : null}
      </label>
      <input
        id={id(key)}
        name={key}
        type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
        required={key === "fullName" || key === "email"}
        minLength={key === "fullName" ? 2 : undefined}
        maxLength={key === "fullName" ? 200 : key === "email" ? 254 : key === "phone" ? 60 : 180}
        autoComplete={key === "fullName" ? "name" : key === "email" ? "email" : key === "phone" ? "tel" : "off"}
      />
    </div>
  );

  return (
    <section
      className="sh-form px-form"
      aria-labelledby={id("h")}
      data-testid="career-application-form"
      {...formAttrs}
    >
      <h3 id={id("h")} className="sh-form__h">{t.title}</h3>
      {success ? (
        <p role="status" className="sh-form__ok">{t.success}</p>
      ) : (
        <form onSubmit={send} className="px-form__f">
          <div className="px-form__par">
            {campo("fullName")}
            {campo("email")}
          </div>
          <div className="px-form__par">
            {campo("phone")}
            {campo("interest")}
          </div>
          <div className="sh-campo">
            <label htmlFor={id("message")}>{t.message}</label>
            <textarea id={id("message")} name="message" rows={4} maxLength={12000} />
          </div>
          {/* El campo nativo cubre la fila (transparente): se abre con un clic o el teclado y admite arrastrar
              el PDF; encima se ven el botón de la demo y el nombre del archivo en el idioma de la página */}
          <div className="sh-campo px-archivo">
            <label htmlFor={id("cv")}>{t.cv}{req}</label>
            <div className="px-archivo__fila">
              <input
                id={id("cv")}
                name="cv"
                type="file"
                accept="application/pdf,.pdf"
                required
                aria-describedby={id("cv-nombre")}
                onChange={(e) => setArchivo(e.currentTarget.files?.[0]?.name ?? "")}
              />
              <span className="px-archivo__btn" aria-hidden="true">{T.elegirArchivo}</span>
              <span id={id("cv-nombre")} className={`px-archivo__nombre${archivo ? " is-lleno" : ""}`}>{archivo || T.sinArchivo}</span>
            </div>
          </div>
          {/* Campo trampa: solo un programa lo rellena */}
          <div className="hidden" aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <label className="sh-check">
            <input name="consent" type="checkbox" value="true" required />
            <span>
              <Link href="/privacy-policy" target="_blank">{t.consent}</Link>
            </span>
          </label>
          {error ? <p role="alert" className="sh-error">{error}</p> : null}
          <div className="sh-form__acciones">
            <button type="submit" className="sh-btn" disabled={busy} data-testid={`submit-application-${source}`}>
              {busy ? t.sending : t.submit}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
