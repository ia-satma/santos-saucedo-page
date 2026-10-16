import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import logoBlancoLima from "@assets/ss26/logo-blanco-lima.svg";
import { useChrome26 } from "./chrome26";
import { useSiteContact } from "./useSiteContact";
import { useDialog26 } from "./useDialog26";
import Search26 from "./Search26";
import { LangList26, LangSwitch26 } from "./LangMenu26";

// Rutas que también marcan una sección del menú, además de sus propias subrutas
// (/articles estaba bajo Publicaciones junto a /news en el Header anterior). Siguen el
// número § de su sección en el menú: artículos, eventos y boletín, 04 Monitor Laboral.
// /experience y /offices ya no se pintan: redirigen a /practice-groups y /contact (App.tsx).
const alsoActive: Record<string, string[]> = {
  "/news": ["/articles", "/events", "/newsletter"],
};

// Un solo panel abierto a la vez: menú móvil o buscador, nunca los dos
type Panel = "menu" | "search" | null;
// A dónde vuelve el foco al cerrar: al botón que abrió el panel, o a la navegación
// de escritorio si el menú se cerró por pasar a ≥1024px (el botón Menú ya no se ve).
type FocusTarget = "menu" | "search" | "nav" | null;

// Lupa en blanco: la lima queda en el logotipo, el § de las secciones y el menú actual
function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-[18px] w-[18px] shrink-0" fill="none" strokeWidth={1.5}>
      <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" />
      <path d="M13 13l5 5" strokeLinecap="square" className="stroke-white/85" />
    </svg>
  );
}

interface Header26Props {
  /** Páginas internas: interfaz en los 10 idiomas. Sin él (portada) solo ES/EN, como su contenido */
  localized?: boolean;
}

export default function Header26({ localized = false }: Header26Props) {
  const { code, t, base } = useChrome26(localized);
  const items = t.nav;
  const { phone, phoneHref } = useSiteContact(base);
  const [location] = useLocation();
  const [panel, setPanel] = useState<Panel>(null);
  const [scrolled, setScrolled] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<FocusTarget>(null);
  const panelRef = useRef(panel);
  panelRef.current = panel;

  const closePanel = (restoreFocus: FocusTarget) => {
    restoreFocusRef.current = restoreFocus;
    setPanel(null);
  };

  // Se llama al cerrar (o desmontar) cualquiera de los dos diálogos
  const restoreFocus = () => {
    const target = restoreFocusRef.current;
    restoreFocusRef.current = null;
    if (target === "menu") menuButtonRef.current?.focus();
    else if (target === "search") searchButtonRef.current?.focus();
    else if (target === "nav") document.getElementById("main-navigation")?.focus();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useDialog26(panel === "menu", dialogRef, {
    initialFocus: () => firstLinkRef.current,
    onEscape: () => closePanel("menu"),
    onClosed: restoreFocus,
    // Al pasar a escritorio el diálogo se oculta (lg:hidden): se cierra para no dejar la página inerte
    closeWhen: { query: "(min-width: 1024px)", onMatch: () => closePanel("nav") },
  });

  // Cambio de ruta: cierra el panel y devuelve el foco solo si estaba abierto
  useEffect(() => {
    if (panelRef.current) closePanel(panelRef.current);
  }, [location]);

  // "page" en la página exacta; "true" en sus subrutas (/team/slug marca Socios)
  const currentFor = (href: string): "page" | "true" | undefined => {
    if (location === href) return "page";
    const bases = [href, ...(alsoActive[href] ?? [])];
    return bases.some((b) => location === b || location.startsWith(`${b}/`)) ? "true" : undefined;
  };

  return (
    <>
      <header
        {...t.attrs}
        className={`ss26 sticky top-0 z-50 bg-ss-navy text-white transition-[box-shadow] duration-300 ${
          scrolled ? "shadow-[0_1px_0_rgba(255,255,255,0.08)]" : ""
        }`}
        data-testid="header"
      >
        {/* Entre 1024 y 1279px se aprietan logo, huecos y espaciado del menú para que quepan
            navegación, buscador e idiomas; desde 1280px vuelve la medida de la portada.
            En alemán, francés y ruso el menú se aprieta algo más (ss26.css) */}
        <div className="ss-container flex h-[68px] items-center justify-between gap-4 lg:h-20 lg:gap-6 xl:gap-8">
          <Link href="/" aria-label="Santos & Saucedo" className="shrink-0" data-testid="link-logo">
            <img
              src={logoBlancoLima}
              alt="Santos & Saucedo"
              className="h-[22px] w-auto min-[360px]:h-[26px] xl:h-[30px]"
              width={183}
              height={30}
            />
          </Link>

          {/* Destino del skip link: visible en todo ancho (lista en escritorio, botón Menú en móvil) */}
          <nav
            id="main-navigation"
            tabIndex={-1}
            aria-label={t.header.nav}
            className="flex items-center gap-5 lg:ms-auto xl:gap-8"
          >
            <ul className="hidden items-center gap-4 lg:flex xl:gap-[clamp(20px,2.2vw,36px)]">
              {items.map((item) => (
                // flex + pt-[2px] (compensa el padding-bottom de .ss-link): mismo centro que Buscar y ES/EN.
                // Elemento actual (página o subruta): blanco y filete lima de 2 px (.ss-link--lime);
                // al pasar el cursor, filete blanco de 1 px.
                <li key={item.href} className="flex">
                  <Link
                    href={item.href}
                    aria-current={currentFor(item.href)}
                    className="ss-label ss-link ss-link--lime whitespace-nowrap pt-[2px] tracking-[0.10em] text-white/80 transition-colors hover:text-white aria-[current=page]:bg-[length:100%_2px] aria-[current=page]:text-white aria-[current=true]:bg-[length:100%_2px] aria-[current=true]:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Buscador: icono con nombre accesible; el texto se ve desde 1280px.
                Márgenes negativos: área táctil de 44px sin ensanchar la fila */}
            <button
              ref={searchButtonRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={panel === "search"}
              aria-controls="search-dialog"
              data-testid="button-search"
              onClick={() => setPanel("search")}
              className="ss-label -mx-3 flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 tracking-[0.10em] text-white/80 transition-colors hover:text-white xl:mx-0 xl:min-w-0"
            >
              <SearchIcon />
              <span className="sr-only xl:not-sr-only">{t.search.open}</span>
            </button>

            <button
              ref={menuButtonRef}
              type="button"
              className="ss-label flex min-h-[44px] items-center gap-3 tracking-[0.10em] text-white lg:hidden"
              aria-expanded={panel === "menu"}
              aria-controls="mobile-menu"
              aria-haspopup="dialog"
              data-testid="button-mobile-menu"
              onClick={() => setPanel("menu")}
            >
              {t.header.menu}
              <span aria-hidden="true" className="flex w-6 flex-col gap-[6px]">
                <span className="h-px w-full bg-white" />
                <span className="h-px w-2/3 self-end bg-white" />
              </span>
            </button>
          </nav>

          <LangSwitch26 lang={code} className="hidden lg:flex" />
        </div>
      </header>

      {panel === "search" && <Search26 lang={code} onClose={() => closePanel("search")} onClosed={restoreFocus} />}

      {panel === "menu" &&
        createPortal(
          <div
            ref={dialogRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.header.menu}
            {...t.attrs}
            data-testid="modal-mobile-menu"
            className="ss26 fixed inset-0 z-[70] flex flex-col overflow-y-auto overscroll-contain bg-ss-navy text-white lg:hidden"
          >
            <div className="ss-container relative flex h-[68px] shrink-0 items-center justify-between">
              <img src={logoBlancoLima} alt="Santos & Saucedo" className="h-[26px] w-auto" width={159} height={26} />
              <button
                type="button"
                className="ss-label flex min-h-[44px] items-center text-white"
                data-testid="button-close-menu"
                onClick={() => closePanel("menu")}
              >
                {t.header.close}
              </button>
            </div>
            <nav className="ss-container relative mt-8 flex-1" aria-label={t.header.nav}>
              <ol className="border-t border-white/15">
                {items.map((item, i) => (
                  <li key={item.href} className="border-b border-white/15">
                    <Link
                      href={item.href}
                      ref={i === 0 ? firstLinkRef : undefined}
                      aria-current={currentFor(item.href)}
                      onClick={() => closePanel("menu")}
                      className="flex items-baseline gap-5 py-4"
                    >
                      {/* Número = posición en el menú (01 Nuestra firma … 06 Contacto), el mismo § de
                          cada encabezado interno y de la portada */}
                      <span aria-hidden="true" className="ss-label ss-num w-8 shrink-0 text-white/[.66]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {/* Romana 350 a 34 px (ss26.css, #mobile-menu) */}
                      <span className="ss-display">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="ss-container relative space-y-4 py-8">
              <LangList26 lang={code} />
              {/* dir="ltr": en árabe los grupos de cifras del teléfono se invertían */}
              <a href={phoneHref} dir="ltr" className="ss-label ss-num inline-flex min-h-[44px] items-center text-white/75">
                {phone}
              </a>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
