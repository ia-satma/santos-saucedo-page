import { flushSync } from "react-dom";
import { navigate as browserNavigate, usePathname } from "wouter/use-browser-location";

// Transición entre páginas (sistema «Folio»): el navegador funde la página vieja con la nueva,
// el encabezado se queda quieto y el retrato de un socio viaja de la portada o de /team a su
// ficha (view-transition-name: retrato-<slug>, ss26.css). Usa la API nativa del navegador
// (Chrome, Edge, Safari 18+, Firefox 144+); sin ella, o con "reducir movimiento", la página cambia
// como siempre. Atrás/adelante del navegador no pasa por aquí: cambia sin transición.
type Navigate = typeof browserNavigate;
type Doc = Document & { startViewTransition?: (update: () => Promise<void> | void) => unknown };

const navigateWithTransition: Navigate = (to, options) => {
  const doc = document as Doc;
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    browserNavigate(to, options);
    return;
  }
  const before = document.querySelector("main");
  doc.startViewTransition(async () => {
    flushSync(() => browserNavigate(to, options));
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    // Páginas que se cargan aparte: espera (máx. 800 ms) a que la nueva esté en pantalla
    const start = performance.now();
    while (performance.now() - start < 800) {
      const main = document.querySelector("main");
      if (main && main !== before) break;
      // setTimeout y no requestAnimationFrame: durante la transición el navegador no pinta
      await new Promise((r) => setTimeout(r, 16));
    }
  });
};

/** Hook de ubicación para <Router hook={…}>: el del navegador, con la navegación envuelta */
export function useViewTransitionLocation(opts?: Parameters<typeof usePathname>[0]) {
  return [usePathname(opts), navigateWithTransition] as [string, Navigate];
}
