/* Lámina isométrica «figuras» de la demo v3 (modules/figuras): corporativo (archivero), seguridad social
   (calendario de obligaciones del IMSS y el INFONAVIT) o migratorio (torre de charolas).
   Mismo marcado y clases que la demo; el dibujo es el SVG generado por la demo (dibujos/<área>.ts), con el
   número de la lámina que le toca en la página. El texto, en español o inglés (textos.ts).
   Comportamiento: figuras.ts (despiece una vez al entrar, letreros, Modo Mario).
   El dibujo de su área (dibujos/<área>.ts, 32–125 kB) y el script se piden solo cuando la lámina está a una pantalla de
   la ventana (cerca.ts); hasta entonces la lámina guarda su sitio con el marco, el título y el cajetín.
   Número: el de la demo (n/7), que da la página. */
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import logoBlancoLima from "@assets/ss26/logo-blanco-lima.svg";
import type { LanguageCode } from "@shared/constants";
import { cargarDibujo, type FgArea, type FgDibujo } from "./figurasSvg";
import type { FigurasTexts } from "./textos";
import { cerca } from "./cerca";
import { useV3Content, v3Template } from "@/v3/useV3Content";

// Marcas del calendario (la marca es también la leyenda de cada letrero)
const MARCAS: ReactNode[] = [
  <path d="M1 4h10v4H1zM3 4v4M5 4v4M7 4v4M9 4v4" fill="none" stroke="currentColor" />,
  <path d="M3 3h6v6H3z" />,
  <path d="M6 2.5 10 9.5H2z" />,
  <circle cx="6" cy="6" r="2.6" />,
  <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1.3" />,
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** "--a:1;--b:2" → { "--a": "1", "--b": "2" } */
function cssVars(s: string): CSSProperties {
  const out: Record<string, string> = {};
  s.split(";").forEach((d) => {
    const i = d.indexOf(":");
    if (i > 0) out[d.slice(0, i).trim()] = d.slice(i + 1).trim();
  });
  return out as CSSProperties;
}

export function Figura({ area, n, total, lang, attrs }: {
  area: FgArea; n: number; total: number; lang: LanguageCode; attrs: { lang?: string; dir?: "ltr" | "rtl" };
}) {
  const ref = useRef<HTMLElement>(null);
  // dibujo y script, cuando la lámina se acerca
  const [carga, setCarga] = useState<{ d: FgDibujo; init: (root: HTMLElement) => () => void } | null>(null);
  const d = carga?.d;
  const { locale: v3 } = useV3Content();
  const T = v3.figuras as unknown as FigurasTexts;
  const t = T.laminas[area];
  const ids = t.items.map((_, k) => `${n}.${k + 1}`);
  const tituloId = `fg-${area}-t`;

  const escena = useMemo(() => {
    if (!d) return "";
    const aria = t.aria.replace("{a}", ids[0]).replace("{b}", ids[ids.length - 1]);
    let s = d.escena.split("@N@").join(String(n)).replace("@ARIA@", esc(aria));
    const meses = T.meses;
    if (meses) s = s.replace(/(<text class="fg-mes"[^>]*>)([A-Z]{3})(<\/text>)/g, (_m, a: string, b: string, c: string) => a + (meses[b] || b) + c);
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, area, n, lang]);
  const datos = useMemo(() => (d ? JSON.stringify(d.fg).split("@N@").join(String(n)) : ""), [d, n]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let vivo = true;
    const dejar = cerca(el, () => {
      Promise.all([cargarDibujo(area), import("./figuras")]).then(([dibujo, mod]) => {
        if (vivo) setCarga({ d: dibujo, init: mod.initFiguras });
      }).catch(() => { /* sin el dibujo queda la cabecera de la lámina */ });
    });
    return () => { vivo = false; dejar(); };
  }, [area]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !carga) return;
    return carga.init(el);
  }, [carga]);

  return (
    <section ref={ref} className="fg-lamina" data-area={area} aria-labelledby={tituloId} {...attrs}>
      <div className="fg-marco" aria-hidden="true" />
      <div className="fg-hoja" data-nota="" style={d ? cssVars(d.hoja) : undefined}>
        <header className="fg-cab">
          <h2 className="fg-titulo" id={tituloId}>{t.titulo}</h2>
          <p className="fg-entrada">
            {t.entrada}
            {t.fuente ? <span className="fg-fuente">{t.fuente}</span> : null}
          </p>
        </header>
        {d ? (
          <div className="fg-plano" style={cssVars(d.plano)} data-fg={datos}>
            <div className="fg-escena" dangerouslySetInnerHTML={{ __html: escena }} />
            <ol className="fg-piezas" aria-label={typeof T.listLabel === "function" ? T.listLabel(n) : v3Template(T.listLabel, { n })}>
              {t.items.map((it, k) => (
                <li key={k} className="fg-pieza" data-p={ids[k]} style={{ "--x": d.piezas[k].x, "--y": d.piezas[k].y } as CSSProperties}>
                  <button type="button" className="fg-et" data-p={ids[k]} aria-pressed="false">
                    <span className="fg-n">{ids[k]}</span>
                    {area === "seguridad" ? (
                      <svg className="fg-marca" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">{MARCAS[k]}</svg>
                    ) : null}
                    <span className="fg-nom">
                      {it.nom}
                      {it.dato ? <span className="fg-dato">{it.dato}</span> : null}
                    </span>
                  </button>
                  <p className="fg-desc">{it.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          // el sitio del dibujo mientras llega (mismo formato que el plano: 1000 × 600)
          <div className="fg-plano fg-plano--espera" aria-hidden="true" />
        )}
        <footer className="fg-pie">
          <div className="fg-aviso"><p className="fg-lectura" aria-hidden="true" /></div>
        </footer>
      </div>
      <div className="fg-cajetin" aria-hidden="true">
        <div className="fg-caj-cell fg-caj-logo"><img src={logoBlancoLima} alt="" width={128} height={21} /></div>
        <div className="fg-caj-cell"><span className="fg-caj-k">{T.sheetWord}</span> <span>{n}/{total}</span></div>
        <div className="fg-caj-cell fg-caj-title">{t.titulo}</div>
        <div className="fg-caj-cell fg-caj-lugar">{T.lugar}</div>
      </div>
    </section>
  );
}
