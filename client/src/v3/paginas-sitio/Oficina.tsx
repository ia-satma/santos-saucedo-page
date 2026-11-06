/* «La oficina» (/offices) con el diseño de la demo v3: el recorrido de fotos del panel en filas a todo
   el ancho de la retícula, con las dos historias entre ellas, la dirección con sus datos sobre la línea
   de cota y la foto ampliada. Las fotos se descubren al entrar como en «Nuestras oficinas» de la demo
   (sh-ofi: de abajo hacia arriba, una vez; en Modo Mario solo un fundido). Prefijo ps- (./paginas.css). */
import "./paginas.css";
import { Fragment, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useV3Module } from "@/v3/shared";

export type FotoRecorrido = { src: string; small: string; alt: string; featured: boolean };

/* Proporción de las fotos de la oficina que no son 3:2 (client/public/editorial), para reservar su
   caja antes de que carguen. Las demás, y las subidas al panel, se miden al cargar. */
const PROPORCION: Record<string, number> = {
  "fachada": 1159 / 900,
  "escultura": 1024 / 1536,
  "estancia": 1536 / 920,
  "obra-mazo": 1536 / 940,
  "recepcion": 1522 / 1024,
  "recepcion-banda": 1522 / 694,
};
const proporcionConocida = (src: string) => {
  const base = (src.split("/").pop() || "").replace(/-(768|1536)\.webp$/, "");
  return PROPORCION[base] ?? 1.5;
};
// Una destacada ocupa un poco más que su vecina en la fila (se recorta un poco en alto)
const PESO_DESTACADA = 1.2;
// Una foto sola en su fila va a todo el ancho, apaisada
const SOLA_MIN = 1.9;

/* Filas del recorrido entre historia e historia. Con seis fotos: una sola a todo el ancho (si la
   primera es una destacada apaisada; si no, la última), una pareja y un trío; si ninguna sirve, tres
   parejas. Con otro número: parejas y, si sobra una, sola (apaisada) o con la fila anterior. */
function filas<T>(fotos: T[], apaisada: (f: T) => boolean, destacada: (f: T) => boolean): T[][] {
  const n = fotos.length;
  const cortar = (tam: number[]) => {
    const out: T[][] = []; let i = 0;
    for (const t of tam) { out.push(fotos.slice(i, i + t)); i += t; }
    return out;
  };
  if (n === 6) {
    if (destacada(fotos[0]) && apaisada(fotos[0])) return cortar([1, 2, 3]);
    if (destacada(fotos[5]) && apaisada(fotos[5])) return cortar([2, 3, 1]);
    return cortar([2, 2, 2]);
  }
  const out: T[][] = [];
  for (let i = 0; i < n; i += 2) out.push(fotos.slice(i, i + 2));
  const ultima = out[out.length - 1];
  if (out.length > 1 && ultima.length === 1 && !apaisada(ultima[0])) {
    out.pop();
    out[out.length - 1] = [...out[out.length - 1], ultima[0]];
  }
  return out;
}

/* La entrada de la demo (shell.js, «Nuestras oficinas»): cada foto se descubre una vez al entrar, en
   orden. sh-js-ofi va en <html> para que rijan también las reglas del Modo Mario (html.rm.sh-js-ofi). */
function initRecorrido(sec: HTMLElement): (() => void) | void {
  if (!("IntersectionObserver" in window)) return;
  const html = document.documentElement;
  const yaEstaba = html.classList.contains("sh-js-ofi");
  html.classList.add("sh-js-ofi");
  const figs = Array.from(sec.querySelectorAll<HTMLElement>(".sh-ofi__f"));
  const io = new IntersectionObserver((es) => {
    es.filter((e) => e.isIntersecting)
      .map((e) => e.target as HTMLElement)
      .sort((a, b) => figs.indexOf(a) - figs.indexOf(b))
      .forEach((f, i) => { f.style.setProperty("--d", `${i * 110}ms`); f.classList.add("is-visto"); io.unobserve(f); });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  figs.forEach((f) => io.observe(f));
  return () => { io.disconnect(); if (!yaEstaba) html.classList.remove("sh-js-ofi"); };
}

export function Recorrido({
  fotos, historias, label, ampliar, onAbrir, testId,
}: {
  fotos: FotoRecorrido[];
  /** Historia que va después de la foto n (índice en el recorrido): el trabajo diario y la cultura */
  historias: { despuesDe: number; id: string; titulo: string; texto: ReactNode; testId: string }[];
  label: string;
  /** «Ampliar fotografía» */
  ampliar: string;
  onAbrir: (i: number) => void;
  testId?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  // Se vuelve a montar si cambia el número de fotos (el panel puede quitar o poner)
  useV3Module(ref, initRecorrido, [fotos.length]);
  // Proporción medida de cada foto (src → ancho/alto)
  const [medidas, setMedidas] = useState<Record<string, number>>({});
  const prop = (f: FotoRecorrido) => medidas[f.src] ?? proporcionConocida(f.src);
  const medir = (src: string, img: HTMLImageElement) => {
    if (!img.naturalWidth || !img.naturalHeight) return;
    const r = img.naturalWidth / img.naturalHeight;
    if (Math.abs((medidas[src] ?? proporcionConocida(src)) - r) > 0.02) setMedidas((m) => ({ ...m, [src]: r }));
  };

  // Tramos entre historias (las historias van después de la foto 6 y de la 12, como antes)
  const cortes = historias.map((h) => h.despuesDe + 1).filter((c) => c > 0 && c < fotos.length);
  const tramos: { desde: number; fotos: FotoRecorrido[] }[] = [];
  let desde = 0;
  for (const c of [...cortes, fotos.length]) {
    if (c > desde) tramos.push({ desde, fotos: fotos.slice(desde, c) });
    desde = c;
  }

  return (
    <section ref={ref} className="ps-rec" aria-label={label} data-testid={testId}>
      {tramos.map((tramo, ti) => {
        let idx = tramo.desde;
        const historia = historias.find((h) => h.despuesDe + 1 === tramo.desde + tramo.fotos.length);
        return (
          <Fragment key={ti}>
            <div className="sh-wrap ps-rec__tramo">
              {filas(tramo.fotos, (f) => prop(f) >= 1.25, (f) => f.featured).map((fila, fi) => (
                <div key={fi} className={`ps-rec__fila ps-rec__fila--${fila.length}`}>
                  {fila.map((f) => {
                    const i = idx++;
                    const r = prop(f);
                    const sola = fila.length === 1;
                    // Peso en la fila = proporción mostrada: así todas las fotos de la fila tienen el mismo alto
                    const w = sola ? Math.max(r, SOLA_MIN) : f.featured && r >= 1.25 ? r * PESO_DESTACADA : r;
                    // En tableta, el trío se parte: la tercera baja sola, a todo el ancho
                    const style = { "--r": w.toFixed(4), "--r-sola": Math.max(r, SOLA_MIN).toFixed(4), "--r-nat": r.toFixed(4) } as CSSProperties;
                    return (
                      <figure key={`${f.src}-${i}`} className={`sh-ofi__f ps-rec__f${r < 1 ? " ps-rec__f--vertical" : ""}`} style={style}>
                        <div className="sh-ofi__m">
                          <button type="button" className="ps-rec__btn" onClick={() => onAbrir(i)} aria-label={`${ampliar}: ${f.alt}`}>
                            <img
                              src={f.src}
                              srcSet={f.small !== f.src ? `${f.small} 768w, ${f.src} 1536w` : undefined}
                              sizes={sola ? "(min-width: 1416px) 1240px, 92vw" : "(min-width: 901px) 56vw, (min-width: 641px) 60vw, 92vw"}
                              alt={f.alt}
                              loading="lazy"
                              decoding="async"
                              onLoad={(e) => medir(f.src, e.currentTarget)}
                            />
                            <span className="ps-rec__lupa" aria-hidden="true">
                              <svg viewBox="0 0 20 20" width="16" height="16"><circle cx="8.5" cy="8.5" r="5" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M12.4 12.4l4.1 4.1M8.5 6.4v4.2M6.4 8.5h4.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                            </span>
                          </button>
                        </div>
                      </figure>
                    );
                  })}
                </div>
              ))}
            </div>
            {historia ? (
              <section className="ps-historia" aria-labelledby={historia.id} data-testid={historia.testId}>
                <div className="sh-wrap">
                  <div className="ps-historia__in">
                    <h2 id={historia.id} className="sh-h2">{historia.titulo}</h2>
                    <p className="ps-historia__p">{historia.texto}</p>
                  </div>
                </div>
              </section>
            ) : null}
          </Fragment>
        );
      })}
    </section>
  );
}

/* La foto ampliada: sobre azul noche, con anterior y siguiente (también con las flechas del teclado) */
export function FotoAmpliada({
  fotos, indice, onCerrar, onPaso, titulo, anterior, siguiente,
}: {
  fotos: FotoRecorrido[];
  indice: number | null;
  onCerrar: () => void;
  onPaso: (paso: number) => void;
  titulo: string;
  anterior: string;
  siguiente: string;
}) {
  const foto = indice === null ? undefined : fotos[indice];
  return (
    <Dialog open={foto !== undefined} onOpenChange={(open) => { if (!open) onCerrar(); }}>
      <DialogContent
        className="v3 ps-caja"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") { event.preventDefault(); onPaso(-1); }
          if (event.key === "ArrowRight") { event.preventDefault(); onPaso(1); }
        }}
      >
        <DialogTitle className="sr-only">{titulo}</DialogTitle>
        {foto ? (
          <>
            <img src={foto.src} alt={foto.alt} className="ps-caja__img" />
            <div className="ps-caja__pie">
              <button type="button" className="ps-caja__btn" aria-label={anterior} onClick={() => onPaso(-1)}>
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <p aria-live="polite" className="ps-caja__n">{(indice ?? 0) + 1} / {fotos.length}</p>
              <button type="button" className="ps-caja__btn" aria-label={siguiente} onClick={() => onPaso(1)}>
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M7.5 4.5L13 10l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
