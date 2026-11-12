/* «El equipo» de la demo v3 (sh-eq, r11/paginas.py `_equipo()`): los retratos de todos, sin cuadros
   ni etiquetas, unidos como una sola foto de generación, en tres filas que se deslizan despacio en
   sentidos alternos y se detienen al pasar el cursor. En Modo Mario quedan quietos en una retícula.
   Todo el movimiento es CSS (demo.css). Los retratos son los del sitio (mosaico del CMS) con su
   encuadre óptico (teamPortraitFraming), llevado del cuadro 4:5 a la loseta cuadrada.
   Cambio respecto a la demo: en Modo Mario la retícula dejaba una última fila coja (37 retratos: 2
   sueltos en 7 columnas, 1 en 3). Lo que falta de esa fila lo ocupa Carreras, en el azul (el enlace
   a Pasantías S&S, que entonces sale de la cabecera para no repetirse); con la fila completa, nada
   cambia. initFin cuenta las columnas al cambiar el ancho o el modo. */
import { useEffect, useRef, type CSSProperties } from "react";
import { SiteLink } from "@/components/home26/SiteLink";
import { teamPortraitFraming } from "@/lib/teamPortraitFraming";
import "./socios.css";

type Attrs = { lang?: string; dir?: "ltr" | "rtl" };

const pct = (v: unknown, fallback: number) => {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n / 100 : fallback;
};

/* El encuadre del sitio está hecho para un cuadro 4:5 (ancho, left y top del retrato en %, con la
   cara a la misma escala y los ojos a la misma altura). En la loseta cuadrada se muestra ese cuadro
   entero (su alto ocupa el de la loseta, escala 0.8), con la cara al centro; si el retrato no
   alcanza a cubrir la loseta, se agranda o se corre lo justo. */
export function squareFraming(src: string): CSSProperties {
  const f = teamPortraitFraming(src);
  const w = pct(f.width, 1.25), l = pct(f.left, -0.125), t = pct(f.top, 0);
  const s = Math.max(0.8, 1 / w);
  const W = s * w;
  const clamp = (v: number) => Math.min(0, Math.max(v, 1 - W));
  const L = clamp(0.5 + s * (l - 0.5));
  const T = clamp(s * 1.25 * t);
  const fmt = (v: number) => `${(v * 100).toFixed(2)}%`;
  return { width: fmt(W), left: fmt(L), top: fmt(T) };
}

function Tile({ src, copia }: { src: string; copia?: boolean }) {
  return (
    <span className={copia ? "sh-eq__t is-copia" : "sh-eq__t"}>
      <img className="sc-enc" src={src} alt="" width={295} height={295} loading="lazy" decoding="async" style={squareFraming(src)} />
    </span>
  );
}

/* Huecos de la última fila en Modo Mario (la retícula auto-fill de demo.css): --fin y data-fin */
function initFin(section: HTMLElement, count: number): () => void {
  const muro = section.querySelector<HTMLElement>(".sh-eq__muro");
  if (!muro || !count) return () => {};
  const update = () => {
    const rm = document.documentElement.classList.contains("rm");
    const cols = rm ? getComputedStyle(muro).gridTemplateColumns.split(" ").filter(Boolean).length : 0;
    const fin = cols > 1 && count % cols ? cols - (count % cols) : 0;
    muro.style.setProperty("--fin", String(fin || 1));
    section.toggleAttribute("data-fin", fin > 0);
  };
  update();
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
  ro?.observe(muro);
  window.addEventListener("rmchange", update);
  window.addEventListener("resize", update);
  return () => {
    ro?.disconnect();
    window.removeEventListener("rmchange", update);
    window.removeEventListener("resize", update);
  };
}

export function EquipoMuro({
  photos, title, lead, leadAttrs, wallLabel, careersLabel, careersHref, careersNameLang,
}: {
  photos: string[];
  title: string;
  lead: string;
  leadAttrs: Attrs;
  /** aria-label del muro (la nota de los retratos del sitio, en 10 idiomas) */
  wallLabel: string;
  careersLabel: string;
  careersHref: string;
  /** lang="es" para «Pasantías S&S» (nombre del programa, sin traducir) fuera del español */
  careersNameLang?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => (ref.current ? initFin(ref.current, photos.length) : undefined), [photos.length]);
  // Tres filas: 1, 4, 7… · 2, 5, 8… · 3, 6, 9… (como la demo); cada pista va dos veces para el giro sin costura
  const rows = [0, 1, 2].map((r) => photos.filter((_, i) => i % 3 === r)).filter((row) => row.length > 0);
  return (
    <section ref={ref} className="sh-eq" id="equipo" aria-labelledby="eq-h" data-testid="section-associates">
      <div className="sh-wrap sh-eq__cab">
        <h2 id="eq-h" className="sh-h2">{title}</h2>
        <div className="sc-eq-txt">
          <p className="sh-eq__p" {...leadAttrs}>{lead}</p>
          {/* Carreras: el programa de pasantías (el nombre no se traduce) */}
          <p className="sc-eq-car" data-testid="cell-equipo-closing">
            <span className="sh-cap">{careersLabel}</span>
            <SiteLink className="sh-mas" href={careersHref} lang={careersNameLang}>Pasantías S&amp;S</SiteLink>
          </p>
        </div>
      </div>
      {rows.length > 0 && (
        <div className="sh-eq__muro">
          {/* Los retratos, una sola imagen para el lector (en Modo Mario, display: contents) */}
          <div className="sc-eq-fotos" role="img" aria-label={wallLabel}>
            {rows.map((row, r) => (
              <div className="sh-eq__fila" key={r}>
                <div className="sh-eq__pista">
                  {row.map((src, i) => <Tile key={`a${i}`} src={src} />)}
                  {row.map((src, i) => <Tile key={`b${i}`} src={src} copia />)}
                </div>
              </div>
            ))}
          </div>
          {/* Modo Mario: Carreras cierra la última fila de la retícula (solo si queda coja) */}
          <SiteLink className="sc-eq-fin sobre-azul" href={careersHref}>
            <span className="sh-cap">{careersLabel}</span>
            <span className="sc-eq-fin__n">
              <span lang={careersNameLang}>Pasantías S&amp;S</span>
              <svg className="pe-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8h10M9 4.5L12.5 8 9 11.5" /></svg>
            </span>
          </SiteLink>
        </div>
      )}
    </section>
  );
}
