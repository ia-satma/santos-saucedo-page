/* Lámina viva de una práctica (3/7 a 7/7): la figura interactiva a la izquierda, en su propio documento
   (public/v3/laminas/<id>.html, el mismo lienzo y motor del carnero de «Nuestra firma»), y a la derecha el
   texto que cambia con lo que hace el visitante. La lista le dice a la figura a qué pieza ir y la figura
   avisa en cuál está (también durante su recorrido al entrar). En el teléfono la figura queda fija arriba
   y el detalle se abre bajo el renglón elegido. */
import "./laminas-vivas.css";
import { useEffect, useRef, useState } from "react";
import logoBlancoLima from "@assets/ss26/logo-blanco-lima.svg";
import type { LanguageCode } from "@shared/constants";
import { obligaciones, vivasTexto, type VivaId, type VivaTexto, type VivasComun } from "./vivas";

/** Sube cuando cambie una figura: /v3 se guarda 30 días en el navegador */
const VERSION = 1;

function Detalle({ L, C, i }: { L: VivaTexto; C: VivasComun; i: number }) {
  if (L.meses) {
    return (
      <>
        <h3>{C.meses[i]}</h3>
        <ul>
          {obligaciones(i, C).map(([t, ley]) => <li key={t}>{t}<span className="lv-ley">{ley}</span></li>)}
        </ul>
        <dl className="lv-anio">
          <div><dt>{C.todoElAnio}</dt><dd>{C.idse[0]}<span className="lv-ley">{C.idse[1]}</span></dd></div>
        </dl>
      </>
    );
  }
  const p = L.piezas?.[i];
  if (!p) return null;
  return (
    <>
      <h3>{p[0]}</h3>
      <dl>
        {(L.etiquetas || []).map((et, k) => (p[k + 1] ? <div key={et}><dt>{et}</dt><dd>{p[k + 1]}</dd></div> : null))}
      </dl>
    </>
  );
}

export function LaminaViva({ id, n, total, lang, attrs }: {
  id: VivaId;
  n: number;
  total: number;
  lang: LanguageCode;
  attrs: { lang?: string; dir?: "ltr" | "rtl" };
}) {
  const { L: textos, C, lang: idioma } = vivasTexto(lang);
  const L = textos[id];
  const nombres = L.meses ? C.meses : (L.piezas || []).map((p) => p[0]);
  const marco = useRef<HTMLIFrameElement>(null);
  const [activa, setActiva] = useState(0);
  const [cargada, setCargada] = useState(false);

  useEffect(() => {
    const oir = (e: MessageEvent) => {
      const d = e.data;
      if (!marco.current || e.source !== marco.current.contentWindow || !d || d.lamina !== id) return;
      if (typeof d.activa === "number" && d.activa >= 0) setActiva(Math.min(d.activa, nombres.length - 1));
    };
    window.addEventListener("message", oir);
    return () => window.removeEventListener("message", oir);
  }, [id, nombres.length]);

  const elegir = (i: number) => {
    setActiva(i);
    marco.current?.contentWindow?.postMessage({ lamina: id, ir: i }, "*");
  };

  // idioma: la figura no tiene palabras; el texto de al lado sí (español o inglés)
  const src = `${import.meta.env.BASE_URL}v3/laminas/${id}.html?v=${VERSION}`;
  const num = `${n}/${total}`;
  const h = `lv-${id}-t`;
  // ir a la etiqueta (con el atributo lang del inglés si la página está en otro idioma)
  const atributos = idioma === "en" && lang !== "en" ? { lang: "en", dir: "ltr" as const } : attrs;

  return (
    <section className="lv sobre-azul" id={`lamina-${id}`} data-lv={id} aria-labelledby={h} {...atributos}>
      <div className="lv-in">
        <div className="lv-cabeza">
          <p className="lv-cap">{C.lamina} {num}</p>
          <h2 className="lv-h" id={h}>{L.titulo}</h2>
          <p className="lv-entrada">{L.entrada}</p>
        </div>
        <div className="lv-figura">
          <div className="lv-marco">
            {!cargada ? <p className="lv-espera">{C.espera}</p> : null}
            <iframe ref={marco} src={src} title={`${L.titulo}: ${C.figura}`} loading="lazy" onLoad={() => setCargada(true)} />
          </div>
          <div className="lv-pie" aria-hidden="true"><span>{L.pie[0]}</span><span>{L.pie[1]}</span></div>
          <p className="lv-aria">{L.aria}</p>
        </div>
        <div className="lv-texto">
          <p className="lv-instr">{L.instruccion}</p>
          <ol className={L.meses ? "lv-piezas lv-piezas--meses" : "lv-piezas"}>
            {nombres.map((nom, i) => {
              const on = i === activa;
              return (
                <li key={nom} data-on={on ? "" : undefined}>
                  <button type="button" className="lv-pieza" aria-pressed={on}
                    onMouseEnter={(e) => { if (window.matchMedia("(hover: hover)").matches) elegir(i); else e.preventDefault(); }}
                    onFocus={() => elegir(i)} onClick={() => elegir(i)}>
                    <span className="lv-n">{`${n}.${i + 1}`}</span>
                    <span className="lv-nom">{nom}</span>
                  </button>
                  {/* teléfono: el detalle se abre bajo su renglón */}
                  {on && !L.meses ? <div className="lv-detalle lv-detalle--fila"><Detalle L={L} C={C} i={i} /></div> : null}
                </li>
              );
            })}
          </ol>
          <div className={L.meses ? "lv-detalle lv-detalle--meses" : "lv-detalle lv-detalle--caja"} aria-live="polite">
            <Detalle L={L} C={C} i={activa} />
          </div>
          <p className="lv-cierre">{L.cierre}</p>
          {L.fuente ? <p className="lv-fuente">{L.fuente}</p> : null}
        </div>
      </div>
      <div className="lv-cajetin" aria-hidden="true">
        <img src={logoBlancoLima} alt="" width={86} height={14} />
        <span>{C.lamina} {num}</span>
        <span>{C.lugar}</span>
      </div>
    </section>
  );
}
