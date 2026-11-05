/* Modo Mario de la demo v3 = «reducir movimiento» del sistema. Sin CSS: lo monta App en todas las páginas. */
import { useEffect } from "react";

/** ¿Reducir movimiento? Modo Mario de la demo = prefers-reduced-motion del sistema. */
export const isRM = () => typeof document !== "undefined" && document.documentElement.classList.contains("rm");

/** Pone html.rm cuando el sistema pide reducir movimiento y avisa con el evento 'rmchange'
    (los módulos de la demo escuchan ese evento). Se monta una vez en App. */
export function useRmSync() {
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      const on = mq.matches;
      const html = document.documentElement;
      if (html.classList.contains("rm") !== on) {
        html.classList.toggle("rm", on);
        window.dispatchEvent(new CustomEvent("rmchange", { detail: { rm: on } }));
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
}

export function RmSync() {
  useRmSync();
  return null;
}

