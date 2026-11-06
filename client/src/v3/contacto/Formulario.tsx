/* Formulario de contacto en dos pasos de la demo v3 («Sus datos» → «Su asunto» → gracias), con el
   envío real del sitio: POST /api/contact (consentimiento, campo trampa, límite de envíos 429), las
   prácticas de /api/practice-groups, el modo estático (mailto) y los controles del panel (formulario
   activo o no, textos en 10 idiomas). Lo usan la página /contact y la hoja «Escribir» del teléfono. */
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import cmsDefaults from "@shared/cms-defaults.json";
import type { ContactFormData, LanguageCode, PracticeGroup } from "@shared/schema";
import { apiRequest, isStaticSite } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteContact } from "@/components/home26/useSiteContact";
import { usePracticeNames } from "@/lib/practiceNames";
import { isRM, useV3Lang } from "@/v3/shared";
import { CONSENT, CONTACT_CONTENT, CT, FEEDBACK, OTHER_LABEL, OTHER_VALUE, VALIDATION } from "./textos";
import "./contacto.css";

const schemaFor = (language: LanguageCode) => {
  const t = VALIDATION[language] || VALIDATION.en;
  return z.object({
    fullName: z.string().min(1, t.fullNameRequired),
    email: z.string().min(1, t.emailRequired).email(t.emailInvalid),
    // Empresa obligatoria (junta del 5-11-2026); /api/contact la sigue aceptando vacía
    company: z.string().trim().min(1, t.companyRequired),
    // Teléfono opcional, como en la demo; /api/contact ya lo recibe y lo guarda
    phone: z.string().optional(),
    practiceArea: z.string().optional(),
    message: z.string().min(1, t.messageRequired),
    // Casilla del aviso de privacidad, obligatoria (el servidor también la exige)
    consent: z.boolean().refine((value) => value, { message: t.consentRequired }),
    // Campo trampa (J4): oculto; una persona lo deja vacío
    website: z.string().optional(),
  });
};

type Valores = ContactFormData & { consent: boolean; website?: string };
type Paso = 1 | 2 | 3;
const PASO1 = ["fullName", "email", "company", "phone"] as const;
const VACIO: Valores = { fullName: "", email: "", company: "", phone: "", practiceArea: "", message: "", consent: false, website: "" };
// Una etiqueta guardada en el panel que aún diga «(opcional)» no sale junto al asterisco: se quita
// el paréntesis final (también los de ancho completo, «（任意）»)
const sinParentesis = (label: string) => label.replace(/\s*[(（][^()（）]*[)）]\s*$/, "") || label;

export interface FormularioProps {
  /** Prefijo de los id (la página y la hoja pueden estar a la vez en /contact) */
  idPrefix: string;
  /** La forma de la página: la barra del teléfono se esconde mientras se ve */
  dePagina?: boolean;
}

export default function FormularioContacto({ idPrefix, dePagina = false }: FormularioProps) {
  const { language } = useLanguage();
  const { lang, attrs } = useV3Lang();
  const ct = CT[lang];
  const { toast } = useToast();
  const firm = useSiteContact(lang);
  const t = useCmsContent("contact", CONTACT_CONTENT)[language] ?? CONTACT_CONTENT.en;
  const feedbackAll = useCmsContent("contact-feedback", FEEDBACK);
  const fb = feedbackAll[language] || feedbackAll.en;
  const consentAll = useCmsContent("contact-consent", CONSENT);
  const consentT = consentAll[language] || consentAll.en;
  const formSettings = useCmsContent("forms", cmsDefaults.forms).contact;

  // Prácticas: las cuatro del sitio (/api/practice-groups) y «Otro asunto»
  const { shortName } = usePracticeNames();
  const { data: practices = [] } = useQuery<PracticeGroup[]>({ queryKey: ["/api/practice-groups"] });
  const practiceLabel = (value: string, lng: LanguageCode): string => {
    if (value === OTHER_VALUE) return lng === "es" ? CT.es.otroAsunto : lng === "en" ? CT.en.otroAsunto : OTHER_LABEL[lng] ?? OTHER_LABEL.en;
    const p = practices.find((x) => x.slug === value);
    return (lng === "es" ? p?.nameEs : lng === "en" ? p?.name : shortName(value, lng)) ?? p?.name ?? value;
  };
  const options = [...practices.map((p) => p.slug), OTHER_VALUE];

  const form = useForm<Valores>({ resolver: zodResolver(schemaFor(language)), defaultValues: VACIO });
  const { register, formState: { errors, submitCount } } = form;

  const [paso, setPaso] = useState<Paso>(1);
  const formRef = useRef<HTMLFormElement>(null);
  const primera = useRef(true);

  const mutation = useMutation({
    mutationFn: async (data: Valores) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      form.reset(VACIO);
      setPaso(3);
    },
    onError: (error: Error) => {
      // apiRequest lanza "429: …" cuando el servidor limita los envíos (J4)
      toast({
        title: fb.errorTitle,
        description: error.message.startsWith("429") ? fb.rateLimitedDescription : fb.errorDescription,
        variant: "destructive",
      });
    },
  });
  const errorEnvio = mutation.isError
    ? (mutation.error as Error).message.startsWith("429") ? fb.rateLimitedDescription : fb.errorDescription
    : "";

  // Pasos como en la demo (shell.js, iniciarForm): solo el paso actual es usable (inert en los demás)
  // y, al cambiar, el foco va a su primer campo. Si el formulario quedó arriba de la pantalla, se trae.
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    el.querySelectorAll<HTMLElement>(".sh-step").forEach((s) => s.toggleAttribute("inert", Number(s.dataset.step) !== paso));
    if (primera.current) { primera.current = false; return; }
    const top = el.getBoundingClientRect().top;
    const hoja = el.closest<HTMLElement>(".sh-hoja");
    if (hoja) {
      // En la hoja del teléfono: si el paso quedó arriba de su borde, la hoja vuelve a su principio
      if (top < hoja.getBoundingClientRect().top) hoja.scrollTo({ top: 0, behavior: isRM() ? "auto" : "smooth" });
    } else {
      // En la página, bajo el encabezado fijo (scroll-padding-top de ss26.css)
      const head = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ss-header-h")) || 68;
      if (top < head) el.scrollIntoView({ block: "start", behavior: isRM() ? "auto" : "smooth" });
    }
    const id = window.setTimeout(() => {
      el.querySelector<HTMLElement>(`.sh-step[data-step="${paso}"] :is(input:not([tabindex="-1"]), select, textarea, button)`)?.focus({ preventScroll: true });
    }, 60);
    return () => window.clearTimeout(id);
  }, [paso]);

  const continuar = async () => {
    if (await form.trigger([...PASO1], { shouldFocus: true })) setPaso(2);
  };

  const enviar = (data: Valores) => {
    if (isStaticSite) {
      // Sitio estático (sin servidor): el mensaje sale por el programa de correo del visitante
      const subject = encodeURIComponent(`Contacto web - ${data.fullName}`);
      const body = encodeURIComponent(
        [
          `Nombre: ${data.fullName}`,
          `Email: ${data.email}`,
          data.phone ? `Teléfono: ${data.phone}` : "",
          data.company ? `Empresa: ${data.company}` : "",
          data.practiceArea ? `Área: ${practiceLabel(data.practiceArea, "es")}` : "",
          "",
          data.message,
        ].filter(Boolean).join("\n"),
      );
      window.location.href = `mailto:${firm.email}?subject=${subject}&body=${body}`;
      toast({ title: fb.staticTitle, description: fb.staticDescription });
      return;
    }
    mutation.mutate(data);
  };
  // Un dato del paso 1 inválido al enviar (raro: ya se revisó al continuar): se vuelve al paso 1
  const invalido = (errs: FieldErrors<Valores>) => {
    if (PASO1.some((k) => errs[k])) setPaso(1);
  };
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Enter en el paso 1 continúa, no envía
    if (paso !== 2) {
      e.preventDefault();
      if (paso === 1) void continuar();
      return;
    }
    void form.handleSubmit(enviar, invalido)(e);
  };
  const otroMensaje = () => {
    mutation.reset();
    form.reset(VACIO);
    setPaso(1);
  };

  const id = (k: string) => `${idPrefix}-${k}`;
  const estado = (k: Paso) => (k === paso ? "on" : k < paso ? "prev" : "next");
  // Error de un campo: aria-invalid, aria-describedby y el mensaje bajo el campo (.sh-error)
  // (data-testid: los mismos de la página anterior, error-fullname, error-email…)
  const err = (k: keyof Valores, testid: string) => {
    const msg = errors[k]?.message;
    return {
      a11y: { "aria-invalid": msg ? (true as const) : (false as const), "aria-describedby": msg ? id(`${k}-err`) : undefined },
      msg: msg ? <p className="sh-error" id={id(`${k}-err`)} data-testid={`error-${testid}`}>{String(msg)}</p> : null,
    };
  };
  const nombre = err("fullName", "fullname"), correo = err("email", "email"), empresa = err("company", "company");
  const tel = err("phone", "phone"), mensaje = err("message", "message"), acepta = err("consent", "consent");
  // Título: el de la demo en español e inglés; en los demás idiomas, el del panel en su idioma
  const titulo = language === "es" || language === "en" ? ct.formH : t.formTitle;
  const req = <span className="sh-req" aria-hidden="true"> *</span>;

  if (!formSettings.enabled) {
    return (
      <div className="sh-form ct-form ct-form--off" {...(dePagina ? { "data-contacto-forma": "" } : {})}>
        <h3 id={id("h")} className="sh-form__h">{titulo}</h3>
        <p className="sh-form__ok" role="status">
          {formSettings.disabledMessage[language as "es" | "en"] || formSettings.disabledMessage.en}
        </p>
        <p><a className="ct-form__correo" href={`mailto:${firm.email}`}>{firm.email}</a></p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="sh-form ct-form"
      noValidate
      aria-labelledby={id("h")}
      onSubmit={onSubmit}
      data-testid={dePagina ? "form-contact" : "form-contact-sheet"}
      {...(dePagina ? { "data-contacto-forma": "" } : {})}
    >
      <h3 id={id("h")} className="sh-form__h" {...(titulo === ct.formH ? attrs : {})}>{titulo}</h3>
      <ol className="sh-form__pasos" aria-hidden="true" hidden={paso === 3} {...attrs}>
        <li className={paso === 1 ? "is-on" : undefined}>{ct.pasos[0]}</li>
        <li className={paso === 2 ? "is-on" : undefined}>{ct.pasos[1]}</li>
      </ol>

      <div className="sh-step" data-step="1" data-state={estado(1)}>
        <div className="sh-campo">
          <label htmlFor={id("nombre")}>{t.fullName}{req}</label>
          <input id={id("nombre")} autoComplete="name" aria-required="true" {...nombre.a11y} {...register("fullName")} data-testid="input-fullname" />
          {nombre.msg}
        </div>
        <div className="sh-campo">
          <label htmlFor={id("empresa")}>{sinParentesis(t.companyLabel)}{req}</label>
          <input id={id("empresa")} autoComplete="organization" aria-required="true" {...empresa.a11y} {...register("company")} data-testid="input-company" />
          {empresa.msg}
        </div>
        <div className="sh-campo">
          <label htmlFor={id("correo")}>{t.emailLabel}{req}</label>
          <input id={id("correo")} type="email" inputMode="email" autoComplete="email" aria-required="true" {...correo.a11y} {...register("email")} data-testid="input-email" />
          {correo.msg}
        </div>
        <div className="sh-campo">
          <label htmlFor={id("tel")}>{t.telLabel}</label>
          <input id={id("tel")} type="tel" autoComplete="tel" {...tel.a11y} {...register("phone")} data-testid="input-phone" />
          {tel.msg}
        </div>
        <button type="button" className="sh-btn" onClick={() => void continuar()} data-testid="button-contact-next" {...attrs}>{ct.continuar}</button>
      </div>

      <div className="sh-step" data-step="2" data-state={estado(2)}>
        <div className="sh-campo">
          <label htmlFor={id("tema")}>{t.practiceAreaLabel}</label>
          {/* Selector nativo, como en la demo (en el teléfono abre el del sistema) */}
          <select id={id("tema")} dir={language === "ar" ? "rtl" : undefined} {...register("practiceArea")} data-testid="select-practice-area">
            <option value="">—</option>
            {options.map((value) => (
              <option key={value} value={value} data-testid={`option-practice-area-${value}`}>{practiceLabel(value, language)}</option>
            ))}
          </select>
        </div>
        <div className="sh-campo">
          <label htmlFor={id("msg")}>{t.messageLabel}{req}</label>
          <textarea id={id("msg")} rows={4} aria-required="true" {...mensaje.a11y} {...register("message")} data-testid="textarea-message" />
          {mensaje.msg}
        </div>
        <div className="ct-check">
          <label className="sh-check" data-testid="label-consent">
            <input type="checkbox" aria-required="true" {...(submitCount > 0 ? acepta.a11y : {})} {...register("consent")} data-testid="checkbox-consent" />
            <span>
              {consentT.before}
              <Link href="/privacy-policy" data-testid="link-consent-privacy">{consentT.link}</Link>
              {consentT.after}
            </span>
          </label>
          {submitCount > 0 ? acepta.msg : null}
        </div>
        {/* Campo trampa (J4): fuera de la vista y de los lectores de pantalla, sin teclado ni autocompletar */}
        <div className="sr-only" aria-hidden="true">
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} data-testid="input-website" />
        </div>
        <div className="sh-form__acciones">
          <button type="button" className="sh-btn sh-btn--ghost" onClick={() => setPaso(1)} data-testid="button-contact-back" {...attrs}>{ct.regresar}</button>
          <button type="submit" className="sh-btn" disabled={mutation.isPending} aria-disabled={mutation.isPending} data-testid="button-submit-contact">
            {mutation.isPending ? t.submitting : t.submit}
          </button>
        </div>
        {errorEnvio ? <p className="sh-error ct-form__fallo" role="alert">{errorEnvio}</p> : null}
        <p className="sh-form__resp" {...attrs}>{ct.resp}</p>
        {/* Aviso del panel (10 idiomas): el formulario no crea una relación abogado-cliente */}
        {t.formSubtitle ? <p className="sh-form__resp ct-form__aviso">{t.formSubtitle}</p> : null}
      </div>

      <div className="sh-step" data-step="3" data-state={estado(3)} role="status">
        {paso === 3 ? (
          <>
            <p className="ct-form__ok-k">{fb.successTitle}</p>
            <p className="sh-form__ok" data-testid="text-contact-success">{fb.successDescription}</p>
          </>
        ) : null}
        <button type="button" className="sh-btn sh-btn--ghost" onClick={otroMensaje} data-testid="button-contact-again" {...attrs}>{ct.otroMensaje}</button>
      </div>
    </form>
  );
}
