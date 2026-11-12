/* Piezas de «Nuestra firma» (/about) con el diseño de la demo v3: el texto de la firma y el tríptico,
   «Cómo trabajamos», el lema de la prioridad, la lámina 1/7 (el carnero) y las fotos de la oficina. La
   lámina 2/7 (el avión) también vive aquí y la usa la página de Prácticas.
   Marcado y clases de la demo (demo.css); lo propio de la página va en ./firma.css con el prefijo nf-. */
import "./firma.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { useV3Module } from "@/v3/shared";
import reaccionDatos from "./reaccion-datos.json";
import { initFilosofia, type ReaccionDatos } from "./filosofia";
import { initPrioridad } from "./prioridad";
import type { FirmaTextos, Lamina } from "./textos";

type LangAttrs = { lang?: string; dir?: "ltr" | "rtl" };

/** El contenido del <svg> generado por la demo (build/*.mjs), sin la etiqueta raíz: React pone la raíz. */
const interior = (svg: string) => ({ __html: svg.slice(svg.indexOf(">") + 1, svg.lastIndexOf("</svg>")) });

/* El dibujo de la turbina (reaccion.svg, unos 380 KB) no va en el paquete de la página: se pide aparte
   cuando la lámina está a una pantalla de distancia, y queda guardado para la próxima visita. Mientras
   llega, la caja ya tiene su tamaño (aspect-ratio y viewBox), así que nada salta. */
type Html = { __html: string };
let reaccionGuardada: Html | null = null;
let reaccionPedida: Promise<Html> | null = null;
function pedirReaccion(): Promise<Html> {
  if (!reaccionPedida) {
    reaccionPedida = import("./reaccion.svg?raw")
      .then((m) => (reaccionGuardada = interior(m.default)))
      .catch((e) => { reaccionPedida = null; throw e; });
  }
  return reaccionPedida;
}

/** Nombres propios que no se parten al final de una línea (dirección y cerro, en los textos del CMS) */
const SIN_CORTE = /(San Pedro Garza García|Cerro de la Silla|Río Tamazunchale 205)/g;
const sinCortes = (s: string) => s.replace(SIN_CORTE, (m) => m.replace(/ /g, "\u00a0"));
/** Las frases de un texto, cada una con su punto (sin «lookbehind», que Safari < 16.4 no entiende) */
const frases = (s: string) => { const p = s.split(/\.\s+(?=\S)/); return p.map((f, i) => (i < p.length - 1 ? `${f}.` : f)); };

/** Envoltorio de la página. El marcador mk-js (la demo lo ponía en <html> desde el módulo «marca»)
    activa los estados de reposo de sus piezas: demo.css lo admite en <html> o en un antepasado dentro de .v3. */
export function FirmaRaiz({ children }: { children: ReactNode }) {
  return <div className="nf mk-js">{children}</div>;
}

/* ---------- La firma: el texto, las cifras y el tríptico, solo, como un cuadro colgado ---------- */
export function FirmaTexto({
  titulo, parrafos, cifras, cuadro, attrs, t,
}: {
  titulo: string;
  parrafos: [ReactNode, ReactNode];
  cifras: { value: string; label: string }[];
  /** alt: el del panel (galería de la oficina, foto «arteColor»), con el texto de la demo de respaldo */
  cuadro: { src: string; srcSet?: string; alt: string };
  attrs: LangAttrs;
  t: FirmaTextos;
}) {
  return (
    <section className="sh-firma sh-firma--pagina" id="firma-texto" aria-labelledby="nf-firma-h" data-testid="section-history">
      <div className="sh-wrap sh-firma__grid">
        <div className="nf-texto">
          <h2 id="nf-firma-h" className="nf-texto__h" data-testid="text-about-subtitle">{titulo}</h2>
          <div className="nf-texto__cuerpo">
            <p className="nf-texto__p1" data-testid="text-about-lead">{parrafos[0]}</p>
            <p>{parrafos[1]}</p>
          </div>
          <dl className="sh-cifras nf-cifras" data-testid="section-stats">
            {cifras.map((c, i) => (
              <div key={i} data-testid={`stat-${i}`}>
                <dt>{c.label}</dt>
                <dd>{c.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <figure className="sh-firma__cuadro" data-testid="figure-about-reception">
          <div className="sh-firma__marco">
            <img
              src={cuadro.src}
              srcSet={cuadro.srcSet}
              sizes="(min-width: 1416px) 1240px, 92vw"
              alt={cuadro.alt}
              {...attrs}
              loading="lazy"
              decoding="async"
              width={1536}
              height={1024}
            />
          </div>
          <figcaption {...attrs}><span className="sh-cap">{t.cuadroCap}</span> {sinCortes(t.cuadroTexto)}</figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ---------- Cómo trabajamos: los cuatro principios del sitio, antes del lema ---------- */
export function Principios({ titulo, valores }: { titulo: string; valores: { title: string; text: string }[] }) {
  return (
    <section className="nf-principios" aria-labelledby="nf-principios-h" data-testid="section-values">
      <div className="sh-wrap">
        <div className="nf-principios__in">
          <h2 id="nf-principios-h" className="sh-h2">{titulo}</h2>
          <ol className="nf-principios__lista">
            {valores.map((v, i) => (
              <li key={i} className="nf-principio" data-testid={`card-value-${i}`}>
                <span className="nf-principio__n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="nf-principio__t">{v.title}</h3>
                <p className="nf-principio__p">{v.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------- Nuestra prioridad: el lema y las dos S ---------- */
export function Prioridad({ t, attrs }: { t: FirmaTextos; attrs: LangAttrs }) {
  const ref = useRef<HTMLElement>(null);
  useV3Module(ref, initPrioridad);
  return (
    <section ref={ref} className="mk-prioridad" aria-labelledby="mk-prioridad-lema" {...attrs}>
      <div className="mk-prioridad__marco">
        <div className="mk-prioridad__simbolo" aria-hidden="true">
          <span className="mk-mitad mk-mitad--sup" />
          <span className="mk-mitad mk-mitad--inf" />
        </div>
        <div className="mk-prioridad__texto">
          <h2 className="mk-prioridad__lema" id="mk-prioridad-lema">
            <span className="mk-prioridad__linea mk-prioridad__linea--1">{t.lema[0].antes}<em>{t.lema[0].em}</em>{t.lema[0].fin}</span>{" "}
            <span className="mk-prioridad__linea mk-prioridad__linea--2">{t.lema[1].antes}<em>{t.lema[1].em}</em>{t.lema[1].fin}</span>
          </h2>
          <div className="mk-prioridad__notas">
            {t.notas.map((n, i) => <p key={i} className="mk-prioridad__nota">{n}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Láminas 1/7 (carnero, en «Nuestra firma») y 2/7 (turbina → avión, en Prácticas) ---------- */
function Lista({ n, L, activa, elegir }: { n: string; L: Lamina; activa?: number; elegir?: (i: number) => void }) {
  // con «activa» y «elegir», la lista sigue a una figura viva (el carnero); sin ellos, filosofia.ts la maneja
  const viva = activa != null && !!elegir;
  const pz = viva && activa >= 0 ? L.piezas[activa] : null;
  return (
    <>
      <ol className="fi-lista" aria-label={L.listaLabel}>
        {L.piezas.map((pz, i) => {
          const p = String(i + 1);
          const on = viva && i === activa;
          return (
            <li key={p} className="fi-fila" data-p={p} data-on={on ? "" : undefined}>
              <button
                type="button" className="fi-et" data-p={p} aria-pressed={viva ? on : false}
                onMouseEnter={viva ? () => elegir(i) : undefined}
                onFocus={viva ? () => elegir(i) : undefined}
                onClick={viva ? () => elegir(i) : undefined}
              >
                <span className="fi-n">{`${n}.${p}`}</span>
                <span className="fi-nom">{pz.nom}</span>
              </button>
              <p className="fi-desc"><span className="fi-parte">{pz.parte}</span> {pz.desc}</p>
            </li>
          );
        })}
      </ol>
      <p className="fi-lectura" aria-hidden="true" data-on={pz ? "" : undefined}>
        {pz ? <><span className="fi-parte">{pz.parte}</span> {pz.desc}</> : null}
      </p>
    </>
  );
}

function Cajetin({ lamina, titulo, t, logo }: { lamina: string; titulo: string; t: FirmaTextos; logo: string }) {
  return (
    <div className="fi-cajetin" aria-hidden="true">
      <div className="fi-caj-cell fi-caj-logo"><img src={logo} alt="" width={128} height={21} /></div>
      <div className="fi-caj-cell"><span className="fi-caj-k">{t.lamina}</span> <span className="fi-caj-n">{lamina}</span></div>
      <div className="fi-caj-cell fi-caj-title">{titulo}</div>
      <div className="fi-caj-cell fi-caj-lugar">{t.lugar}</div>
    </div>
  );
}

/** Lámina 1/7, el carnero: la filosofía de la firma (en «Nuestra firma»). */
export function LaminaCarnero({ t, attrs, logo, lang }: { t: FirmaTextos; attrs: LangAttrs; logo: string; lang: "es" | "en" }) {
  // La figura vive en su propio documento (public/v3/laminas/carnero.html, lienzo y motor de las láminas):
  // la lista le dice a qué paso ir y la figura avisa en cuál está, también durante su recorrido al entrar.
  const marco = useRef<HTMLIFrameElement>(null);
  const [activa, setActiva] = useState(0);
  useEffect(() => {
    const oir = (e: MessageEvent) => {
      const d = e.data;
      if (!marco.current || e.source !== marco.current.contentWindow || !d || d.lamina !== "carnero") return;
      if (typeof d.activa === "number" && d.activa >= 0) setActiva(d.activa);
    };
    window.addEventListener("message", oir);
    return () => window.removeEventListener("message", oir);
  }, []);
  const elegir = (i: number) => {
    setActiva(i);
    marco.current?.contentWindow?.postMessage({ lamina: "carnero", ir: i }, "*");
  };
  // teléfono: la figura queda fija arriba (firma.css) y el paso que cruza el centro de la pantalla la mueve
  const seccion = useRef<HTMLElement>(null);
  useEffect(() => {
    const sec = seccion.current;
    if (!sec || !("IntersectionObserver" in window) || !window.matchMedia("(max-width: 820px)").matches) return;
    const filas = Array.from(sec.querySelectorAll<HTMLElement>(".fi-fila"));
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = filas.indexOf(e.target as HTMLElement);
        if (i >= 0) { setActiva(i); marco.current?.contentWindow?.postMessage({ lamina: "carnero", ir: i }, "*"); }
      });
    }, { rootMargin: "-62% 0px -30% 0px" });
    filas.forEach((f) => io.observe(f));
    return () => io.disconnect();
  }, []);
  const C = t.carnero;
  const src = `${import.meta.env.BASE_URL}v3/laminas/carnero.html?v=2${lang === "en" ? "&lang=en" : ""}`;
  // otro idioma = otro documento: la figura vuelve a empezar abajo
  useEffect(() => { setActiva(0); }, [src]);
  return (
    <section ref={seccion} className="fi-lamina fi-carnero sobre-azul" id="carnero" data-fi-lamina="1/7" data-fi-lean="5" data-foco="" aria-labelledby="carnero-t" {...attrs}>
      <div className="fi-escena">
        <div className="fi-marco" aria-hidden="true" />
        <div className="fi-texto">
          <h2 className="fi-h" id="carnero-t">{C.h}</h2>
          {C.p.map((p, i) => <p key={i} className="fi-p">{p}</p>)}
          {C.instr ? <p className="fi-instr">{C.instr}</p> : null}
          <Lista n="1" L={C} activa={activa} elegir={elegir} />
        </div>
        <div className="fi-plano">
          <div className="fi-lienzo fi-lienzo--vivo">
            <iframe ref={marco} className="fi-vivo" src={src} title={C.svgLabel} loading="lazy" />
          </div>
          {C.nota ? <p className="fi-nota">{C.nota}</p> : null}
        </div>
        <Cajetin lamina="1/7" titulo={C.cajetin} t={t} logo={logo} />
      </div>
    </section>
  );
}

/** Lámina 2/7, la turbina que se vuelve avión: la capacidad de reacción, la ventaja de la firma.
    Va en la página de Prácticas (antes, en «Nuestra firma» junto al carnero). */
export function LaminaReaccion({ t, attrs, logo }: { t: FirmaTextos; attrs: LangAttrs; logo: string }) {
  const ref = useRef<HTMLElement>(null);
  const [reaccion, setReaccion] = useState<Html | null>(reaccionGuardada);
  // arranca cuando su dibujo ya está en la página
  useV3Module(ref, (el) => (reaccion ? initFilosofia(el, reaccionDatos as ReaccionDatos) : undefined), [reaccion]);
  // se pide cuando la lámina está a una pantalla (arriba o abajo); si falla la red, se vuelve a intentar
  // la próxima vez que se acerque
  useEffect(() => {
    const el = ref.current;
    if (reaccion || !el) return;
    let vivo = true;
    const pedir = () => { pedirReaccion().then((h) => { if (vivo) setReaccion(h); }).catch(() => { /* reintento al volver */ }); };
    if (!("IntersectionObserver" in window)) { pedir(); return () => { vivo = false; }; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) pedir(); }, { rootMargin: "100% 0px 100% 0px" });
    io.observe(el);
    return () => { vivo = false; io.disconnect(); };
  }, [reaccion]);
  const R = t.reaccion;
  return (
    <section ref={ref} className="fi-lamina fi-reaccion sobre-azul" id="reaccion" data-fi-lamina="2/7" aria-labelledby="reaccion-t" {...attrs}>
      <div className="fi-escena">
        <div className="fi-marco" aria-hidden="true" />
        <div className="fi-texto">
          <h2 className="fi-h" id="reaccion-t">{R.h}</h2>
          {R.p.map((p, i) => <p key={i} className="fi-p">{p}</p>)}
          <Lista n="2" L={R} />
        </div>
        <div className="fi-plano">
          <svg className="fi-fig" viewBox="-240.4 -211.9 970.1 578.1" preserveAspectRatio="xMidYMid meet" role="img" aria-label={R.svgLabel} focusable="false" dangerouslySetInnerHTML={reaccion ?? undefined} />
          <div className="fi-tags" aria-hidden="true">
            {R.piezas.map((pz, i) => (
              <span key={i} className="fi-tag" data-p={String(i + 1)}>
                <span className="fi-tag-n">{`2.${i + 1}`}</span><span className="fi-tag-t">{pz.tag}</span>
              </span>
            ))}
          </div>
        </div>
        <Cajetin lamina="2/7" titulo={R.cajetin} t={t} logo={logo} />
      </div>
    </section>
  );
}

/* ---------- La oficina: la fachada y las salas, con el enlace a /offices ----------
   Lo que la portada mostraba con «La firma» (la fachada, la biblioteca y el detalle de arte, con el
   enlace a la oficina) más las dos fotos que la página ya tenía. Rejilla de la demo (sh-ofi, 12
   columnas): la fachada fija el alto de las dos de su derecha, y la oficina privada el de la recepción. */
export type FotoOficina = { src: string; srcSet?: string; alt: string; w: number; h: number; attrs?: LangAttrs };
const OFI_ORDEN = ["fachada", "biblioteca", "detalle", "privada", "recepcion"] as const;
const OFI_SIZES: Record<(typeof OFI_ORDEN)[number], string> = {
  fachada: "(min-width: 1416px) 720px, (min-width: 901px) 56vw, 92vw",
  biblioteca: "(min-width: 1416px) 510px, (min-width: 901px) 40vw, (min-width: 561px) 60vw, 92vw",
  detalle: "(min-width: 1416px) 510px, (min-width: 901px) 40vw, (min-width: 561px) 30vw, 92vw",
  privada: "(min-width: 1416px) 510px, (min-width: 901px) 40vw, (min-width: 561px) 30vw, 92vw",
  recepcion: "(min-width: 1416px) 720px, (min-width: 901px) 56vw, (min-width: 561px) 60vw, 92vw",
};

/* La entrada de la demo (shell.js, «Nuestras oficinas»): cada foto se descubre una vez al entrar, en orden.
   La clase sh-js-ofi va en <html> para que también rijan las reglas de Modo Mario (html.rm.sh-js-ofi). */
function initOficina(sec: HTMLElement): (() => void) | void {
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
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
  figs.forEach((f) => io.observe(f));
  return () => { io.disconnect(); if (!yaEstaba) html.classList.remove("sh-js-ofi"); };
}

export function Oficina({
  titulo, href, lead, leadAttrs, fotos,
}: {
  titulo: string;
  href: string;
  lead: string;
  leadAttrs?: LangAttrs;
  fotos: Record<(typeof OFI_ORDEN)[number], FotoOficina>;
}) {
  const ref = useRef<HTMLElement>(null);
  useV3Module(ref, initOficina);
  return (
    <section ref={ref} className="nf-oficina" aria-labelledby="nf-oficina-h" data-testid="gallery-about-office">
      <div className="sh-wrap nf-oficina__cab">
        <h2 id="nf-oficina-h" className="sh-h2">
          <Link className="nf-oficina__a" href={href} data-testid="link-about-offices">{titulo}</Link>
        </h2>
        {/* la dirección y la frase del cristal, cada una en su línea (si no, «En / el cristal» en el teléfono) */}
        <p className="nf-oficina__lead" {...leadAttrs}>
          {frases(sinCortes(lead)).map((frase, i) => <span key={i} className="nf-oficina__frase">{frase} </span>)}
        </p>
      </div>
      <div className="sh-wrap">
        <div className="sh-ofi nf-ofi">
          {OFI_ORDEN.map((k) => {
            const f = fotos[k];
            return (
              <figure key={k} className={`sh-ofi__f nf-ofi__f nf-ofi__f--${k}`}>
                <div className="sh-ofi__m">
                  <img src={f.src} srcSet={f.srcSet} sizes={OFI_SIZES[k]} alt={f.alt} {...f.attrs} width={f.w} height={f.h} loading="lazy" decoding="async" />
                </div>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
