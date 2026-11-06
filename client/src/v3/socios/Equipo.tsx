/* «El equipo» de la demo v3 (sh-eq, r11/paginas.py `_equipo()`): los retratos de todos, sin cuadros
   ni etiquetas, unidos como una sola foto de generación, en tres filas que se deslizan despacio en
   sentidos alternos y se detienen al pasar el cursor. En Modo Mario quedan quietos en una retícula.
   Todo el movimiento es CSS (demo.css). Los retratos son los del sitio (mosaico del CMS) con su
   encuadre óptico (teamPortraitFraming), llevado del cuadro 4:5 a la loseta cuadrada. */
import type { CSSProperties } from "react";
import { SiteLink } from "@/components/home26/SiteLink";
import { teamPortraitFraming } from "@/lib/teamPortraitFraming";
import "./socios.css";

type Attrs = { lang?: string; dir?: "ltr" };

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

export function EquipoMuro({
  photos, title, lead, leadAttrs, wallLabel, careersLabel, careersHref,
}: {
  photos: string[];
  title: string;
  lead: string;
  leadAttrs: Attrs;
  /** aria-label del muro (la nota de los retratos del sitio, en 10 idiomas) */
  wallLabel: string;
  careersLabel: string;
  careersHref: string;
}) {
  // Tres filas: 1, 4, 7… · 2, 5, 8… · 3, 6, 9… (como la demo); cada pista va dos veces para el giro sin costura
  const rows = [0, 1, 2].map((r) => photos.filter((_, i) => i % 3 === r)).filter((row) => row.length > 0);
  return (
    <section className="sh-eq" id="equipo" aria-labelledby="eq-h" data-testid="section-associates">
      <div className="sh-wrap sh-eq__cab">
        <h2 id="eq-h" className="sh-h2">{title}</h2>
        <div className="sc-eq-txt">
          <p className="sh-eq__p" {...leadAttrs}>{lead}</p>
          {/* Carreras: el programa de pasantías (el nombre no se traduce) */}
          <p className="sc-eq-car" data-testid="cell-equipo-closing">
            <span className="sh-cap">{careersLabel}</span>
            <SiteLink className="sh-mas" href={careersHref}>Pasantías S&amp;S</SiteLink>
          </p>
        </div>
      </div>
      {rows.length > 0 && (
        <div className="sh-eq__muro" role="img" aria-label={wallLabel}>
          {rows.map((row, r) => (
            <div className="sh-eq__fila" key={r}>
              <div className="sh-eq__pista">
                {row.map((src, i) => <Tile key={`a${i}`} src={src} />)}
                {row.map((src, i) => <Tile key={`b${i}`} src={src} copia />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
