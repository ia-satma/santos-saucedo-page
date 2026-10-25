// Colores de marca en tiempo de ejecución. Vienen del panel (sección "theme") y, mientras alguien
// compara paletas con el selector privado (PaletteSwitcher), de la paleta elegida, que manda sobre
// el panel solo en ese navegador. Todo el sitio los lee de --ss-*-rgb; shadcn lee --primary,
// --foreground y --secondary en HSL. La S del logo es un SVG: se repinta con el acento.
// ponytail: se aplican cuando llega el contenido del CMS (un instante después de pintar); si el
// cambio de color se nota al cargar, inyectarlos en el HTML desde el servidor.
export type BrandTheme = { navy?: string; marino?: string; lime?: string; paper?: string };

const HEX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
const LOGO_LIGHT = /logo-blanco-lima/;
const LOGO_DARK = /logo-marino/;
const LOGO_LIME = /#B2EB3E/gi;
const LOGO_NAVY = /#0B2850/gi;

function channels(hex?: string): [number, number, number] | null {
  const m = hex ? HEX.exec(hex.trim()) : null;
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}

function hsl([r, g, b]: [number, number, number]): string {
  const [rr, gg, bb] = [r / 255, g / 255, b / 255];
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb), l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === rr ? (gg - bb) / d + (gg < bb ? 6 : 0) : max === gg ? (bb - rr) / d + 2 : (rr - gg) / d + 4;
    h *= 60;
  }
  return `${h.toFixed(2)} ${(s * 100).toFixed(2)}% ${(l * 100).toFixed(2)}%`;
}

let base: BrandTheme = {};
let preview: BrandTheme | null = null;
let current: BrandTheme = {};
const svgCache = new Map<string, Promise<string>>();
let observer: MutationObserver | undefined;

// Repinta un logo SVG con los colores vigentes; guarda su ruta original para volver a ella
function recolorLogo(img: HTMLImageElement) {
  const original = img.dataset.logoSrc || img.getAttribute("src") || "";
  const light = LOGO_LIGHT.test(original), dark = LOGO_DARK.test(original);
  if (!light && !dark) return;
  img.dataset.logoSrc = original;
  const target = light ? current.lime : current.marino;
  if (!target || !HEX.test(target)) {
    if (img.getAttribute("src") !== original) img.setAttribute("src", original);
    return;
  }
  if (!svgCache.has(original)) svgCache.set(original, fetch(original).then((r) => r.text()));
  const want = `${original}|${target}`;
  img.dataset.logoColor = want;
  svgCache.get(original)!.then((svg) => {
    if (img.dataset.logoColor !== want) return;
    const painted = svg.replace(light ? LOGO_LIME : LOGO_NAVY, target);
    img.removeAttribute("srcset");
    img.setAttribute("src", `data:image/svg+xml;charset=utf-8,${encodeURIComponent(painted)}`);
  }).catch(() => {});
}

function recolorLogos(root: ParentNode = document) {
  root.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
    if (img.dataset.logoSrc || LOGO_LIGHT.test(img.src) || LOGO_DARK.test(img.src)) recolorLogo(img);
  });
}

function paint() {
  current = { ...base, ...(preview ?? {}) };
  const root = document.documentElement.style;
  const navy = channels(current.navy), marino = channels(current.marino);
  const lime = channels(current.lime), paper = channels(current.paper);
  if (navy) root.setProperty("--ss-navy-rgb", navy.join(" "));
  if (marino) {
    root.setProperty("--ss-marino-rgb", marino.join(" "));
    root.setProperty("--primary", hsl(marino));
    root.setProperty("--foreground", hsl(marino));
  }
  if (lime) root.setProperty("--ss-lime-rgb", lime.join(" "));
  if (paper) {
    root.setProperty("--ss-paper-rgb", paper.join(" "));
    root.setProperty("--secondary", hsl(paper));
  }
  recolorLogos();
  if (!observer && typeof MutationObserver !== "undefined") {
    observer = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => {
        if (n instanceof HTMLImageElement) recolorLogo(n);
        else if (n instanceof Element) recolorLogos(n);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

/** Colores guardados en el panel */
export function applyBrandColors(theme: BrandTheme) {
  base = theme;
  paint();
}

/** Paleta de prueba del selector privado; null vuelve a los colores del panel */
export function setPreviewPalette(theme: BrandTheme | null) {
  preview = theme;
  paint();
}
