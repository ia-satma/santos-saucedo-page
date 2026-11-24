/* Lámina viva de una práctica: la figura interactiva a la izquierda, en su propio documento
   (public/v3/laminas/<id>.html, el mismo lienzo y motor del carnero de «Nuestra firma»), y a la derecha el
   texto que cambia con lo que hace el visitante. La lista le dice a la figura a qué pieza ir y la figura
   avisa en cuál está (también durante su recorrido al entrar). En el teléfono la figura queda fija arriba
   y el detalle se abre bajo el renglón elegido.
   Tres maneras de lista (24-11-2026, láminas comerciales, comerciales.ts):
   - piezas: una a la vez, con su detalle (compra, estancias y las de la demo del 9-11);
   - diagnóstico: el visitante marca varias situaciones; la figura cierra esos bloques y el resultado dice
     qué queda abierto;
   - despido: sueldo y antigüedad del caso, y la cuenta en cada parada del juicio.
   Las comerciales cierran con un enlace discreto a Contacto. */
import "./laminas-vivas.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import logoBlancoLima from "@assets/ss26/logo-blanco-lima.svg";
import type { LanguageCode } from "@shared/constants";
import { cuentaDespido, MESES_DESPIDO } from "./comerciales";
import { obligaciones, vivasTexto, type VivaId, type VivaTexto, type VivasComun } from "./vivas";

/** Sube cuando cambie una figura: /v3 se guarda 30 días en el navegador */
const VERSION = 2;

/** El caso del despido: sueldo mensual y años de antigüedad que escribe el visitante */
type Caso = { sueldo: number; anios: number };

function Detalle({ L, C, i, caso }: { L: VivaTexto; C: VivasComun; i: number; caso: Caso }) {
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
  if (L.despido) {
    const D = L.despido;
    const m = MESES_DESPIDO[i] ?? 0;
    const c = cuentaDespido(caso.sueldo, caso.anios, m);
    const vencidos = `${D.partes.vencidos} (${Math.min(m, 12)} × ${D.moneda(caso.sueldo)})`;
    return (
      <>
        <h3>{p[0]}</h3>
        <p className="lv-monto"><span className="lv-monto__k">{D.total}</span><span className="lv-monto__n">{D.moneda(c.total)}</span></p>
        <dl className="lv-cuenta">
          <div><dt>{D.partes.indemnizacion}</dt><dd>{D.moneda(c.indemnizacion)}</dd></div>
          <div><dt>{D.partes.prima}</dt><dd>{D.moneda(c.prima)}</dd></div>
          {m > 0 ? <div><dt>{vencidos}</dt><dd>{D.moneda(c.vencidos)}</dd></div> : null}
          {c.intereses > 0 ? <div><dt>{D.partes.intereses}</dt><dd>{D.moneda(c.intereses)}</dd></div> : null}
        </dl>
        <p className="lv-msj">{p[1]}</p>
      </>
    );
  }
  return (
    <>
      <h3>{p[0]}</h3>
      <dl>
        {(L.etiquetas || []).map((et, k) => (p[k + 1] ? <div key={et}><dt>{et}</dt><dd>{p[k + 1]}</dd></div> : null))}
      </dl>
    </>
  );
}

/** Resultado del diagnóstico: cuántas situaciones están resueltas y qué entra por las abiertas */
function Resultado({ L, marcadas, tocado }: { L: VivaTexto; marcadas: boolean[]; tocado: boolean }) {
  const D = L.diagnostico;
  if (!D || !tocado) return null;
  const t = D.preguntas.length;
  const n = marcadas.filter(Boolean).length;
  const abiertas = D.preguntas.filter((_, i) => !marcadas[i]);
  return (
    <>
      <h3>{D.resueltas.replace("{n}", String(n)).replace("{t}", String(t))}</h3>
      {abiertas.length ? (
        <>
          <p className="lv-msj">{D.abiertas.replace("{k}", String(abiertas.length))}</p>
          <ul>{abiertas.map(([q, entra, ley]) => <li key={q}>{entra}<span className="lv-ley">{ley}</span></li>)}</ul>
        </>
      ) : <p className="lv-msj">{D.cerrado}</p>}
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
  const D = L.diagnostico;
  const nombres = L.meses ? C.meses : D ? D.preguntas.map((p) => p[0]) : (L.piezas || []).map((p) => p[0]);
  const marco = useRef<HTMLIFrameElement>(null);
  const [activa, setActiva] = useState(0);
  const [cargada, setCargada] = useState(false);
  const [marcadas, setMarcadas] = useState<boolean[]>(() => nombres.map(() => false));
  const [tocado, setTocado] = useState(false);
  const [caso, setCaso] = useState<Caso>({ sueldo: 30000, anios: 5 });
  const comercial = !!L.cap;

  const enviar = (msg: Record<string, unknown>) => marco.current?.contentWindow?.postMessage({ lamina: id, ...msg }, "*");

  useEffect(() => {
    const oir = (e: MessageEvent) => {
      const d = e.data;
      if (!marco.current || e.source !== marco.current.contentWindow || !d || d.lamina !== id) return;
      if (typeof d.activa === "number" && d.activa >= 0) setActiva(Math.min(d.activa, nombres.length - 1));
    };
    window.addEventListener("message", oir);
    return () => window.removeEventListener("message", oir);
  }, [id, nombres.length]);

  // la figura del despido dibuja la prima de antigüedad en meses de sueldo
  const primaMeses = useMemo(() => cuentaDespido(caso.sueldo, caso.anios, 0).primaMeses, [caso]);
  useEffect(() => { if (cargada && L.despido) enviar({ prima: primaMeses }); }, [cargada, primaMeses]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (cargada && D && tocado) enviar({ marcadas: marcadas.flatMap((m, i) => (m ? [i] : [])) });
  }, [cargada, marcadas, tocado]); // eslint-disable-line react-hooks/exhaustive-deps

  const elegir = (i: number) => {
    setActiva(i);
    enviar({ ir: i });
  };
  const marcar = (i: number) => {
    setTocado(true);
    setMarcadas((m) => m.map((v, k) => (k === i ? !v : v)));
    elegir(i);
  };
  const cambiarCaso = (k: keyof Caso, v: string) => {
    const num = Number(v.replace(/[^\d]/g, ""));
    if (!Number.isFinite(num)) return;
    setCaso((c) => ({ ...c, [k]: k === "anios" ? Math.min(50, num) : Math.min(5_000_000, num) }));
  };

  // idioma: la figura no tiene palabras; el texto de al lado sí (español o inglés)
  const src = `${import.meta.env.BASE_URL}v3/laminas/${id}.html?v=${VERSION}`;
  const num = `${n}/${total}`;
  const rotulo = L.cap ?? `${C.lamina} ${num}`;
  const h = `lv-${id}-t`;
  // ir a la etiqueta (con el atributo lang del inglés si la página está en otro idioma)
  const atributos = idioma === "en" && lang !== "en" ? { lang: "en", dir: "ltr" as const } : attrs;
  const numero = (i: number) => (comercial ? String(i + 1).padStart(2, "0") : `${n}.${i + 1}`);
  const claseLista = L.meses ? "lv-piezas lv-piezas--meses" : D ? "lv-piezas lv-piezas--marcas" : "lv-piezas";

  return (
    <section className="lv sobre-azul" id={`lamina-${id}`} data-lv={id} aria-labelledby={h} {...atributos}>
      <div className="lv-in">
        <div className="lv-cabeza">
          <p className="lv-cap">{rotulo}</p>
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
          {L.despido ? (
            <div className="lv-caso">
              <label>
                <span>{L.despido.sueldo}</span>
                <input inputMode="numeric" value={L.despido.moneda(caso.sueldo)} onChange={(e) => cambiarCaso("sueldo", e.target.value)} aria-describedby={`${h}-nota`} />
              </label>
              <label>
                <span>{L.despido.antiguedad}</span>
                <span className="lv-caso__anios">
                  <input inputMode="numeric" value={String(caso.anios)} onChange={(e) => cambiarCaso("anios", e.target.value)} />
                  <span aria-hidden="true">{L.despido.anios}</span>
                </span>
              </label>
            </div>
          ) : null}
          <p className="lv-instr">{L.instruccion}</p>
          <ol className={claseLista}>
            {nombres.map((nom, i) => {
              const on = i === activa;
              if (D) {
                const hecho = marcadas[i];
                return (
                  <li key={nom} data-on={on ? "" : undefined} data-hecho={hecho ? "" : undefined}>
                    <button type="button" className="lv-pieza lv-marca" aria-pressed={hecho}
                      onMouseEnter={() => { if (window.matchMedia("(hover: hover)").matches) elegir(i); }}
                      onFocus={() => elegir(i)} onClick={() => marcar(i)}>
                      <span className="lv-n">{numero(i)}</span>
                      <span className="lv-nom">{nom}</span>
                      <span className="lv-estado">{hecho ? D.si : D.no}</span>
                    </button>
                  </li>
                );
              }
              return (
                <li key={nom} data-on={on ? "" : undefined}>
                  <button type="button" className="lv-pieza" aria-pressed={on}
                    onMouseEnter={(e) => { if (window.matchMedia("(hover: hover)").matches) elegir(i); else e.preventDefault(); }}
                    onFocus={() => elegir(i)} onClick={() => elegir(i)}>
                    <span className="lv-n">{numero(i)}</span>
                    <span className="lv-nom">{nom}</span>
                  </button>
                  {/* teléfono: el detalle se abre bajo su renglón */}
                  {on && !L.meses ? <div className="lv-detalle lv-detalle--fila"><Detalle L={L} C={C} i={i} caso={caso} /></div> : null}
                </li>
              );
            })}
          </ol>
          {D ? (
            <div className="lv-detalle lv-detalle--diag" aria-live="polite" data-vacio={tocado ? undefined : ""}>
              <Resultado L={L} marcadas={marcadas} tocado={tocado} />
            </div>
          ) : (
            <div className={L.meses ? "lv-detalle lv-detalle--meses" : "lv-detalle lv-detalle--caja"} aria-live="polite">
              <Detalle L={L} C={C} i={activa} caso={caso} />
            </div>
          )}
          <p className="lv-cierre">{L.cierre}</p>
          {L.despido ? <p className="lv-fuente" id={`${h}-nota`}>{L.despido.nota}</p> : null}
          {L.fuente ? <p className="lv-fuente">{L.fuente}</p> : null}
          {comercial ? <p className="lv-cta"><Link href="/contact">{C.cta}</Link></p> : null}
        </div>
      </div>
      <div className="lv-cajetin" aria-hidden="true">
        <img src={logoBlancoLima} alt="" width={86} height={14} />
        <span>{rotulo}</span>
        <span>{C.lugar}</span>
      </div>
    </section>
  );
}
