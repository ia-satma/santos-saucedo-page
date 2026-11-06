/* Módulo «mapa» (mp-) de la demo v3: «El mismo criterio en cada planta». México con la sede en Monterrey
   (la § oficial como máscara) y la red que llega a las capitales de las otras 31 entidades; botón «Pausar».
   Marcado y clases: modules/mapa/section.html; la geometría del SVG, tal cual, en ./mapaSvg.ts.
   La dirección de la sede viene de /api/site-content (la misma del pie y de /contact).
   Fuera del puerto: la línea «Para la junta: la cobertura en cada entidad la valida la firma» (nota de la demo).
   Teclado (no estaba en la demo): el mapa es una lista de las 32 entidades (role="listbox", un solo paso
   de tabulador). Con las flechas se recorren —la entidad se tiñe y su nombre aparece igual que con el
   cursor—; Intro o Espacio la fija, Escape la suelta. Las opciones las crea el módulo (initMapa). */
import { useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";
import "./industrias.css";
import { initMapa, type MapaApi, type MapaTexts } from "./initMapa";
import { MAPA_AR, MAPA_LETRERO_GOLFO, MAPA_LETRERO_NORTE, MAPA_SEDE, MAPA_SVG, MAPA_VIEWBOX } from "./mapaSvg";
import type { IndustriasTexts } from "./texts";
import { v3Asset } from "../asset";

const SECCION = `url(${v3Asset("/v3/seccion-blanca.png")})`;
const pos = (p: { x: string; y: string }) => ({ "--x": p.x, "--y": p.y }) as CSSProperties;

export function Mapa({ t, address }: { t: IndustriasTexts["mapa"]; address: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const api = useRef<MapaApi | null>(null);
  const calle = address[0] || "";
  const colonia = address[1] || "";
  const ciudad = address[2] || "";
  const textos: MapaTexts = useMemo(() => ({
    sedeNombre: t.sedeNombre,
    sedeDato: [calle, colonia].filter(Boolean).join(", "),
    pausar: t.pausar, reanudar: t.reanudar, pausarAria: t.pausarAria, reanudarAria: t.reanudarAria,
    nombres: t.nombres,
  }), [t, calle, colonia]);
  const textosRef = useRef(textos);
  textosRef.current = textos;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const a = initMapa(el, () => textosRef.current);
    api.current = a;
    return () => { a.destruir(); api.current = null; };
  }, []);
  // cambio de idioma o de dirección: el botón y la etiqueta (que pinta el módulo) se rotulan de nuevo
  useEffect(() => { api.current?.refrescar(); }, [textos]);

  // el SVG es geometría generada: React lo pone una vez y el módulo mueve sus trazos
  const svg = useMemo(() => ({ __html: MAPA_SVG }), []);

  return (
    <section ref={ref} className="mp sobre-azul" id="presencia" aria-labelledby="mp-titulo" data-mp="">
      <div className="mp-wrap">
        <div className="mp-pista">
          <div className="mp-escena" style={{ "--mp-ar": MAPA_AR } as CSSProperties}>
            <header className="mp-cabeza">
              <h2 className="mp-titulo" id="mp-titulo">{t.titulo}</h2>
              <p className="mp-entrada">{t.entrada}</p>
            </header>

            <figure className="mp-figura" aria-labelledby="mp-desc">
              <p className="mp-sr" id="mp-desc">{t.desc}</p>
              <p className="mp-sr" id="mp-ayuda">{t.ayuda}</p>
              <div className="mp-lienzo">
                {/* la lista de entidades: sus opciones (sólo para lectores de pantalla) las agrega el módulo
                    al final de este nodo; el foco visible (lima del sitio) está en industrias.css */}
                <div className="mp-plano" role="listbox" tabIndex={0} aria-label={t.lista} aria-describedby="mp-ayuda">
                  <svg className="mp-svg" viewBox={MAPA_VIEWBOX} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={svg} />
                  <div className="mp-capa" aria-hidden="true">
                    <span className="mp-sede" style={{ ...pos(MAPA_SEDE), WebkitMaskImage: SECCION, maskImage: SECCION }} />
                    <div className="mp-letrero mp-letrero--golfo" style={pos(MAPA_LETRERO_GOLFO)}>
                      <span className="mp-letrero-titulo">{t.sedeTitulo}</span>
                      {calle ? <span className="mp-letrero-dato">{calle}</span> : null}
                      {ciudad ? <span className="mp-letrero-dato">{ciudad}</span> : null}
                    </div>
                    <div className="mp-letrero mp-letrero--norte" style={pos(MAPA_LETRERO_NORTE)}>
                      {/* en el teléfono, dos renglones sin el separador (industrias.css) */}
                      <span className="mp-letrero-titulo">
                        <span className="mp-letrero-l">{t.sedeTituloNorte.a}</span>
                        <span className="mp-letrero-sep">{t.sedeTituloNorte.sep}</span>
                        <span className="mp-letrero-l">{t.sedeTituloNorte.b}</span>
                      </span>
                    </div>
                  </div>
                </div>
                {/* el módulo rotula la etiqueta (la sede o el estado señalado) */}
                <div className="mp-etiqueta mp-en-sede" aria-hidden="true">
                  <span className="mp-etiqueta-nombre" />
                  <span className="mp-etiqueta-dato" />
                </div>
              </div>
              <div className="mp-pie">
                {/* el módulo rotula el botón (Pausar / Reanudar) */}
                <button type="button" className="mp-pausa" />
              </div>
            </figure>
          </div>
          <div className="mp-recorrido" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
