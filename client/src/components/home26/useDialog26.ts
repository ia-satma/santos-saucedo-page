import { useEffect, useRef, type RefObject } from "react";

// Elementos que pueden recibir foco dentro del diálogo
export const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface Dialog26Options {
  /** Elemento que recibe el foco al abrir */
  initialFocus: () => HTMLElement | null | undefined;
  /** Escape: el diálogo pide cerrarse */
  onEscape: () => void;
  /** Al cerrar o desmontar: el dueño devuelve el foco donde corresponda */
  onClosed: () => void;
  /** Consulta de medios en la que el diálogo deja de verse: se cierra */
  closeWhen?: { query: string; onMatch: () => void };
}

/**
 * Diálogo modal a pantalla completa (portal en body): bloquea el scroll,
 * deja #root inerte, atrapa el foco con Tab y cierra con Escape.
 * Lo usan el menú móvil y el buscador de Header26.
 */
export function useDialog26(open: boolean, dialogRef: RefObject<HTMLElement>, options: Dialog26Options) {
  // Las funciones cambian en cada render; el efecto lee siempre las últimas
  const opts = useRef(options);
  opts.current = options;

  useEffect(() => {
    if (!open) return;
    const root = document.getElementById("root");
    // Se bloquea <html>, no <body>: ss26.css le da a html overflow-x: clip, y con un
    // overflow distinto de visible el viewport toma el de html y no propaga el de body.
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    // El diálogo vive en body (portal); el resto de la página queda inerte
    root?.setAttribute("inert", "");
    opts.current.initialFocus()?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        opts.current.onEscape();
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

    const mq = opts.current.closeWhen ? window.matchMedia(opts.current.closeWhen.query) : null;
    const onMq = () => {
      if (mq?.matches) opts.current.closeWhen?.onMatch();
    };
    mq?.addEventListener("change", onMq);

    return () => {
      document.removeEventListener("keydown", onKey);
      mq?.removeEventListener("change", onMq);
      html.style.overflow = prev;
      root?.removeAttribute("inert");
      opts.current.onClosed();
    };
    // Solo depende de `open`: las funciones se leen de la referencia
  }, [open]);
}
