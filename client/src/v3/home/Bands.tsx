/* Bandas del Inicio v3 (demo aprobada el 5-11-2026, vista #inicio): la firma en una frase con sus
   cifras sobre una línea de cota (sh-intro), las industrias (sh-indi) y la filosofía (sh-filo). Mismas
   clases y estructura que la demo para que demo.css las pinte sin cambios. */
import { useRef, type ReactNode } from "react";
import { Link } from "wouter";
import { useV3Lang, useV3Module, type V3Lang } from "@/v3/shared";
import { keepFirmName } from "@/lib/firmName";
import { homeCopy } from "./copy";
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

/** La firma en una frase, «Conozca la firma» a su lado y las cifras sobre la línea de cota. */
export function IntroBand({ lang, areas }: { lang: V3Lang; areas: number }) {
  const t = homeCopy[lang].intro;
  return (
    <section className="sh-intro" id="firma-intro" aria-labelledby="intro-h">
      <div className="sh-wrap sh-intro__in">
        <h2 id="intro-h" className="sh-sr">{t.h}</h2>
        <p className="sh-intro__frase">{keepFirmName(t.frase)}</p>
        <Link className="sh-boton sh-intro__boton" href="/about">{t.boton}</Link>
        <dl className="sh-cifras">
          <div><dt>{t.cifras.anos}</dt><dd>40+</dd></div>
          <div><dt>{t.cifras.ciudades}</dt><dd>72+</dd></div>
          <div><dt>{t.cifras.entidades}</dt><dd>32</dd></div>
          <div><dt>{t.cifras.areas}</dt><dd>{areas}</dd></div>
        </dl>
      </div>
    </section>
  );
}

/** Industrias que asesoramos: cuatro fotos verticales con su nombre y una línea. */
export function IndustriasBand({ lang }: { lang: V3Lang }) {
  const t = homeCopy[lang].industrias;
  return (
    <section className="sh-indi" aria-labelledby="ini-ind-h">
      <div className="sh-wrap">
        <div className="sh-indi__cab">
          <h2 id="ini-ind-h" className="sh-h2">{t.titulo}</h2>
          <Link className="sh-boton" href="/industries">{t.boton}</Link>
        </div>
        <ul className="sh-indi__lista" role="list">
          {t.items.map((it) => (
            <li key={it.clave} className="sh-indi__item">
              <Link className="sh-indi__a" href="/industries">
                <span className="sh-indi__m">
                  <img data-no-parallax="" src={it.img} alt={it.alt} width={2000} height={1333} loading="lazy" decoding="async" style={{ objectPosition: it.pos }} />
                </span>
                <span className="sh-indi__n">{it.nombre}</span>
                <span className="sh-indi__l">{it.linea}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Filosofía: la turbina de la capacidad de reacción, con la frase de la preparación para juicio. */
export function FilosofiaBand({ lang }: { lang: V3Lang }) {
  const ref = useRef<HTMLElement>(null);
  const t = homeCopy[lang].filosofia;
  useV3Module(ref, initFilo);
  return (
    <section ref={ref} className="sh-filo sobre-azul" aria-labelledby="ini-filo-h">
      <figure className="sh-filo__foto" aria-hidden="true">
        <img data-no-parallax="" src={v3Asset("/v3/c-reaccion.webp")} alt="" width={2400} height={1600} loading="lazy" decoding="async" />
      </figure>
      <div className="sh-wrap sh-filo__in">
        <h2 id="ini-filo-h" className="sh-filo__frase">{t.frase}</h2>
        <p className="sh-filo__p">{t.texto}</p>
        <Link className="sh-boton" href="/about">{t.boton}</Link>
      </div>
    </section>
  );
}
