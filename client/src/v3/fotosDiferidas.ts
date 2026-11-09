/* Fotos de abajo del Inicio: se piden cuando la portada ya se pintó.
   En el teléfono, las fotos de prácticas, filosofía, industrias y socios competían con la foto del
   dron por la conexión (≈1 MB antes de que la portada apareciera). Ahora esperan a que la portada
   esté en pantalla y el navegador quede libre; se ven igual y en el mismo lugar, solo llegan después.
   Si el visitante baja antes, o entra con un ancla (#…), se piden en ese momento. */
import { useEffect, useState } from "react";

let listo = false;
const avisos = new Set<() => void>();
let esperando = false;

function marcar() {
  if (listo) return;
  listo = true;
  avisos.forEach((f) => f());
  avisos.clear();
}

function esperarPortada() {
  if (esperando || listo) return;
  esperando = true;
  if (typeof window === "undefined") return marcar();
  if (window.location.hash) return marcar();
  window.addEventListener("scroll", marcar, { once: true, passive: true });
  window.setTimeout(marcar, 3500); // pase lo que pase, no se quedan sin pedir
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  const libre = () => (w.requestIdleCallback ? w.requestIdleCallback(marcar, { timeout: 800 }) : window.setTimeout(marcar, 150));
  const pintada = () => requestAnimationFrame(() => requestAnimationFrame(libre));
  const poster = document.querySelector<HTMLImageElement>("img.mk-telon__quieta");
  if (!poster || poster.complete) return pintada();
  poster.addEventListener("load", pintada, { once: true });
  poster.addEventListener("error", pintada, { once: true });
}

/** true cuando ya se pueden pedir las fotos de abajo del Inicio. */
export function useFotosDiferidas(activo = true): boolean {
  const [v, setV] = useState(!activo || listo);
  useEffect(() => {
    if (!activo || listo) { setV(true); return; }
    const f = () => setV(true);
    avisos.add(f);
    esperarPortada();
    return () => { avisos.delete(f); };
  }, [activo]);
  return v;
}
