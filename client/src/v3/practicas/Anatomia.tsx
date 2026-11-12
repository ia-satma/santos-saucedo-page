/* Láminas «anatomía» de la demo v3 (modules/anatomia): el lema de la firma en dos objetos dibujados en
   three.js. «Prevención»: el expediente de la empresa en orden. «Solución»: el juicio laboral, etapa
   por etapa, de la conciliación al amparo. En escritorio el scroll es la línea de tiempo (escenario
   fijo bajo el encabezado del sitio); en teléfono la secuencia corre una vez; en Modo Mario, quieta.
   `sheets` dice cuáles van en la página: las dos (con pestañas, un solo recorrido, como en la demo)
   o una sola (sin pestañas, recorrido propio). Mismo marcado y clases que la demo.
   Comportamiento: anatomia.js (el script de la demo, con limpieza al desmontar). El script y three.js
   se piden solo cuando la lámina está a una pantalla de la ventana (cerca.ts), no al cargar la página.
   Números: los de la demo (3/7 y 4/7), que da la página. */
import { Fragment, useLayoutEffect, useRef } from "react";
import logoBlancoLima from "@assets/ss26/logo-blanco-lima.svg";
import type { LanguageCode } from "@shared/constants";
import { ANATOMIA, type SheetId } from "./textos";
import { cerca } from "./cerca";

export function Anatomia({ sheets, nums, lang, attrs }: {
  sheets: SheetId[];
  /** número de cada lámina en la página, «n/total» */
  nums: Partial<Record<SheetId, string>>;
  lang: LanguageCode;
  attrs: { lang?: string; dir?: "ltr" | "rtl" };
}) {
  const ref = useRef<HTMLElement>(null);
  const t = ANATOMIA[lang];
  const first = sheets[0];
  const solo = sheets.length === 1 ? first : undefined;
  const lam = (id: SheetId) => nums[id] || "1/1";
  const lamN = (id: SheetId) => lam(id).split("/")[0];

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let vivo = true;
    let limpiar: (() => void) | undefined;
    const dejar = cerca(el, () => {
      import("./anatomia-runtime.js").then((m) => {
        if (!vivo) return;
        m.setThreeUrl(`${import.meta.env.BASE_URL}v3/libs/three.min.js`);
        limpiar = m.initAnatomia(el);
      }).catch(() => {
        // sin el script (red caída): queda el texto de las láminas, como sin WebGL
        if (!vivo) return;
        el.classList.add("an-nogl");
        el.querySelectorAll<HTMLElement>("[data-sheet][hidden]").forEach((n) => { n.hidden = false; });
      });
    });
    return () => { vivo = false; dejar(); limpiar?.(); };
  }, []);

  return (
    <section
      ref={ref}
      className="an sobre-azul"
      id="anatomia"
      aria-label={solo ? t.aria[solo] : t.aria.both}
      data-an-sheet={first}
      data-an-laminas={`${lam("orden")},${lam("solucion")}`}
      data-an-solo={solo}
      {...attrs}
    >
      <div className="an-stage">
        <div className="an-frame" aria-hidden="true" />

        <div className="an-intro">
          {sheets.map((id) => (
            <div key={id} className="an-copy" id={`an-copy-${id}`} data-sheet={id} hidden={id !== first}>
              <h2 className="an-h">{t.sheets[id].h}</h2>
              <p className="an-p">{t.sheets[id].p}</p>
            </div>
          ))}
        </div>

        <div className="an-legend">
          {sheets.map((id) => (
            <Fragment key={id}>
              <ol className="an-list" id={`an-list-${id}`} data-sheet={id} aria-label={t.sheets[id].listLabel} hidden={id !== first}>
                {t.sheets[id].rows.map((r, i) => (
                  <li key={i}>
                    <button type="button" className="an-row" data-i={i} aria-pressed="false">
                      <span className="an-row-n">{lamN(id)}.{i + 1}</span>
                      <span className="an-row-b">
                        <span className="an-row-t">{r.t}</span>
                        {r.d ? <span className="an-row-d">{r.d}</span> : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className="an-key" data-sheet={id} hidden={id !== first}>{t.sheets[id].key}</p>
            </Fragment>
          ))}
        </div>

        <div className="an-draw">
          <div className="an-bar">
            {sheets.length > 1 ? (
              <div className="an-seg an-tabs" role="group" aria-label={t.tabsLabel}>
                {sheets.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className="an-tab"
                    data-sheet={id}
                    aria-pressed={id === first ? "true" : "false"}
                    aria-controls={`an-copy-${id} an-list-${id}`}
                  >
                    <span className="an-tab-n"><span className="an-tab-l">{t.tabShort}</span>{lamN(id)}</span>
                    <span className="an-tab-t">{t.sheets[id].tab}</span>
                  </button>
                ))}
              </div>
            ) : null}
            <span className="an-hint" aria-hidden="true">
              <span className="an-hint-t">{t.hint}</span>
            </span>
            <div className="an-seg an-modes" role="group" aria-label={t.modesLabel}>
              <button type="button" className="an-mode" data-mode="0" aria-pressed="false">
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="6" width="4.6" height="8" /><rect x="7.6" y="5" width="4.8" height="10" /><rect x="12.4" y="6" width="4.6" height="8" /></svg>
                <span>{t.assembled}</span>
              </button>
              <button type="button" className="an-mode" data-mode="1" aria-pressed="true">
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true"><rect x="1.5" y="6.5" width="3.6" height="7" /><rect x="8.1" y="5" width="3.8" height="10" /><rect x="14.9" y="6.5" width="3.6" height="7" /><path d="M6.3 10h0.6M13.1 10h0.6" /></svg>
                <span>{t.exploded}</span>
              </button>
            </div>
          </div>
          <div className="an-view">
            {/* el lienzo de three.js lo pone anatomia.js al arrancar (y lo quita al salir) */}
            <svg className="an-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" />
            <div className="an-tags" aria-hidden="true" />
          </div>
        </div>

        <div className="an-cajetin" aria-hidden="true">
          <div className="an-caj-cell an-caj-logo"><img src={logoBlancoLima} alt="" width={128} height={21} /></div>
          <div className="an-caj-cell an-caj-lam"><span className="an-caj-k">{t.sheetWord}</span> <span className="an-caj-v" data-caj="lam">{lam(first)}</span></div>
          <div className="an-caj-cell an-caj-title" data-caj="title">{t.sheets[first].h}</div>
          <div className="an-caj-cell an-caj-lugar">San Pedro Garza García</div>
        </div>
      </div>
    </section>
  );
}
