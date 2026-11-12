/* Barra «Llamar · Escribir» del teléfono y su hoja (demo v3: sh-barra + sh-hoja, shell.js). Lo pidió
   la junta: en el teléfono el contacto sube desde abajo. Se monta una vez en App y aparece solo en
   /contact, como en la demo aprobada (no persigue al visitante); demo.css la muestra solo hasta 760 px.

   Cuándo aparece: en el inicio, al pasar la portada (el telón, #portada); en las demás páginas, al pasar
   la primera pantalla (su portada). Se retira mientras se ve el formulario de /contact (ahí sobra y
   taparía sus botones), mientras está el aviso de cookies (que ocupa el mismo borde) y mientras se
   escribe en un campo de la página. El menú móvil la cubre y deja la página inerte.

   «Llamar» abre la hoja con el número, «Llamar» y «Copiar el número»; «Escribir», la hoja con el
   formulario real de contacto (el mismo de /contact, que envía a /api/contact). La hoja sube desde el
   borde, se cierra arrastrándola hacia abajo, con Escape, con el fondo o con la ×, y atrapa el foco. */
import { lazy, Suspense, useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import { useSiteContact } from "@/components/home26/useSiteContact";
import { isRM, useV3Lang } from "@/v3/shared";
import { type TextosV3 } from "./textos";
import { useV3Content } from "@/v3/useV3Content";
import "./contacto.css";

const cargarFormulario = () => import("./Formulario");
const Formulario = lazy(cargarFormulario);

type Tipo = "llamar" | "escribir";
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled])';
const CAMPO = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="hidden"]), textarea, select, [contenteditable="true"]';

export default function BarraTelefono() {
  const [location] = useLocation();
  // Solo en Contacto, como en la demo aprobada: la barra no persigue al visitante por el sitio
  if (location.replace(/\/+$/, "") !== "/contact") return null;
  return <Barra location={location} />;
}

function Barra({ location }: { location: string }) {
  const { lang, attrs } = useV3Lang();
  const { locale: v3 } = useV3Content();
  const ct = v3.contacto as unknown as TextosV3;
  const firm = useSiteContact(lang);
  const [on, setOn] = useState(false);
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [abierta, setAbierta] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const hojaRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const numRef = useRef<HTMLParagraphElement>(null);
  const desdeRef = useRef<HTMLButtonElement | null>(null);
  const timerRef = useRef(0);
  const drag = useRef({ y: 0, d: 0, activo: false });

  // Con la barra montada, el pie termina por encima de ella en el teléfono (contacto.css)
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("ss-con-barra");
    return () => html.classList.remove("ss-con-barra");
  }, []);

  // ¿Encendida? Se mide en cada desplazamiento (una vez por cuadro), como revisarBarra en shell.js
  useEffect(() => {
    let raf = 0;
    const revisar = () => {
      raf = 0;
      const vh = window.innerHeight;
      const head = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ss-header-h")) || 68;
      const portada = location === "/" ? document.getElementById("portada") : null;
      let encender = portada ? portada.getBoundingClientRect().bottom <= head : window.scrollY > vh * 0.7;
      const forma = encender ? document.querySelector<HTMLElement>("[data-contacto-forma]") : null;
      if (forma) {
        const r = forma.getBoundingClientRect();
        const vis = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        if (vis > Math.min(r.height, vh) * 0.3) encender = false;
      }
      if (encender && document.querySelector('[data-testid="banner-cookie-consent"]')) encender = false;
      if (encender) {
        const a = document.activeElement;
        if (a instanceof HTMLElement && a.matches(CAMPO) && !hojaRef.current?.contains(a)) encender = false;
      }
      setOn(encender);
    };
    const pedir = () => { if (!raf) raf = requestAnimationFrame(revisar); };
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    document.addEventListener("focusin", pedir);
    document.addEventListener("focusout", pedir);
    // La página llega después (rutas diferidas) y el aviso de cookies aparece cuando carga el panel
    const mo = new MutationObserver(pedir);
    const root = document.getElementById("root") ?? document.body;
    mo.observe(root, { childList: true, subtree: true });
    revisar();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      document.removeEventListener("focusin", pedir);
      document.removeEventListener("focusout", pedir);
      mo.disconnect();
    };
  }, [location]);

  // El formulario se trae en cuanto la barra aparece: «Escribir» abre sin esperar
  useEffect(() => { if (on) void cargarFormulario(); }, [on]);

  const abrir = (t: Tipo, btn: HTMLButtonElement) => {
    window.clearTimeout(timerRef.current);
    desdeRef.current = btn;
    setCopiado(false);
    setTipo(t);
    // Dos cuadros: la hoja se pinta abajo y luego sube (la transición de demo.css)
    requestAnimationFrame(() => requestAnimationFrame(() => setAbierta(true)));
  };

  const cerrar = useCallback(() => {
    setAbierta(false);
    if (hojaRef.current) hojaRef.current.style.transform = "";
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setTipo(null), isRM() ? 200 : 300);
  }, []);

  // Hoja abierta = diálogo modal: la página queda inerte y sin desplazamiento (como el menú de Header26,
  // que bloquea <html>: ss26.css le da overflow-x: clip), Escape cierra y Tab no sale de la hoja.
  useEffect(() => {
    if (!abierta) return;
    const html = document.documentElement;
    const root = document.getElementById("root");
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    root?.setAttribute("inert", "");
    const foco = window.setTimeout(() => cerrarRef.current?.focus({ preventScroll: true }), 80);
    const onKey = (e: KeyboardEvent) => {
      const hoja = hojaRef.current;
      if (!hoja) return;
      if (e.key === "Escape") { e.preventDefault(); cerrar(); return; }
      if (e.key !== "Tab") return;
      // Solo lo que se ve: los pasos ocultos del formulario son inert
      const nodos = Array.from(hoja.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.closest("[inert]") && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden");
      if (!nodos.length) { e.preventDefault(); return; }
      const a = nodos[0], z = nodos[nodos.length - 1], act = document.activeElement;
      if (!act || !hoja.contains(act)) { e.preventDefault(); (e.shiftKey ? z : a).focus(); }
      else if (e.shiftKey && act === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && act === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(foco);
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prev;
      root?.removeAttribute("inert");
      desdeRef.current?.focus({ preventScroll: true });
    };
  }, [abierta, cerrar]);

  // Al cambiar de página (p. ej. el enlace del aviso de privacidad) la hoja se cierra
  useEffect(() => { cerrar(); }, [location, cerrar]);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  // Arrastrar hacia abajo desde el asa o la cabecera: más de 80 px cierra (shell.js)
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    drag.current = { y: e.clientY, d: 0, activo: true };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!drag.current.activo) return;
    drag.current.d = Math.max(0, e.clientY - drag.current.y);
    if (!isRM() && hojaRef.current) {
      hojaRef.current.style.transition = "none";
      hojaRef.current.style.transform = `translateY(${drag.current.d}px)`;
    }
  };
  const onUp = () => {
    if (!drag.current.activo) return;
    const lejos = drag.current.d > 80;
    drag.current.activo = false;
    if (hojaRef.current) { hojaRef.current.style.transition = ""; if (!lejos) hojaRef.current.style.transform = ""; }
    if (lejos) cerrar();
  };
  const arrastre = { onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp };

  const copiar = () => {
    // Sin permiso del portapapeles: el número queda seleccionado para copiarlo a mano
    const seleccionar = () => {
      const n = numRef.current;
      const s = window.getSelection();
      if (!n || !s) return;
      const r = document.createRange();
      r.selectNodeContents(n);
      s.removeAllRanges();
      s.addRange(r);
    };
    try {
      navigator.clipboard.writeText(firm.phone).then(() => setCopiado(true), seleccionar);
    } catch {
      seleccionar();
    }
  };

  const titulo = tipo === "llamar" ? ct.llamenos : ct.formH;

  return (
    <>
      <div className="v3 ct-raiz">
        <div className={`sh-barra${on ? " is-on" : ""}`} role="group" aria-label={ct.acciones} {...attrs} data-testid="bar-phone">
          <button type="button" aria-haspopup="dialog" onClick={(e) => abrir("llamar", e.currentTarget)} data-testid="button-bar-call">
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M6.5 2.8l2 3.6-1.6 1.4a9 9 0 004.3 4.3l1.4-1.6 3.6 2-1 2.6c-.3.7-1 1.1-1.8 1A13.5 13.5 0 012.9 5.6c-.1-.8.3-1.5 1-1.8z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
            {ct.llamar}
          </button>
          <button type="button" aria-haspopup="dialog" onClick={(e) => abrir("escribir", e.currentTarget)} data-testid="button-bar-write">
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><rect x="2.5" y="4.5" width="15" height="11" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M3 5.5l7 5.5 7-5.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
            {ct.escribir}
          </button>
        </div>
      </div>
      {tipo !== null && typeof document !== "undefined"
        ? createPortal(
            <div className="v3 ct-raiz">
              <div
                ref={hojaRef}
                className={`sh-hoja${abierta ? " is-open" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="hoja-h"
                data-testid={`sheet-${tipo}`}
              >
                <div className="sh-hoja__asa" aria-hidden="true" {...arrastre} />
                <div className="sh-hoja__head" {...arrastre}>
                  <h2 id="hoja-h" {...attrs}>{titulo}</h2>
                  <button ref={cerrarRef} type="button" className="sh-x" onClick={cerrar} aria-label={ct.cerrar} {...attrs} data-testid="button-sheet-close">
                    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </button>
                </div>
                <div className="sh-hoja__body">
                  {tipo === "llamar" ? (
                    <div className="sh-hoja__tel">
                      <p className="sh-hoja__num" ref={numRef} dir="ltr">{firm.phone}</p>
                      <a className="sh-btn" href={firm.phoneHref} {...attrs} data-testid="link-sheet-call">{ct.llamar}</a>
                      <button type="button" className="sh-btn sh-btn--ghost" onClick={copiar} {...attrs} data-testid="button-sheet-copy">
                        {copiado ? ct.copiado : ct.copiar}
                      </button>
                      <span className="sh-sr" role="status">{copiado ? ct.copiado : ""}</span>
                    </div>
                  ) : (
                    <Suspense fallback={null}>
                      <Formulario idPrefix="h" />
                    </Suspense>
                  )}
                </div>
              </div>
              <div className="sh-hoja__fondo" onClick={cerrar} aria-hidden="true" />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
