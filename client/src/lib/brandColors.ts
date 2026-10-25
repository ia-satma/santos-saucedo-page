// Los dos azules de marca vienen del panel (sección "theme") y se aplican en tiempo de ejecución
// sobre :root. Todo el sitio los lee de --ss-navy-rgb y --ss-marino-rgb; los componentes de shadcn
// leen --primary y --foreground en HSL, que también siguen al Azul Marino.
// ponytail: se aplican cuando llega el contenido del CMS (un instante después de pintar); si el
// azul cambia mucho y se nota el salto, inyectarlos en el HTML desde el servidor.
const HEX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

function channels(hex: string): [number, number, number] | null {
  const m = HEX.exec(hex.trim());
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

export function applyBrandColors(theme: { navy?: string; marino?: string }) {
  const root = document.documentElement.style;
  const navy = theme.navy ? channels(theme.navy) : null;
  const marino = theme.marino ? channels(theme.marino) : null;
  if (navy) root.setProperty("--ss-navy-rgb", navy.join(" "));
  if (marino) {
    root.setProperty("--ss-marino-rgb", marino.join(" "));
    root.setProperty("--primary", hsl(marino));
    root.setProperty("--foreground", hsl(marino));
  }
}
