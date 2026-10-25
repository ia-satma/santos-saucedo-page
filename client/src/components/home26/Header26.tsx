import { useSiteNavigation } from "./useSiteNavigation";
import { useCmsMedia } from "@/lib/cmsMedia";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import { SiteLink as Link } from "./SiteLink";
import logoBlancoLima from "@assets/ss26/logo-blanco-lima.svg";
import { useChrome26 } from "./chrome26";
import { useSiteContact } from "./useSiteContact";
import { useDialog26 } from "./useDialog26";
import Search26 from "./Search26";
import { LangList26, LangSwitch26 } from "./LangMenu26";

// Rutas que también marcan una sección del menú, además de sus propias subrutas. Siguen el
// número § de su sección en el menú: la oficina, 01 Nuestra firma; el boletín, 04 Monitor
// Laboral. /experience, /articles y /events ya no se pintan: redirigen a /practice-groups y
// /news (App.tsx).
const alsoActive: Record<string, string[]> = {
  "/about": ["/offices"],
  "/news": ["/newsletter"],
};

// Un solo panel abierto a la vez: menú móvil o buscador, nunca los dos
type Panel = "menu" | "search" | null;
// A dónde vuelve el foco al cerrar: al botón que abrió el panel, o a la navegación
// de escritorio si el menú se cerró por pasar a ≥1280px (el botón Menú ya no se ve).
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
  /** Solo la portada: transparente sobre el video del héroe hasta que se hace scroll */
  overlay?: boolean;
}

export default function Header26({ localized = false, overlay = false }: Header26Props) {
  const media = useCmsMedia();
  const { code, t, base } = useChrome26(localized);
  const navigation = useSiteNavigation(code,t);
  const items = navigation.items;
  const { phone, phoneHref } = useSiteContact(base);
  const [location] = useLocation();
  const [panel, setPanel] = useState<Panel>(null);
  const [scrolled, setScrolled] = useState(false);
  // Al bajar después del primer pantallazo el encabezado se retira; al subir, vuelve
  const [tucked, setTucked] = useState(false);
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
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (Math.abs(y - lastY) < 6) return;
      const header = document.querySelector<HTMLElement>('header[data-testid="header"]');
      const focusInside = !!header && header.contains(document.activeElement);
      setTucked(y > lastY && y > window.innerHeight * 0.6 && !panelRef.current && !focusInside);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useDialog26(panel === "menu", dialogRef, {
    initialFocus: () => firstLinkRef.current,
    onEscape: () => closePanel("menu"),
    onClosed: restoreFocus,
    // Al pasar a escritorio el diálogo se oculta (xl:hidden): se cierra para no dejar la página inerte
    closeWhen: { query: "(min-width: 1280px)", onMatch: () => closePanel("nav") },
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

  // En la portada, arriba del todo, el encabezado deja ver el video (el héroe sube bajo él y su
  // degradado superior da el contraste del menú); al hacer scroll, Azul Profundo sólido.
  const solid = !overlay || scrolled;

  if (!navigation.header.enabled) return null;
  return (
    <>
      <header
        {...t.attrs}
        className={`ss26 ss-header sticky top-0 z-50 text-white ${
          solid ? "bg-ss-navy" : "bg-transparent"
        } ${scrolled ? "shadow-[0_1px_0_rgba(255,255,255,0.08)]" : ""} ${tucked && !panel ? "is-tucked" : ""}`}
        onFocus={() => setTucked(false)}
        data-testid="header"
      >
        {/* La navegación completa aparece desde 1280px para mantener etiquetas legibles.
            En pantallas menores se conserva el menú desplegable. */}
        <div className="ss-container flex h-[68px] items-center justify-between gap-4 lg:h-20 lg:gap-6 xl:gap-5">
          <Link href="/" aria-label="Santos & Saucedo" className="shrink-0" data-testid="link-logo">
            <img
              src={media.brand.logoLight}
              alt={media.brand.name}
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
            className="flex items-center gap-5 lg:ms-auto xl:gap-5"
          >
            <ul className="hidden items-center gap-4 xl:flex xl:gap-[clamp(16px,1.5vw,28px)]">
              {items.map((item) => (
                // flex + pt-[2px] (compensa el padding-bottom de .ss-link): mismo centro que Buscar y ES/EN.
                // Elemento actual (página o subruta): blanco y filete lima de 2 px (.ss-link--lime);
                // al pasar el cursor, filete blanco de 1 px.
                <li key={item.href} className="relative flex items-center gap-2">
                  <Link
                    href={item.href}
                    aria-current={currentFor(item.href)}
                    className="ss-label ss-link ss-link--lime whitespace-nowrap pt-[2px] tracking-[0.10em] text-white/80 transition-colors hover:text-white aria-[current=page]:bg-[length:100%_2px] aria-[current=page]:text-white aria-[current=true]:bg-[length:100%_2px] aria-[current=true]:text-white"
                  >
                    {item.label}
                  </Link>
                  {item.children.length>0&&<details className="relative"><summary className="cursor-pointer p-2 text-white" aria-label={`${t.header.menu}: ${item.label}`}>⌄</summary><ul className="absolute end-0 top-full min-w-56 max-w-80 border border-white/20 bg-ss-navy p-3 shadow-lg">{item.children.map(child=><li key={child.id}><Link href={child.href} className="block px-3 py-3 text-base text-white/90 hover:bg-white/10">{child.label}</Link></li>)}</ul></details>}
                </li>
              ))}
            </ul>

            {/* Buscador: icono con nombre accesible; el texto se ve desde 1280px.
                Márgenes negativos: área táctil de 44px sin ensanchar la fila */}
            {navigation.header.searchEnabled&&<button
              ref={searchButtonRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={panel === "search"}
              aria-controls="search-dialog"
              data-testid="button-search"
              onClick={() => setPanel("search")}
              className="ss-label -mx-3 flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 tracking-[0.10em] text-white/80 transition-colors hover:text-white min-[1440px]:mx-0 min-[1440px]:min-w-0"
            >
              <SearchIcon />
              <span className="sr-only min-[1440px]:not-sr-only">{t.search.open}</span>
            </button>}

            {/* El selector de paletas vive en el pie (Footer26), visible para todos */}

            <button
              ref={menuButtonRef}
              type="button"
              className="ss-label flex min-h-[44px] items-center gap-3 tracking-[0.10em] text-white xl:hidden"
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

          {navigation.header.languageEnabled&&<LangSwitch26 lang={code} className="hidden xl:flex" />}
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
            className="ss26 fixed inset-0 z-[70] flex flex-col overflow-y-auto overscroll-contain bg-ss-navy text-white xl:hidden"
          >
            <div className="ss-container relative flex h-[68px] shrink-0 items-center justify-between">
              <img src={media.brand.logoLight} alt={media.brand.name} className="h-[26px] w-auto" width={159} height={26} />
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
                  <li key={item.href} className="border-b border-white/15" style={{ "--i": i } as CSSProperties}>
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
                    {item.children.length>0&&<details className="pb-4 ps-12"><summary className="cursor-pointer min-h-11 py-3">{t.header.menu}: {item.label}</summary><ul className="space-y-1">{item.children.map(child=><li key={child.id}><Link href={child.href} onClick={()=>closePanel("menu")} className="block py-3 text-lg text-white/90">{child.label}</Link></li>)}</ul></details>}
                  </li>
                ))}
              </ol>
            </nav>
            <div className="ss-container relative space-y-4 py-8">
              {navigation.header.languageEnabled&&<LangList26 lang={code} />}
              {/* dir="ltr": en árabe los grupos de cifras del teléfono se invertían */}
              {navigation.header.phoneEnabled&&<a href={phoneHref} dir="ltr" className="ss-label ss-num inline-flex min-h-[44px] items-center text-white/75">
                {phone}
              </a>}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
