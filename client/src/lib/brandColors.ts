// Colores de marca en tiempo de ejecución. Vienen del panel (sección "theme") y, mientras alguien
// compara paletas con el selector privado (PaletteSwitcher), de la paleta elegida, que manda sobre
// el panel solo en ese navegador. Todo el sitio los lee de variables --ss-*; shadcn lee --primary,
// --foreground, --background… en HSL. La S del logo es un SVG: se repinta con el acento.
// Las paletas completas (con fondo y tinta) reparten el color por papeles, como en los videos de
// referencia: fondo de página, banda, campos oscuros, títulos, texto y acento (S, §, filetes).
// Fotos y video quedan siempre a color (pedido del cliente).
// ponytail: se aplican cuando llega el contenido del CMS (un instante después de pintar); si el
// cambio de color se nota al cargar, inyectarlos en el HTML desde el servidor.
export type BrandTheme = {
  navy?: string; // campos oscuros: encabezado, pie, panel
  marino?: string; // títulos, enlaces, botones
  lime?: string; // acento: S del logo, §, filetes
  paper?: string; // superficie clara alterna
  fondo?: string; // fondo de página (blanco hoy)
  tinta?: string; // texto corrido; de él salen los grises y las líneas
  bandaFondo?: string; // banda del manifiesto («Lo que creemos»)
  bandaTitulo?: string;
  bandaTexto?: string;
};

type RGB = [number, number, number];
const HEX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
const LOGO_LIGHT = /logo-blanco-lima/;
const LOGO_DARK = /logo-marino/;
const LOGO_LIME = /#B2EB3E/gi;
const LOGO_NAVY = /#0B2850/gi;
const WHITE: RGB = [255, 255, 255];

function channels(hex?: string): RGB | null {
  const m = hex ? HEX.exec(hex.trim()) : null;
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}

/** a al t (0–1) sobre b */
const mix = (a: RGB, b: RGB, t: number): RGB => a.map((v, i) => Math.round(v * t + b[i] * (1 - t))) as RGB;
const rgb = (c: RGB) => `rgb(${c.join(" ")})`;

function hsl([r, g, b]: RGB): string {
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

// Variables que solo ponen las paletas completas; sin ellas, cada una vuelve a su valor de la hoja
const FULL_VARS = [
  "--ss-fondo", "--background", "--card", "--popover",
  "--ss-p-tinta", "--ss-p-medio", "--ss-p-claro", "--ss-p-rule", "--ss-p-input", "--ss-p-field",
  "--body", "--muted-foreground", "--border", "--card-border", "--input",
  "--ss-mark", "--ss-mark-op", "--ss-bar", "--ss-bar-paper",
  "--ss-banda", "--ss-banda-tinta-rgb", "--ss-banda-texto", "--ss-banda-texto2", "--ss-banda-linea",
];

function paint() {
  current = { ...base, ...(preview ?? {}) };
  const html = document.documentElement;
  const root = html.style;
  const set = (k: string, v: string) => root.setProperty(k, v);
  const navy = channels(current.navy), marino = channels(current.marino);
  const lime = channels(current.lime), paper = channels(current.paper);
  if (navy) set("--ss-navy-rgb", navy.join(" "));
  if (marino) {
    set("--ss-marino-rgb", marino.join(" "));
    set("--primary", hsl(marino));
    set("--foreground", hsl(marino));
  }
  if (lime) set("--ss-lime-rgb", lime.join(" "));
  if (paper) {
    set("--ss-paper-rgb", paper.join(" "));
    set("--secondary", hsl(paper));
    set("--muted", hsl(paper));
  }

  FULL_VARS.forEach((k) => root.removeProperty(k));
  const fondo = channels(current.fondo), tinta = channels(current.tinta);
  html.toggleAttribute("data-ss-tema", !!(fondo && tinta));
  if (fondo && tinta) {
    set("--ss-fondo", rgb(fondo));
    ["--background", "--card", "--popover"].forEach((k) => set(k, hsl(fondo)));
    // Grises y líneas: la tinta de la paleta sobre su fondo (hoy salen del gris neutro sobre blanco)
    const medio = mix(tinta, fondo, 0.78), claro = mix(tinta, fondo, 0.57);
    const rule = mix(tinta, fondo, 0.13), input = mix(tinta, fondo, 0.25);
    set("--ss-p-tinta", rgb(tinta));
    set("--ss-p-medio", rgb(medio));
    set("--ss-p-claro", rgb(claro));
    set("--ss-p-rule", rgb(rule));
    set("--ss-p-input", rgb(input));
    set("--ss-p-field", rgb(claro));
    set("--body", hsl(tinta));
    set("--muted-foreground", hsl(medio));
    set("--border", hsl(rule));
    set("--card-border", hsl(rule));
    set("--input", hsl(input));
    // El acento entra en los detalles: § de las secciones, filetes y flechas (la portada no cambia: aprobada)
    if (lime) {
      set("--ss-mark", rgb(lime));
      set("--ss-mark-op", "0.9");
      set("--ss-bar", rgb(lime));
      set("--ss-bar-paper", rgb(lime));
    }
  }

  const bFondo = channels(current.bandaFondo), bTitulo = channels(current.bandaTitulo), bTexto = channels(current.bandaTexto);
  html.toggleAttribute("data-ss-banda", !!(bFondo && bTitulo && bTexto));
  if (bFondo && bTitulo && bTexto) {
    set("--ss-banda", rgb(bFondo));
    set("--ss-banda-tinta-rgb", bTitulo.join(" "));
    set("--ss-banda-texto", rgb(bTexto));
    set("--ss-banda-texto2", rgb(mix(bTexto, bFondo, 0.9)));
    set("--ss-banda-linea", rgb(mix(bTexto, bFondo, 0.25)));
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
