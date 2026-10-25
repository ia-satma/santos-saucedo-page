import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "wouter";
import { fallbackToOriginalSrc, getTeamPhotoSrcSet } from "@/lib/teamPhotoSources";
import { Lineas } from "./primitives";

export type Partner = { name: string; slug: string; image: string; role: string; practice: string };

/* «Lienzo»: los socios de la portada (equipo de motion, 25-10-2026; base: 21st.dev «Hover Expand»).
   Cada retrato es un lienzo en una fila. El abierto muestra al socio; los cerrados, solo una franja
   del cuadro que hay detrás de cada retrato (la obra de la firma, nunca media cara): la imagen
   queda anclada a la izquierda a su tamaño abierto y lo único que se mueve es el marco.
   La lista de nombres manda sobre los lienzos: pasar por un nombre o un lienzo, o enfocarlo con el
   teclado, abre ese socio; el último abierto se queda abierto. En pantallas táctiles, el primer
   toque abre el lienzo y el segundo lleva a la ficha. Los retratos miden 541 px: el lienzo abierto
   no pasa de 380 px para que se vean nítidos. */
export function Lienzo({ people, lang }: { people: Partner[]; lang: "es" | "en" }) {
  const [active, setActive] = useState(0);
  const timer = useRef<number>();
  // Intención: 90 ms sobre un lienzo o un nombre antes de abrirlo (no se abren al cruzar)
  const choose = (i: number, delay = 90) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setActive(i), delay);
  };
  const cancel = () => window.clearTimeout(timer.current);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const current = people[active] ?? people[0];
  if (!current) return null;
  const more = lang === "es" ? "Ver perfil" : "View profile";
  const role = (r: string) => r.replace(/\((in)\s+(memoriam)\)/gi, "($1 $2)");

  return (
    <div className="ss-lienzo mt-14 flex flex-col gap-y-12 lg:mt-16 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-[clamp(32px,4vw,72px)]">
      {/* Nombres: el índice que maneja los lienzos (y los enlaces a cada ficha) */}
      <ol className="order-2 border-t border-ss-rule lg:order-1 lg:col-span-5">
        {people.map((person, i) => {
          const on = i === active;
          return (
            <li key={person.slug} className="border-b border-ss-rule">
              <Link
                href={`/team/${person.slug}`}
                className="inline-link group grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 py-6 lg:py-7"
                onMouseEnter={() => choose(i)}
                onMouseLeave={cancel}
                onFocus={() => choose(i, 0)}
                aria-current={on ? "true" : undefined}
              >
                <span aria-hidden="true" className="ss-label ss-num pt-[0.55em] text-ss-medio">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex min-w-0 flex-col gap-3">
                  <span
                    className={`ss-display text-[clamp(28px,2.6vw,42px)] font-normal leading-[1.08] tracking-[-0.012em] transition-colors [transition-duration:var(--ss-dur-quick)] ${
                      on ? "text-ss-marino" : "text-ss-marino/70 group-hover:text-ss-marino"
                    }`}
                  >
                    <Lineas text={person.name} delay={0.15 + i * 0.07} />
                  </span>
                  <span className="flex items-center gap-3">
                    <span aria-hidden="true" className={`ss-lienzo-mark ${on ? "is-on" : ""}`} />
                    <span className="ss-label text-ss-medio">{role(person.role)}</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Lienzos: decorativos para el lector de pantalla (los nombres ya enlazan cada ficha) */}
      <div className="order-1 lg:order-2 lg:col-span-7">
        <div className="ss-lienzo-row" aria-hidden="true">
          {people.map((person, i) => (
            <Link
              key={person.slug}
              href={`/team/${person.slug}`}
              tabIndex={-1}
              data-curtain=""
              style={{ "--reveal-delay": `${0.25 + i * 0.09}s`, viewTransitionName: `retrato-${person.slug}` } as CSSProperties}
              className={`ss-lienzo-canvas ${i === active ? "is-open" : ""}`}
              onMouseEnter={() => choose(i)}
              onMouseLeave={cancel}
              onClick={(e) => {
                // Táctil: el primer toque abre el lienzo; el segundo, ya abierto, lleva a la ficha
                if (i !== active && window.matchMedia("(hover: none)").matches) {
                  e.preventDefault();
                  setActive(i);
                }
              }}
            >
              <img
                src={person.image}
                data-portrait-slug={person.slug}
                {...(getTeamPhotoSrcSet(person.image) ? { srcSet: getTeamPhotoSrcSet(person.image), sizes: "380px" } : {})}
                onError={fallbackToOriginalSrc}
                alt=""
                loading="lazy"
                decoding="async"
                width={652}
                height={652}
                className="ss-photo ss-lienzo-img"
              />
            </Link>
          ))}
        </div>
        {/* Cédula del socio abierto, como la de una obra: cargo, práctica y enlace a su ficha */}
        <div key={current.slug} className="ss-lienzo-caption mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="ss-label text-ss-medio">
            <span className="text-ss-marino">{role(current.role)}</span>
            {current.practice ? <> · {current.practice}</> : null}
          </p>
          <Link href={`/team/${current.slug}`} className="inline-link ss-label text-ss-marino" tabIndex={-1} aria-hidden="true">
            {more} <span className="ss-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
