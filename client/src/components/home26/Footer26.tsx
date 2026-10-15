import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import logoBlancoLima from "@assets/ss26/logo-blanco-lima.svg";
import { home26, langAttrs, nav26, type Lang26 } from "./content";
import { SectionMark } from "./primitives";
import { useSiteContact } from "./useSiteContact";

// Etiquetas de interfaz del pie (no es texto de la firma).
const ui = {
  es: { office: "Oficina", firm: "Firma", legal: "Legal", language: "Idioma", terms: "Términos de uso", cookies: "Preferencias de cookies" },
  en: { office: "Office", firm: "Firm", legal: "Legal", language: "Language", terms: "Terms of use", cookies: "Cookie preferences" },
} as const;

// Área de clic de 32px (WCAG 2.5.8 pide 24px); el subrayado va en el texto, no en la caja.
const linkCls = "inline-flex min-h-8 items-center text-left text-[16px] transition-colors";

// Abre el panel de preferencias de CookieBanner sin borrar lo guardado
// (CookieBanner escucha este evento).
function openCookiePreferences() {
  window.dispatchEvent(new Event("ss:open-cookie-preferences"));
}

export default function Footer26() {
  const { displayLanguage, setLanguage } = useLanguage();
  const lang: Lang26 = displayLanguage === "es" ? "es" : "en";
  const t = home26[lang].footer;
  const l = ui[lang];
  const items = nav26[lang];
  const year = new Date().getFullYear();

  // Misma consulta que el pie anterior; lo estático de content.ts queda como respaldo.
  const { address, phone, phoneHref, email } = useSiteContact(lang);

  return (
    <footer
      id="footer"
      {...langAttrs[lang]}
      className="ss26 relative isolate overflow-hidden bg-ss-ink text-white"
      data-testid="footer"
    >
      <SectionMark className="absolute -right-[4%] -top-[30%] -z-10 h-[170%] bg-white opacity-[0.03]" />

      <div className="ss-container grid grid-cols-2 gap-x-6 gap-y-14 pb-14 pt-20 md:grid-cols-3 lg:grid-cols-12 lg:pb-16 lg:pt-28">
        <div className="col-span-2 md:col-span-3 lg:col-span-4">
          <img src={logoBlancoLima} alt="Santos & Saucedo" className="h-[34px] w-auto lg:h-[40px]" width={244} height={40} />
        </div>

        <address className="col-span-2 not-italic md:col-span-1 lg:col-span-3" data-testid="text-footer-address">
          <p className="ss-label text-ss-lime">{l.office}</p>
          <p className="mt-5 text-[16px] leading-[1.6] text-white/80">
            {address.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </p>
          <div className="mt-3 flex flex-col items-start">
            <a href={phoneHref} className={`${linkCls} ss-num text-white`} data-testid="link-footer-phone">
              <span className="ss-link">{phone}</span>
            </a>
            <a href={`mailto:${email}`} className={`${linkCls} text-white [overflow-wrap:anywhere]`} data-testid="link-footer-email">
              <span className="ss-link">{email}</span>
            </a>
          </div>
        </address>

        <nav aria-labelledby="ss26-footer-firm" className="lg:col-span-2">
          <p id="ss26-footer-firm" className="ss-label text-ss-lime">
            {l.firm}
          </p>
          <ul className="mt-4">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={`${linkCls} text-white/80 hover:text-white`}>
                  <span className="ss-link">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-12 lg:col-span-3">
          <nav aria-labelledby="ss26-footer-legal">
            <p id="ss26-footer-legal" className="ss-label text-ss-lime">
              {l.legal}
            </p>
            <ul className="mt-4">
              <li>
                <Link href="/privacy-policy" className={`${linkCls} text-white/80 hover:text-white`} data-testid="link-privacy">
                  <span className="ss-link">{t.privacy}</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className={`${linkCls} text-white/80 hover:text-white`} data-testid="link-terms">
                  <span className="ss-link">{l.terms}</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className={`${linkCls} group text-white/80 hover:text-white`}
                  data-testid="button-cookies"
                >
                  <span className="ss-link group-hover:[background-size:100%_1px] group-focus-visible:[background-size:100%_1px]">{l.cookies}</span>
                </button>
              </li>
            </ul>
          </nav>

          <div role="group" aria-labelledby="ss26-footer-lang">
            <p id="ss26-footer-lang" className="ss-label text-ss-lime">
              {l.language}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5">
              {(["es", "en"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  aria-pressed={lang === code}
                  className={`${linkCls} ${lang === code ? "text-white" : "text-white/60 hover:text-white"}`}
                >
                  {code === "es" ? "Español" : "English"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ss-container">
        <div className="flex flex-col gap-4 border-t border-white/15 py-8 text-[13px] leading-relaxed text-white/65 md:flex-row md:items-center md:justify-between md:gap-10">
          <p>{t.disclaimer}</p>
          <p className="ss-num shrink-0" data-testid="text-copyright">
            © {year} {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
