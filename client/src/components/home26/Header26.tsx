import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import logoBlancoLima from "@assets/ss26/logo-blanco-lima.svg";
import { home26, langAttrs, nav26, type Lang26 } from "./content";
import { useSiteContact } from "./useSiteContact";

// Elementos que pueden recibir foco dentro del diálogo
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Header26() {
  const { displayLanguage, setLanguage } = useLanguage();
  // Cualquier idioma distinto de ES se trata como EN (el contenido nuevo solo existe en ES/EN)
  const lang: Lang26 = displayLanguage === "es" ? "es" : "en";
  const t = home26[lang];
  const items = nav26[lang];
  const { phone, phoneHref } = useSiteContact(lang);
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  // A dónde va el foco al cerrar: al botón Menú, o a la navegación de escritorio
  // si el diálogo se cerró por pasar a ≥1024px (el botón ya no se ve).
  const restoreFocusRef = useRef<"button" | "nav" | null>(null);
  const openRef = useRef(open);
  openRef.current = open;

  const closeMenu = (restoreFocus: "button" | "nav" | null = "button") => {
    restoreFocusRef.current = restoreFocus;
    setOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.getElementById("root");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // El diálogo vive en body (portal); el resto de la página queda inerte
    root?.setAttribute("inert", "");
    firstLinkRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        return;
      }
      if (e.key !== "Tab") return;
      // Trampa de foco: Tab y Shift+Tab ciclan dentro del diálogo
      const dialog = dialogRef.current;
      if (!dialog) return;
      const nodes = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0,
      );
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (!active || !dialog.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    // Al pasar a escritorio el diálogo se oculta (lg:hidden): se cierra para no dejar la página inerte
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => {
      if (mq.matches) closeMenu("nav");
    };
    mq.addEventListener("change", onMq);

    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
      document.body.style.overflow = prev;
      root?.removeAttribute("inert");
      const target = restoreFocusRef.current;
      restoreFocusRef.current = null;
      if (target === "button") menuButtonRef.current?.focus();
      else if (target === "nav") document.getElementById("main-navigation")?.focus();
    };
  }, [open]);

  // Cambio de ruta: cierra el menú y devuelve el foco solo si estaba abierto
  useEffect(() => {
    if (openRef.current) closeMenu();
  }, [location]);

  const isActive = (href: string) => location === href || location.startsWith(`${href}/`);

  // Función de render (no componente) para que el foco no se pierda al cambiar de idioma
  const renderLangSwitch = (className = "") => (
    <div className={`ss-label flex items-center gap-2 ${className}`} role="group" aria-label="Idioma / Language">
      {(["es", "en"] as const).map((code, i) => (
        <span key={code} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden="true" className="text-white/50">/</span>}
          <button
            type="button"
            onClick={() => setLanguage(code)}
            aria-pressed={lang === code}
            className={`min-h-[44px] uppercase transition-colors ${lang === code ? "text-white" : "text-white/60 hover:text-white"}`}
          >
            {code}
          </button>
        </span>
      ))}
    </div>
  );

  return (
    <>
      <header
        {...langAttrs[lang]}
        className={`ss26 sticky top-0 z-50 bg-ss-ink text-white transition-[box-shadow] duration-300 ${
          scrolled ? "shadow-[0_1px_0_rgba(255,255,255,0.08)]" : ""
        }`}
        data-testid="header"
      >
        <div className="ss-container flex h-[68px] items-center justify-between gap-8 lg:h-20">
          <Link href="/" aria-label="Santos & Saucedo" className="shrink-0" data-testid="link-logo">
            <img src={logoBlancoLima} alt="Santos & Saucedo" className="h-[26px] w-auto lg:h-[30px]" width={183} height={30} />
          </Link>

          {/* Destino del skip link: visible en todo ancho (lista en escritorio, botón Menú en móvil) */}
          <nav
            id="main-navigation"
            tabIndex={-1}
            aria-label={lang === "es" ? "Principal" : "Main"}
            className="flex items-center lg:ml-auto"
          >
            <ul className="hidden items-center gap-[clamp(20px,2.2vw,36px)] lg:flex">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="ss-label ss-link ss-link--lime text-[12px] tracking-[0.16em] text-white/80 transition-colors hover:text-white aria-[current=page]:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <button
              ref={menuButtonRef}
              type="button"
              className="ss-label flex min-h-[44px] items-center gap-3 text-white lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-haspopup="dialog"
              data-testid="button-mobile-menu"
              onClick={() => setOpen(true)}
            >
              {t.menu}
              <span aria-hidden="true" className="flex w-6 flex-col gap-[6px]">
                <span className="h-px w-full bg-white" />
                <span className="h-px w-2/3 self-end bg-ss-lime" />
              </span>
            </button>
          </nav>

          {renderLangSwitch("hidden lg:flex")}
        </div>
      </header>

      {open &&
        createPortal(
          <div
            ref={dialogRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.menu}
            {...langAttrs[lang]}
            data-testid="modal-mobile-menu"
            className="ss26 fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-ss-panel text-white lg:hidden"
          >
            <div className="ss-container relative flex h-[68px] items-center justify-between">
              <img src={logoBlancoLima} alt="Santos & Saucedo" className="h-[26px] w-auto" width={159} height={26} />
              <button
                type="button"
                className="ss-label flex min-h-[44px] items-center text-white"
                data-testid="button-close-menu"
                onClick={() => closeMenu()}
              >
                {t.close}
              </button>
            </div>
            <nav className="ss-container relative mt-8 flex-1" aria-label={lang === "es" ? "Principal" : "Main"}>
              <ol className="border-t border-white/15">
                {items.map((item, i) => (
                  <li key={item.href} className="border-b border-white/15">
                    <Link
                      href={item.href}
                      ref={i === 0 ? firstLinkRef : undefined}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      onClick={() => closeMenu()}
                      className="flex items-baseline gap-5 py-4"
                    >
                      <span aria-hidden="true" className="ss-label ss-num w-8 text-ss-lime">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="ss-display text-[44px] leading-none">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="ss-container relative flex items-center justify-between py-8">
              {renderLangSwitch()}
              <a href={phoneHref} className="ss-label ss-num text-white/70">
                {phone}
              </a>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
