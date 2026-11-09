/* Bandas del Inicio v3 (demo aprobada el 5-11-2026, vista #inicio): la firma en una frase con sus
   cifras sobre una línea de cota (sh-intro), las industrias (sh-indi) y la filosofía (sh-filo). Mismas
   clases y estructura que la demo para que demo.css las pinte sin cambios. */
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "wouter";
import defaults from "@shared/cms-defaults.json";
import { useCmsContent } from "@/hooks/useCmsContent";
import { home26 } from "@/components/home26/content";
import { useV3Lang, useV3Module, v3SrcSet, type V3Lang } from "@/v3/shared";
import { keepFirmName } from "@/lib/firmName";
import { homeCopy } from "./copy";
import { INDUSTRIAS_TEXTS } from "@/v3/industrias/texts";
import { useFotosDiferidas } from "@/v3/fotosDiferidas";
import { PREVIA_INDUSTRIA } from "@/v3/home/industriasPrevia";
import { initFilo } from "./scripts";
import "./home.css";
import { v3Asset } from "../asset";

export type Tone = "light" | "dark";

/** Envoltura .v3 de cada banda: demo.css se aplica dentro y las piezas del sitio (Empresas extranjeras,
    Monitor Laboral) quedan fuera. data-start / data-end dicen el tono con que la banda empieza y
    termina: home.css marca la unión cuando dos bandas del mismo tono quedan juntas (orden del panel). */
export function Band({ start, end = start, name, children }: { start: Tone; end?: Tone; name: string; children: ReactNode }) {
  const { attrs } = useV3Lang();
  return (
    <div className={`v3 hm-band hm-band--${name}`} data-vista="inicio" data-start={start} data-end={end} {...attrs}>
      {children}
    </div>
  );
}

/** Las dos últimas palabras de un texto del panel quedan juntas (espacio duro): sin viuda al final,
    como la demo escribía «a&nbsp;su&nbsp;personal» y «a&nbsp;juicio». */
const sinViuda = (s: string) => s.replace(/\s+(\S+)\s*$/, "\u00a0$1");

/** La firma en una frase, «Conozca la firma» a su lado y las cifras sobre la línea de cota.
    Título (oculto) y frase del panel (home.firma); años y ciudades, de las cifras de «La firma»
    (about.stats); el botón y las etiquetas, de copy.ts. */
export function IntroBand({ lang, areas }: { lang: V3Lang; areas: number }) {
  const t = homeCopy[lang].intro;
  const f = useCmsContent("home", home26)[lang].firma;
  const stats = useCmsContent("about", defaults.about)[lang]?.stats;
  const anos = stats?.[0]?.value?.trim() || "40+";
  const ciudades = stats?.[1]?.value?.trim() || "72+";
  return (
    <section className="sh-intro" id="firma-intro" aria-labelledby="intro-h">
      <div className="sh-wrap sh-intro__in">
        <h2 id="intro-h" className="sh-sr">{f.title}</h2>
        <p className="sh-intro__frase">{keepFirmName(sinViuda(f.body[0] ?? ""))}</p>
        <Link className="sh-boton sh-intro__boton" href="/about">{t.boton}</Link>
        <dl className="sh-cifras">
          <div><dt>{t.cifras.anos}</dt><dd>{anos}</dd></div>
          <div><dt>{t.cifras.ciudades}</dt><dd>{ciudades}</dd></div>
          <div><dt>{t.cifras.entidades}</dt><dd>32</dd></div>
          <div><dt>{t.cifras.areas}</dt><dd>{areas}</dd></div>
        </dl>
      </div>
    </section>
  );
}

/** Industrias que asesoramos: las nueve industrias como franjas apiladas (acordeón). Cada franja es
    una tira de su foto bajo el velo Azul noche; la que se señala (mouse, teclado o toque) se abre,
    muestra la foto y su línea, y lleva a su apartado en «Industrias». Siempre hay una abierta: el
    bloque nunca queda plano. Nombres, líneas y fotos son los de la página «Industrias». */
export function IndustriasBand({ lang }: { lang: V3Lang }) {
  const t = homeCopy[lang].industrias;
  const items = INDUSTRIAS_TEXTS[lang].industrias;
  const [abierta, setAbierta] = useState(0);
  const fotos = useFotosDiferidas();
  return (
    <section className="sh-indi" aria-labelledby="ini-ind-h">
      <div className="sh-wrap">
        <div className="sh-indi__cab">
          <h2 id="ini-ind-h" className="sh-h2">{t.titulo}</h2>
          <Link className="sh-boton" href="/industries">{t.boton}</Link>
        </div>
        <ul className="hm-acord" role="list">
          {items.map((it, i) => {
            const on = i === abierta;
            const panel = `hm-acord-${it.id}`;
            return (
              <li key={it.id} className={on ? "hm-acord__it is-on" : "hm-acord__it"}
                onPointerEnter={(e) => { if (e.pointerType === "mouse") setAbierta(i); }}>
                {/* Debajo, la vista previa diminuta de la misma foto (ya viene en el código); encima, la foto
                    real, que entra con un fundido al llegar. La franja abierta pide su foto primero. */}
                <span className="hm-acord__foto" aria-hidden="true"
                  style={{ "--previa": PREVIA_INDUSTRIA[it.id] ? `url("${PREVIA_INDUSTRIA[it.id]}")` : "none", "--previa-pos": it.pos } as CSSProperties}>
                  <img data-no-parallax="" src={fotos ? it.img : undefined} srcSet={fotos ? v3SrcSet(it.img, 2000) : undefined}
                    sizes="(max-width: 1440px) 100vw, 1440px" alt="" width={it.w} height={it.h} loading="lazy"
                    {...{ fetchpriority: on ? "high" : "low" }} decoding="async" style={{ objectPosition: it.pos }}
                    onLoad={(e) => { e.currentTarget.dataset.lista = ""; }} />
                </span>
                <button type="button" className="hm-acord__cab" aria-expanded={on} aria-controls={panel}
                  onClick={() => setAbierta(i)} onFocus={() => setAbierta(i)}>
                  <span className="hm-acord__num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span className="hm-acord__nom">{it.nombre}</span>
                  <span className="hm-acord__signo" aria-hidden="true" />
                </button>
                <div className="hm-acord__panel" id={panel} hidden={!on}>
                  <p className="hm-acord__linea">{it.linea}</p>
                  <ul className="hm-acord__asuntos" role="list">
                    {it.lista.slice(0, 3).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                  <Link className="hm-acord__ir" href={`/industries#in-${it.id}`} tabIndex={on ? 0 : -1}>{t.ver}</Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Filosofía: la turbina de la capacidad de reacción, con la frase de la preparación para juicio.
    Textos del panel (home.creemos): quote = titular, body[0] = párrafo, label = botón. */
export function FilosofiaBand({ lang }: { lang: V3Lang }) {
  const ref = useRef<HTMLElement>(null);
  const c = useCmsContent("home", home26)[lang].creemos;
  useV3Module(ref, initFilo);
  const fotos = useFotosDiferidas();
  return (
    <section ref={ref} className="sh-filo sobre-azul" aria-labelledby="ini-filo-h">
      <figure className="sh-filo__foto" aria-hidden="true">
        <img data-no-parallax="" src={fotos ? v3Asset("/v3/c-reaccion.webp") : undefined} alt="" width={2400} height={1600} loading="lazy" decoding="async" />
      </figure>
      <div className="sh-wrap sh-filo__in">
        <h2 id="ini-filo-h" className="sh-filo__frase">{sinViuda(c.quote)}</h2>
        {c.body[0] ? <p className="sh-filo__p">{c.body[0]}</p> : null}
        <Link className="sh-boton" href="/about">{c.label}</Link>
      </div>
    </section>
  );
}
