import { Fragment } from "react";
import { Link } from "wouter";
import edificioCerro from "@assets/ss26/edificio-cerro.webp";
import salaJuntas from "@assets/ss26/sala-juntas.webp";
import socioSantosArce from "@assets/ss26/socio-enrique-hernan-santos-arce.webp";
import socioSantosGuzman from "@assets/ss26/socio-enrique-hernan-santos-guzman.webp";
import socioSaucedoMontemayor from "@assets/ss26/socio-mario-saucedo-montemayor.webp";
import { Reveal, SectionHead, TextLink, useInView } from "./primitives";
import { home26, langAttrs, type Lang26 } from "./content";

/* Ritmo vertical propio de cada sección. Los pares de Codex §5.2 (móvil/escritorio)
   van en md/lg; en teléfono un paso menos para no alargar la página. */
const Y = {
  firma: "py-[88px] md:py-[112px] lg:py-[144px]",
  creemos: "py-[96px] md:py-[128px] lg:py-[176px]",
  practicas: "py-[80px] md:py-[104px] lg:py-[136px]",
  monitor: "py-[72px] md:py-[96px] lg:py-[128px]",
  socios: "py-[72px] md:py-[96px] lg:py-[128px]",
} as const;

/* Separación entre foto y texto en Extranjeras */
const GAP_X = "lg:gap-x-[clamp(32px,6vw,96px)]";

const socioPhotos: Record<string, string> = {
  "santos-arce": socioSantosArce,
  "santos-guzman": socioSantosGuzman,
  "saucedo-montemayor": socioSaucedoMontemayor,
};

/* § 01 — La firma */
export function Firma26({ lang }: { lang: Lang26 }) {
  const t = home26[lang].firma;
  const [photoRef, photoIn] = useInView<HTMLDivElement>();
  return (
    <section id="firma" {...langAttrs[lang]} className={`ss-paper ${Y.firma}`} aria-labelledby="ss26-firma">
      {/* Retícula de 12: texto en 5 columnas, foto de la 7 a la 12 */}
      <div className="ss-container grid grid-cols-1 gap-y-14 lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-5">
          <Reveal>
            <SectionHead num="01" label={t.label} />
          </Reveal>
          <Reveal delay={0.06}>
            <h2 id="ss26-firma" className="ss-display mt-8 text-[clamp(40px,4.5vw,72px)]">
              {t.title}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="ss-prose mt-10 space-y-6 text-ss-ink/80">
              {t.body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <TextLink href="/about" className="mt-10">
              {t.link}
            </TextLink>
          </Reveal>
        </div>

        <figure className="lg:col-span-6 lg:col-start-7">
          <div ref={photoRef} className="overflow-hidden bg-ss-ink">
            <img
              src={edificioCerro}
              alt={t.alt}
              loading="lazy"
              decoding="async"
              width={952}
              height={937}
              // 3:4 desde el borde izquierdo: deja fuera el letrero del estacionamiento
              // (x 712–918 de 952) y conserva la entrada y el cerro reflejado
              className={`ss-photo ss-settle aspect-[3/4] w-full object-cover object-[0%_50%] ${photoIn ? "is-in" : ""}`}
            />
          </div>
          <figcaption className="mt-4 flex gap-4 text-[14px] leading-snug text-ss-ink/65">
            <span className="ss-label shrink-0 text-[11px] tracking-[0.12em] text-ss-ink">Fig. 1</span>
            <span>{t.caption}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* § 02 — Lo que creemos */
export function Creemos26({ lang }: { lang: Lang26 }) {
  const t = home26[lang].creemos;
  return (
    <section
      {...langAttrs[lang]}
      className={`ss-panel relative isolate overflow-hidden text-white ${Y.creemos}`}
      aria-labelledby="ss26-creemos"
    >
      <div className="ss-container grid grid-cols-1 gap-x-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-12">
          <SectionHead num="02" label={t.label} tone="dark" />
        </Reveal>
        <Reveal delay={0.08} className="mt-12 lg:col-span-11 lg:mt-16">
          <h2 id="ss26-creemos" className="ss-serif text-[clamp(44px,6.4vw,108px)] leading-[1.02] tracking-[-0.015em] text-white [text-wrap:balance]">
            {t.quote}
          </h2>
        </Reveal>
        {/* 1024–1279: una sola columna (dos de ~290px quedaban apretadas) */}
        <div className="mt-14 grid gap-8 text-white/75 md:grid-cols-2 lg:col-span-8 lg:col-start-5 lg:mt-20 lg:grid-cols-1 lg:gap-10 xl:grid-cols-2">
          {t.body.map((p, i) => (
            <Reveal key={p.slice(0, 24)} delay={0.14 + i * 0.06}>
              <p className="ss-prose text-[17px]">{p}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* § 03 — Prácticas */
export function Practicas26({ lang }: { lang: Lang26 }) {
  const t = home26[lang].practicas;
  return (
    <section id="practices" {...langAttrs[lang]} className={`ss-paper bg-white ${Y.practicas}`} aria-labelledby="ss26-practicas">
      <div className="ss-container grid grid-cols-1 gap-x-6 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <SectionHead num="03" label={t.label} />
            </Reveal>
            <Reveal delay={0.06}>
              <h2 id="ss26-practicas" className="ss-display mt-8 text-[clamp(40px,4.5vw,72px)]">
                {t.title.map((line, i) => (
                  <Fragment key={line}>
                    {i > 0 && " "}
                    <span className="block">{line}</span>
                  </Fragment>
                ))}
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <TextLink href="/practice-groups" className="mt-10">
                {t.link}
              </TextLink>
            </Reveal>
          </div>
        </div>

        {/* Las reglas entre filas se quedan: llevan el trazo del hover */}
        <ol className="border-t border-ss-ink/15 lg:col-span-8">
          {t.items.map((item, i) => (
            <Reveal as="li" key={item.slug} delay={i * 0.06} className="ss-row relative border-b border-ss-ink/15">
                {/* inline-link: fuera de la regla móvil de index.css que vuelve inline-flex todo <a>.
                    Nombre del enlace = título; el texto va como descripción. */}
                <Link
                  href={`/practice-groups/${item.slug}`}
                  aria-labelledby={`ss26-pr-${item.slug}`}
                  aria-describedby={`ss26-prd-${item.slug}`}
                  className="inline-link grid grid-cols-1 gap-y-3 py-8 sm:grid-cols-[88px_1fr_auto] sm:gap-x-8 lg:py-10"
                >
                  {/* Subnumeración del expediente (§ 3.1…); la lista ya numera para lectores de pantalla */}
                  <span aria-hidden className="ss-row-num ss-label ss-num text-[12px]">
                    § 3.{i + 1}
                  </span>
                  <span>
                    <span id={`ss26-pr-${item.slug}`} className="ss-display block text-[32px] leading-[0.95] sm:text-[44px]">
                      {item.title}
                    </span>
                    <span id={`ss26-prd-${item.slug}`} className="ss-prose mt-4 block max-w-[60ch] text-[17px] text-ss-ink/70">
                      {item.body}
                    </span>
                  </span>
                  <span aria-hidden className="ss-arrow hidden pt-2 text-[22px] sm:block">
                    →
                  </span>
                </Link>
                <span aria-hidden className="ss-row-rule absolute -bottom-px left-0 h-[2px] w-full bg-ss-ink" />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* § 04 — Empresas extranjeras en México */
export function Extranjeras26({ lang }: { lang: Lang26 }) {
  const t = home26[lang].extranjeras;
  return (
    <section
      {...langAttrs[lang]}
      className="ss-gradient relative isolate overflow-hidden text-white"
      aria-labelledby="ss26-extranjeras"
    >
      {/* Foto / texto 7fr / 5fr */}
      <div className={`grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] ${GAP_X}`}>
        <div className="relative min-h-[300px] overflow-hidden sm:min-h-[420px] lg:min-h-[600px]">
          {/* Duotono de marca (gris + violeta en multiplicar): la fuente de 1280px,
              muy comprimida, se lee como textura y no como bloques de JPEG */}
          <img
            src={salaJuntas}
            alt={t.alt}
            loading="lazy"
            decoding="async"
            width={1280}
            height={720}
            className="absolute inset-0 h-full w-full object-cover object-[50%_42%] contrast-[1.1] grayscale"
          />
          <span aria-hidden className="absolute inset-0 bg-ss-violet/50 mix-blend-multiply" />
        </div>
        <div className="flex items-center px-[var(--ss-pad)] py-20 lg:py-24 lg:pl-0 lg:pr-[clamp(48px,6vw,104px)]">
          <div className="max-w-[560px]">
            <Reveal>
              <SectionHead num="04" label={t.label} tone="dark" />
            </Reveal>
            <Reveal delay={0.06}>
              <h2 id="ss26-extranjeras" className="ss-display mt-8 text-[clamp(44px,4.6vw,72px)]">
                {t.title}
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="ss-prose mt-8 text-white/75">{t.body}</p>
            </Reveal>
            <ol className="mt-10 space-y-4">
              {t.steps.map((step, i) => (
                <Reveal as="li" key={step} delay={0.16 + i * 0.06} className="flex items-baseline gap-5">
                  {/* La lista ya numera; el número visible es solo gráfico */}
                  <span aria-hidden="true" className="ss-label ss-num w-6 text-ss-lime">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[17px] text-white/90">{step}</span>
                </Reveal>
              ))}
            </ol>
            <Reveal delay={0.3}>
              <TextLink href="/practice-groups" tone="dark" className="mt-10">
                {t.link}
              </TextLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* § 05 — Monitor Laboral */
// "Tema: desarrollo" → tema y desarrollo en bloques separados desde tableta, sin cambiar el texto
function splitAtColon(title: string): [string, string] | null {
  const i = title.indexOf(": ");
  return i < 0 ? null : [title.slice(0, i + 1), title.slice(i + 2)];
}

export function Monitor26({ lang }: { lang: Lang26 }) {
  const t = home26[lang].monitor;
  return (
    <section id="news" {...langAttrs[lang]} className={`ss-paper ${Y.monitor}`} aria-labelledby="ss26-monitor">
      <div className="ss-container">
        {/* Cabecera acotada a 60rem con el enlace al Monitor a la derecha, como en Socios */}
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div className="max-w-[60rem]">
            <Reveal>
              <SectionHead num="05" label={t.label} />
            </Reveal>
            <Reveal delay={0.06}>
              <h2 id="ss26-monitor" className="ss-display mt-8 text-[clamp(40px,4.5vw,72px)]">
                {t.title}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="ss-lead mt-5 max-w-[38em] text-ss-ink/70">{t.intro}</p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <TextLink href="/news">{t.link}</TextLink>
          </Reveal>
        </div>

        {/* Propuestas de análisis: todavía no son artículos, así que no enlazan.
            Escritorio: el principal en 7 columnas y dos al costado desde la columna 9
            (misma línea que la tercera columna de Socios). */}
        <ul className="mt-14 grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-12 lg:mt-16 lg:grid-cols-12 lg:gap-x-6">
          {t.items.map((item, i) => {
            const lead = i === 0;
            const last = i === t.items.length - 1;
            const parts = lead ? splitAtColon(item.title) : null;
            const placement = lead
              ? "md:col-span-2 lg:col-span-7 lg:row-span-2 lg:pr-10"
              : `lg:col-span-4 lg:col-start-9 ${last ? "lg:border-t lg:border-ss-ink/15 lg:pt-10" : ""}`;
            return (
              <Reveal as="li" key={item.title} delay={i * 0.06} className={placement}>
                <p className="ss-label ss-num flex gap-3 text-[11px] tracking-[0.12em] text-ss-ink/70">
                  {item.date && <span>{item.date}</span>}
                  {item.date && <span aria-hidden>·</span>}
                  <span className="text-ss-ink">{item.tag}</span>
                </p>
                {lead ? (
                  <>
                    <h3 className="mt-5 max-w-[24em] text-[clamp(26px,2.6vw,36px)] font-semibold leading-[1.15] tracking-[-0.01em] text-ss-ink [text-wrap:balance]">
                      {/* Dos bloques desde md: cada uno se equilibra por separado
                          (con <br> Chrome no equilibra y deja una palabra sola) */}
                      {parts ? (
                        <>
                          <span className="md:block">{parts[0]}</span> <span className="md:block">{parts[1]}</span>
                        </>
                      ) : (
                        item.title
                      )}
                    </h3>
                    <p className="ss-prose mt-5 max-w-[42em] text-ss-ink/75">{item.body}</p>
                  </>
                ) : (
                  <>
                    <h3 className="mt-4 text-[20px] font-semibold leading-[1.3] tracking-[-0.005em] text-ss-ink lg:text-[22px]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[16px] leading-[1.6] text-ss-ink/70">{item.body}</p>
                  </>
                )}
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* § 06 — Socios fundadores */
export function Socios26({ lang }: { lang: Lang26 }) {
  const t = home26[lang].socios;
  return (
    <section id="socios" {...langAttrs[lang]} className={`ss-paper bg-white ${Y.socios}`} aria-labelledby="ss26-socios">
      <div className="ss-container">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div>
            <Reveal>
              <SectionHead num="06" label={t.label} />
            </Reveal>
            <Reveal delay={0.06}>
              <h2 id="ss26-socios" className="ss-display mt-8 text-[clamp(40px,4.5vw,72px)]">
                {t.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <TextLink href="/team">{t.link}</TextLink>
          </Reveal>
        </div>

        {/* Teléfono: lista con retrato pequeño al lado del nombre; desde sm, tres columnas */}
        <ul className="mt-14 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-y-12 lg:mt-16">
          {t.people.map((person, i) => (
            <Reveal as="li" key={person.name} delay={i * 0.08}>
                <figure className="group grid grid-cols-[112px_1fr] items-end gap-x-5 sm:block">
                  <div className="overflow-hidden bg-ss-paper">
                    {/* Fuente 652×652 recortada a 4:5; alt vacío: el pie ya da el nombre */}
                    <img
                      src={socioPhotos[person.photo]}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width={652}
                      height={652}
                      className="ss-photo aspect-[4/5] h-auto w-full object-cover object-[50%_28%] transition-transform duration-700 [transition-timing-function:var(--ss-ease)] motion-safe:group-hover:scale-[1.01] motion-reduce:transform-none motion-reduce:transition-none"
                    />
                  </div>
                  <figcaption className="sm:mt-5">
                    <span className="ss-display block text-[26px] leading-[0.95] sm:text-[30px] lg:text-[34px]">{person.name}</span>
                    <span className="ss-label mt-3 block text-[11px] tracking-[0.12em] text-ss-ink/70">{t.role}</span>
                  </figcaption>
                </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
