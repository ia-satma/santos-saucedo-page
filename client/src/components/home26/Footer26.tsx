import { useCmsMedia } from "@/lib/cmsMedia";
import { Link } from "wouter";
import { Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORTED_LANGUAGES } from "@shared/schema";
import logoBlancoLima from "@assets/ss26/logo-blanco-lima.svg";
import { useOfficeLabel } from "@/lib/officeLabel";
import { useChrome26 } from "./chrome26";
import { useSiteContact } from "./useSiteContact";

// Área de clic de 32px (WCAG 2.5.8 pide 24px); el subrayado va en el texto, no en la caja.
const linkCls = "inline-flex min-h-8 items-center text-start text-[16px] transition-colors";
// Encabezados de columna: etiqueta en blanco tenue sobre Azul Profundo (la lima no va en texto)
const headCls = "ss-label text-white/75";
// Listas de enlaces: a 320 px cada columna mide ~128 px y una sola palabra larga
// (Nutzungsbedingungen, конфиденциальности) se salía; primero el guion del idioma, y si no
// hay, el corte donde haga falta.
const listCls = "mt-4 hyphens-auto [overflow-wrap:anywhere]";

// Vuelve a abrir el aviso de cookies como diálogo modal (CookieBanner escucha este evento).
function openCookiePreferences() {
  window.dispatchEvent(new Event("ss:open-cookie-preferences"));
}

interface Footer26Props {
  /** Páginas internas: interfaz en los 10 idiomas. Sin él (portada) solo ES/EN, como su contenido */
  localized?: boolean;
}

export default function Footer26({ localized = false }: Footer26Props) {
  const media = useCmsMedia();
  const officeNameFor = useOfficeLabel();
  const { language, setLanguage } = useLanguage();
  const { code, t: chrome, base } = useChrome26(localized);
  // Idioma real (no el de la interfaz, que en la portada cae a EN): con alemán, francés, etc.
  // ni Español ni English quedan marcados; se añade el idioma activo como tercer botón.
  const activeOther = language !== "es" && language !== "en" ? SUPPORTED_LANGUAGES.find((l) => l.code === language) : undefined;
  const t = chrome.footer;
  // Columna Firma: el menú y, después de Nuestra firma (§ 01), la página de la oficina
  const items = [chrome.nav[0], { label: officeNameFor(code), href: "/offices" }, ...chrome.nav.slice(1)].filter(item => !("visible" in item) || item.visible !== false);
  const year = new Date().getFullYear();

  // Misma consulta que el pie anterior; lo estático de content.ts (ES/EN) queda como respaldo.
  const { address, phone, phoneHref, email } = useSiteContact(base);

  return (
    <footer
      id="footer"
      {...chrome.attrs}
      className="ss26 border-t border-white/[.14] bg-ss-navy text-white"
      data-testid="footer"
    >
      {/* Filete superior de 1 px (blanco al 14 %, border-t): separa el pie de un bloque Azul
          Profundo que lo preceda, como el 404; junto a un cuerpo blanco apenas se nota.
          Sin marca de agua: el § grande decorativo aparece una sola vez, en el héroe de la portada. */}
      <div className="ss-container grid grid-cols-2 gap-x-6 gap-y-14 pb-10 pt-14 md:grid-cols-3 lg:grid-cols-12 lg:pb-12 lg:pt-20">
        <div className="col-span-2 md:col-span-3 lg:col-span-4">
          <img src={media.brand.logoLight} alt={media.brand.name} className="h-[34px] w-auto lg:h-[40px]" width={244} height={40} />
        </div>

        <address className="col-span-2 not-italic md:col-span-1 lg:col-span-3" data-testid="text-footer-address">
          <p className={headCls}>{t.office}</p>
          <p className="mt-5 text-[16px] leading-[1.6] text-white/80">
            {/* bdi: en árabe (RTL) el punto final de "N.L." no salta al principio de la línea */}
            {address.map((line, i) => (
              <span key={i} className="block">
                <bdi>{line}</bdi>
              </span>
            ))}
          </p>
          {/* Teléfono y correo siempre de izquierda a derecha: en árabe los grupos de cifras se invertían */}
          <div className="mt-3 flex flex-col items-start">
            <a href={phoneHref} dir="ltr" className={`${linkCls} ss-num text-white`} data-testid="link-footer-phone">
              <span className="ss-link">{phone}</span>
            </a>
            <a href={`mailto:${email}`} dir="ltr" className={`${linkCls} text-white [overflow-wrap:anywhere]`} data-testid="link-footer-email">
              <span className="ss-link">{email}</span>
            </a>
          </div>
        </address>

        <nav aria-labelledby="ss26-footer-firm" className="lg:col-span-2">
          <p id="ss26-footer-firm" className={headCls}>
            {t.firm}
          </p>
          <ul className={listCls}>
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
            <p id="ss26-footer-legal" className={headCls}>
              {t.legal}
            </p>
            <ul className={listCls}>
              <li>
                <Link href="/privacy-policy" className={`${linkCls} text-white/80 hover:text-white`} data-testid="link-privacy">
                  <span className="ss-link">{t.privacy}</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className={`${linkCls} text-white/80 hover:text-white`} data-testid="link-terms">
                  <span className="ss-link">{t.terms}</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className={`${linkCls} group text-white/80 hover:text-white`}
                  data-testid="button-cookies"
                >
                  <span className="ss-link group-hover:[background-size:100%_1px] group-focus-visible:[background-size:100%_1px]">{t.cookies}</span>
                </button>
              </li>
            </ul>
          </nav>

          <div role="group" aria-labelledby="ss26-footer-lang">
            <p id="ss26-footer-lang" className={headCls}>
              {chrome.langs.label}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5">
              {(["es", "en"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  lang={code}
                  onClick={() => setLanguage(code)}
                  aria-pressed={language === code}
                  className={`${linkCls} ${language === code ? "text-white" : "text-white/60 hover:text-white"}`}
                >
                  {code === "es" ? "Español" : "English"}
                </button>
              ))}
              {activeOther && (
                <button
                  type="button"
                  lang={activeOther.code}
                  aria-pressed="true"
                  className={`${linkCls} text-white`}
                >
                  <span dir={activeOther.code === "ar" ? "rtl" : undefined}>{activeOther.nameNative}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="ss-container">
        <div className="flex flex-col gap-4 border-t border-white/15 py-8 text-[13px] leading-relaxed text-white/65 md:flex-row md:items-center md:justify-between md:gap-10">
          <p>{t.disclaimer}</p>
          <div className="flex shrink-0 items-center gap-3">
            <p className="ss-num" data-testid="text-copyright">
              © {year} {t.rights}
            </p>
            {/* Acceso discreto al panel del despacho, como en el pie anterior: solo icono, tenue */}
            <Link
              href="/admin/login"
              className="inline-flex h-6 w-6 items-center justify-center text-white/30 transition-colors hover:text-white/70"
              data-testid="link-admin"
              aria-label="Admin"
            >
              <Settings aria-hidden="true" className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
