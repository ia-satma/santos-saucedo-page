/* Módulo «industrias» (in-) de la demo v3: lo que la firma atiende en cada industria, contado al bajar.
   Escritorio (≥1000 px): a la izquierda, una foto fija a toda la altura (bajo el encabezado del sitio)
   que cambia con un fundido cuando el texto de cada industria pasa por el centro de la pantalla; sobre
   la foto, el índice de las cuatro industrias con la marca lima en la actual. A la derecha, el texto.
   Tableta, teléfono y Modo Mario: cada industria con su foto a sangre, su nombre sobre la foto y,
   debajo, la línea y la lista. Nada se mueve solo. Marcado y clases: modules/industrias/section.html. */
import { useLayoutEffect, useRef } from "react";
import { Link } from "wouter";
import "./industrias.css";
import { initIndustrias } from "./initIndustrias";
import type { IndustriasTexts } from "./texts";
import { v3SrcSet } from "../shared";

export function Sectores({ t, headingId }: { t: IndustriasTexts; headingId: string }) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    return initIndustrias(el);
  }, []);

  return (
    <section ref={ref} className="in sobre-azul" id="industrias-sectores" aria-labelledby={headingId} data-in="">
      <div className="in-esc">
        <div className="in-media">
          <div className="in-media__fija">
            {/* La foto fija solo se ve desde 1000 px; debajo, sizes de 1 px hace que no pida la grande */}
            <div className="in-fotos" aria-hidden="true">
              {t.industrias.map((ind, i) => (
                <figure key={ind.id} className={i === 0 ? "in-foto is-on" : "in-foto"} data-i={i}>
                  <img src={ind.img} srcSet={v3SrcSet(ind.img, ind.w)} sizes="(max-width: 999.98px) 1px, max(50vw, 150vh)" alt="" width={ind.w} height={ind.h} decoding="async" loading="lazy" style={{ objectPosition: ind.pos }} />
                </figure>
              ))}
            </div>
            <nav className="in-indice" aria-label={t.indice}>
              <ul role="list">
                {t.industrias.map((ind, i) => (
                  <li key={ind.id}>
                    <a href={`#in-${ind.id}`} data-i={i} className={i === 0 ? "is-on" : undefined} aria-current={i === 0 ? "true" : undefined}>
                      {ind.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="in-textos">
          {t.industrias.map((ind, i) => (
            <article key={ind.id} className={i === 0 ? "in-art is-on" : "in-art"} id={`in-${ind.id}`} data-i={i} aria-labelledby={`in-${ind.id}-h`}>
              <figure className="in-art__foto" aria-hidden="true">
                <img src={ind.img} srcSet={v3SrcSet(ind.img, ind.w)} sizes="100vw" alt="" width={ind.w} height={ind.h} decoding="async" loading="lazy" style={{ objectPosition: ind.pos }} />
              </figure>
              <h2 className="in-nombre" id={`in-${ind.id}-h`}>{ind.nombre}</h2>
              <p className="in-linea">{ind.linea}</p>
              <ul className="in-lista" role="list">
                {ind.lista.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="in-wrap in-cierre">
        <p>{t.cierre.texto} <Link href="/team#presencia">{t.cierre.enlace}</Link></p>
      </div>
    </section>
  );
}
