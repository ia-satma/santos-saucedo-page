import { OfficePhotoPair } from "@/components/editorial/OfficePhotography";
import { useCmsMedia } from "@/lib/cmsMedia";
import { useCmsContent } from "@/hooks/useCmsContent";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import fachada768 from "@assets/ss26/oficina/fachada-768.webp";
import fachada1536 from "@assets/ss26/oficina/fachada-1536.webp";
import salaJuntas768 from "@assets/ss26/oficina/sala-juntas-768.webp";
import salaJuntas1536 from "@assets/ss26/oficina/sala-juntas-1536.webp";
import { isNamedOnTeamPage, fallbackToOriginalSrc, getTeamPhotoSrcSet } from "@/lib/teamPhotoSources";
import { keepFirmName } from "@/lib/firmName";
import { useOfficeLabel } from "@/lib/officeLabel";
import { getPracticeImage } from "@/lib/practiceIndustryImages";
import { MonitorList } from "@/components/monitor/MonitorList";
import type { News, PracticeGroup, TeamMember } from "@shared/schema";
import { Lineas, Reveal, SectionHead, TextLink } from "./primitives";
import { Lienzo } from "./Lienzo";
import { CountUp, ReadingReveal, ScrollSettle } from "./motion26";
import { home26, langAttrs, type Lang26 } from "./content";
import { chrome26 } from "./chrome26";

/* Texto de los TextLink: la etiqueta del menú de su destino (chrome26, fuente única de los
   nombres de sección), un solo texto por destino, como en /about. */
const NAV = { firma: 0, practicas: 1, socios: 2, monitor: 3 } as const;
function useNavLabel() {
  const liveChrome = useCmsContent("chrome", chrome26);
  return (lang: Lang26, key: keyof typeof NAV) => liveChrome[lang].nav[NAV[key]].label;
}

/* Ritmo vertical propio de cada sección. Los pares de Codex §5.2 (móvil/escritorio)
   van en md/lg; en teléfono un paso menos para no alargar la página. */
const Y = {
  firma: "py-[88px] md:py-[112px] lg:py-[144px]",
  creemos: "py-[76px] md:py-[92px] lg:py-[120px]",
  practicas: "py-[80px] md:py-[104px] lg:py-[136px]",
  monitor: "py-[72px] md:py-[96px] lg:py-[128px]",
  socios: "py-[72px] md:py-[96px] lg:py-[128px]",
} as const;

/* Fondos (versión C del juicio a ciegas): Azul Profundo solo en el héroe y en Empresas
   extranjeras; el manifiesto sobre Hueso; La firma, Prácticas, Socios y Monitor Laboral en
   blanco (data-surface="light": foco Azul Marino, ss26.css).
   Dos secciones blancas seguidas (Socios y Monitor Laboral): entre ambas, un solo filete Línea
   al ancho del contenedor (JoinRule) con el mismo aire arriba y abajo, en lugar de dos py
   completos. Lo dibuja la sección que sigue a otra blanca, que pierde su padding superior; la
   anterior recorta el inferior (:has). Vale para cualquier orden de las secciones. */
const JOIN_AFTER = "[[data-surface=light]+&]:pt-0";
const JOIN_BEFORE =
  "[&:has(+[data-surface=light])]:pb-[64px] md:[&:has(+[data-surface=light])]:pb-[80px] lg:[&:has(+[data-surface=light])]:pb-[96px]";

function JoinRule() {
  return (
    <div
      aria-hidden="true"
      className="mb-[64px] hidden h-px bg-ss-rule md:mb-[80px] lg:mb-[96px] [[data-surface=light]+section_&]:block"
    />
  );
}

/* Separación entre foto y texto en Extranjeras */
const GAP_X = "xl:gap-x-[clamp(32px,6vw,96px)]";

/* h2 de sección: la escala única del sitio (.ss-h2, 32–40 px, romana 400, Azul Marino;
   index.css). Sobre Azul Profundo se añade text-white. El manifiesto es la excepción: la
   única itálica del sitio. */
const H2 = "ss-h2 mt-8";

/* § 01 — La firma */
export function Firma26({ lang }: { lang: Lang26 }) {
  const officeNameFor = useOfficeLabel();
  const navLabel = useNavLabel();
  const liveHome = useCmsContent("home", home26);
  const t = liveHome[lang].firma;
  const { photos } = useCmsMedia();
  return (
    <section id="firma" {...langAttrs[lang]} data-surface="light" className={`bg-white ${Y.firma}`} aria-labelledby="ss26-firma">
      {/* Retícula de 12. Desde 1280: texto en 4 columnas y foto desde la 5 (el borde de la
          columna 5 es el mismo de Prácticas, Socios y el pie). Entre 1024 y 1279 las 4
          columnas dejaban ~35 caracteres por línea: texto en 5 y foto en 6. */}
      <div className="ss-container grid grid-cols-1 gap-y-14 lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-5 xl:col-span-4">
          <Reveal>
            <SectionHead num="01" />
          </Reveal>
          <h2 id="ss26-firma" className={H2}>
              <Lineas text={t.title} delay={0.06} />
            </h2>
          <Reveal delay={0.12}>
            {/* Bajo lg, la columna ocupa todo el contenedor: medida máxima de 34rem (entre 60 y 75
                caracteres por línea a 18 px, medido en es y en a 768 y 1023); desde lg manda la columna */}
            <div className="ss-prose mt-10 max-w-[34rem] space-y-6 text-ss-tinta lg:max-w-none">
              {/* "Santos & Saucedo" sin partirse entre líneas */}
              {t.body.map((p) => (
                <p key={p.slice(0, 24)}>{keepFirmName(p)}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <TextLink href="/about" className="mt-10">
              {navLabel(lang, "firma")}
            </TextLink>
          </Reveal>
        </div>

        {/* La fachada de la oficina (oficina/fachada, 1159 × 900, sin el estacionamiento),
            nunca más grande que su tamaño nativo: hasta 708 px bajo 1280; desde 1280, las
            columnas 6–12 (746 px a 1440, 760 como máximo), con una columna de aire entre el
            texto y la foto. Siempre contra el borde derecho del contenedor, donde acaban las
            filas de Prácticas, las columnas del manifiesto y el Monitor. Arriba, a la altura de
            la cejilla, sin estirarse ni fijarse al hacer scroll: a 1024 el texto sigue unos
            220 px bajo el pie de foto; a 1440 terminan a la par. */}
        <figure className="w-full max-w-[708px] lg:col-span-6 lg:col-start-7 lg:self-start lg:justify-self-end xl:col-span-7 xl:col-start-6 xl:max-w-none">
          {/* Fondo Línea mientras carga */}
          <div className="overflow-hidden bg-ss-rule">
            <img
              src={photos.fachada.url}
              srcSet={photos.fachada.smallUrl && photos.fachada.smallUrl !== photos.fachada.url ? `${photos.fachada.smallUrl} 768w, ${photos.fachada.url} 1159w` : undefined}
              sizes="(min-width: 1280px) min(760px, 52vw), (min-width: 768px) 708px, calc(100vw - 40px)"
              alt={t.alt}
              loading="lazy"
              decoding="async"
              width={1159}
              height={900}
              // En la portada se muestra en color, igual que los retratos de Socios; /offices,
              // /about, /careers y /contact conservan su color suave. Sin entrada al
              // aparecer (G3)
              className="ss-photo block h-auto w-full"
            />
          </div>
          <OfficePhotoPair photos={["biblioteca", "detalle"]} className="mt-4 md:mt-6" />
          {/* Enlace a la oficina, sin pie descriptivo de la foto. */}
          <div className="mt-4 flex justify-end">
            <TextLink href="/offices" data-testid="link-home-offices">
              {officeNameFor(lang)}
            </TextLink>
          </div>
        </figure>
      </div>
    </section>
  );
}

/* Manifiesto — Lo que creemos (sin numeral: no es una sección del menú; lleva su etiqueta) */
export function Creemos26({ lang }: { lang: Lang26 }) {
  const liveHome = useCmsContent("home", home26);
  const t = liveHome[lang].creemos;
  return (
    // Banda Hueso: titular Azul Marino, texto Gris Tinta, § Azul Marino (sin lima sobre claro)
    <section {...langAttrs[lang]} className={`ss-paper ss-banda ${Y.creemos}`} aria-labelledby="ss26-creemos">
      <div className="ss-container">
        <Reveal>
          <SectionHead label={t.label} />
        </Reveal>
        <Reveal delay={0.08} className="mt-[clamp(34px,5vw,60px)]">
          {/* Las palabras se encienden una a una al bajar (21st.dev «Reading Text Reveal») */}
          <ReadingReveal
            id="ss26-creemos"
            text={t.quote}
            className="ss-serif max-w-[15ch] text-[clamp(46px,6.3vw,92px)] leading-[1.02] text-ss-marino [text-wrap:balance]"
          />
        </Reveal>
        <div className="ss-creemos-body text-ss-tinta">
          {t.body.map((p, i) => (
            <Reveal key={p.slice(0, 24)} delay={0.14 + i * 0.06}>
              <p className="ss-prose text-[18px]">{p}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* § 02 — Prácticas */
export function Practicas26({ lang }: { lang: Lang26 }) {
  const navLabel = useNavLabel();
  const liveHome = useCmsContent("home", home26);
  const t = liveHome[lang].practicas;
  const { data: groups = [], isError: practicesError } = useQuery<PracticeGroup[]>({ queryKey: ["/api/practice-groups"] });
  const items = practicesError ? [] : groups.map(group => ({
    slug: group.slug,
    title: lang === "es" ? group.nameEs : group.name,
    body: lang === "es" ? group.descriptionEs : group.description,
    // La portada conserva la serie aprobada para cada práctica, aunque el CMS tenga
    // una ruta anterior. Las fotos personalizadas siguen disponibles en el CMS.
    imageUrl: getPracticeImage(group.slug),
  }));
  const [active, setActiveRaw] = useState(0);
  // Barrido direccional (equipo de motion): al bajar por la lista la imagen nueva se abre hacia
  // arriba, al subir se abre hacia abajo; la anterior queda debajo y se acerca un poco
  const [prev, setPrev] = useState(-1);
  const [dir, setDir] = useState<"up" | "down">("up");
  const setActive = (i: number) => {
    if (i === active) return;
    setPrev(active);
    setDir(i > active ? "up" : "down");
    setActiveRaw(i);
  };
  return (
    <section
      id="practices"
      {...langAttrs[lang]}
      data-surface="light"
      className={`bg-white ${Y.practicas}`}
      aria-labelledby="ss26-practicas"
    >
      <div className="ss-container">
        {/* Cabecera como en Socios y Monitor Laboral (M3): § y h2 a la izquierda y el enlace a
            Prácticas al final de la fila, no apilado bajo un h2 con el mismo nombre */}
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div>
            <Reveal>
              <SectionHead num="02" />
            </Reveal>
            <h2 id="ss26-practicas" className={H2}>
              <Lineas text={t.title} delay={0.06} />
            </h2>
          </div>
          <Reveal delay={0.1}>
            <TextLink href="/practice-groups">{navLabel(lang, "practicas")}</TextLink>
          </Reveal>
        </div>

        {/* Índice de revista (idea 3, aprobada por el cliente el 23-10-2026): titulares grandes.
            Desde lg, la práctica activa (cursor o foco) muestra su texto y su imagen-idea, fija a
            la derecha, que cambia con calma; las demás quedan en Azul Marino tenue. En teléfono y
            tableta, cada práctica lleva su imagen arriba del título y su texto siempre visible. */}
        <div className="mt-14 lg:mt-16 lg:grid lg:grid-cols-12 lg:gap-x-6">
          <ol className="border-t border-ss-marino lg:col-span-7">
            {items.map((item, i) => {
              const on = i === active;
              return (
                <Reveal as="li" key={item.slug} delay={i * 0.06} className="border-b border-ss-rule">
                  {/* inline-link: fuera de la regla móvil de index.css que vuelve inline-flex todo <a>.
                      Nombre del enlace = título; el texto va como descripción. */}
                  <Link
                    href={`/practice-groups/${item.slug}`}
                    aria-labelledby={`ss26-pr-${item.slug}`}
                    aria-describedby={`ss26-prd-${item.slug}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="inline-link grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 py-7 sm:grid-cols-[56px_minmax(0,1fr)] lg:py-8"
                  >
                    {item.imageUrl && (
                      <span aria-hidden="true" data-curtain="" className="col-span-2 mb-6 block aspect-[16/10] overflow-hidden bg-ss-paper lg:hidden">
                        <img src={item.imageUrl} alt="" loading="lazy" decoding="async" className="ss-photo block h-full w-full object-cover" />
                      </span>
                    )}
                    {/* 01–04 simples, como las filas de /practice-groups; la lista ya numera */}
                    <span aria-hidden className="ss-label ss-num pt-[0.7em] text-ss-medio">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span
                        id={`ss26-pr-${item.slug}`}
                        className={`ss-display block text-[clamp(30px,4.2vw,56px)] font-normal leading-[1.05] tracking-[-0.015em] text-ss-marino transition-colors duration-700 motion-reduce:transition-none ${
                          on ? "" : "lg:text-ss-marino/55"
                        }`}
                      >
                        {item.title}
                      </span>
                      <span
                        className={`mt-4 grid grid-rows-[1fr] transition-[grid-template-rows,opacity,margin] duration-700 ease-[cubic-bezier(.77,0,.18,1)] motion-reduce:transition-none ${
                          on ? "lg:mt-5 lg:grid-rows-[1fr] lg:opacity-100" : "lg:mt-0 lg:grid-rows-[0fr] lg:opacity-0"
                        }`}
                      >
                        <span className="overflow-hidden">
                          {/* 60ch a 17 px (507 px): la misma medida de las entradillas del Monitor */}
                          <span id={`ss26-prd-${item.slug}`} className="ss-prose block max-w-[46ch] text-[18px] text-ss-tinta">
                            {item.body}
                          </span>
                          <span aria-hidden className="ss-label mt-4 inline-block text-ss-marino">
                            {lang === "es" ? "Ver la práctica" : "View the practice"} →
                          </span>
                        </span>
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </ol>

          {/* La imagen-idea de la práctica activa: una sola, fija mientras se recorre la lista */}
          {items.length > 0 && (
            <figure aria-hidden="true" className="hidden lg:col-span-4 lg:col-start-9 lg:block">
              <div className="sticky top-28">
                <div data-curtain="" className="relative aspect-[4/5] overflow-hidden bg-ss-paper">
                  {items.map((item, i) =>
                    item.imageUrl ? (
                      <img
                        key={item.slug}
                        src={item.imageUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className={`ss-photo absolute inset-0 h-full w-full object-cover [transition:transform_1.2s_var(--ss-ease-out)] motion-reduce:transition-none ${
                          i === active
                            ? `z-[2] scale-100 opacity-100 ${prev >= 0 ? (dir === "up" ? "ss-wipe-up" : "ss-wipe-down") : ""}`
                            : i === prev
                              ? "z-[1] scale-[1.05] opacity-100"
                              : "opacity-0"
                        }`}
                      />
                    ) : null,
                  )}
                </div>
                <figcaption className="ss-label mt-4 flex justify-between gap-4 text-ss-medio">
                  <span className="text-ss-marino">{items[active]?.title}</span>
                  <span className="ss-num">
                    {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </span>
                </figcaption>
              </div>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}

/* Empresas extranjeras en México (sin cabecera §: no es una sección del menú y el h2 la nombra) */
export function Extranjeras26({ lang }: { lang: Lang26 }) {
  const navLabel = useNavLabel();
  const liveHome = useCmsContent("home", home26);
  const t = liveHome[lang].extranjeras;
  const { photos } = useCmsMedia();
  return (
    <section
      {...langAttrs[lang]}
      className="ss-navy relative isolate overflow-hidden text-white"
      aria-labelledby="ss26-extranjeras"
    >
      {/* Foto / texto 7fr / 5fr desde 1280; antes, apilados. La sala (oficina/sala-juntas,
          1536 × 1024) nunca se dibuja más grande que su tamaño nativo: apilada, el hueco mide
          como mucho 1279 × 420; desde 1280, sin la lista de pasos, el texto (~320 px) queda
          centrado en la fila de 600 px (min-h) y el hueco de la foto no pasa de 1536 de ancho
          (en pantallas mayores, Azul Profundo a la izquierda). */}
      <div className={`grid grid-cols-1 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] ${GAP_X}`}>
        <div className="relative min-h-[300px] overflow-hidden sm:min-h-[420px] xl:min-h-[600px]">
          {/* Lugar en la portada, sin velo */}
          <ScrollSettle
            src={photos.salaJuntas.url}
            srcSet={photos.salaJuntas.smallUrl && photos.salaJuntas.smallUrl !== photos.salaJuntas.url ? `${photos.salaJuntas.smallUrl} 768w, ${photos.salaJuntas.url} 1536w` : undefined}
            sizes="(min-width: 1280px) 58vw, 100vw"
            alt={t.alt}
            loading="lazy"
            decoding="async"
            width={1536}
            height={1024}
            className="ss-photo absolute inset-y-0 right-0 h-full w-full max-w-[1536px] object-cover object-[50%_42%]"
          />
        </div>
        <div className="flex items-center px-[var(--ss-pad)] py-20 xl:pl-0 xl:pr-[clamp(48px,6vw,104px)]">
          <div className="max-w-[560px]">
            <h2 id="ss26-extranjeras" className="ss-h2 text-white">
              <Lineas text={t.title} />
            </h2>
            <Reveal delay={0.12}>
              <p className="ss-prose mt-8 text-white/80">{t.body}</p>
            </Reveal>
            {/* Cifras de la firma que cuentan al entrar (21st.dev «Count Up»); el sufijo «+»
                va en el acento de la marca */}
            {t.figures?.length ? (
              <Reveal delay={0.16}>
                <dl className="mt-12 grid grid-cols-1 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-2 sm:gap-x-10">
                  {t.figures.map((f) => (
                    <div key={f.label} className="flex flex-row-reverse items-center justify-end gap-5 sm:flex-col-reverse sm:items-start sm:justify-end sm:gap-3">
                      <dt className="ss-label text-white/70">{f.label}</dt>
                      <dd className="ss-figure min-w-[2.2em] text-[clamp(40px,3.6vw,56px)] leading-none sm:min-w-0">
                        <CountUp to={parseInt(f.value, 10) || 0} />
                        {f.suffix && <span className="text-ss-lime">{f.suffix}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ) : null}
            {/* Sin lista de pasos (K3): repetía el párrafo. Queda el enlace a Prácticas */}
            <Reveal delay={0.18}>
              <TextLink href="/practice-groups" tone="dark" className="mt-10">
                {navLabel(lang, "practicas")}
              </TextLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* § 04 — Monitor Laboral */
export function Monitor26({ lang, limit = 3 }: { lang: Lang26; limit?: number }) {
  const navLabel = useNavLabel();
  const liveHome = useCmsContent("home", home26);
  const t = liveHome[lang].monitor;
  // La misma consulta (y caché) que MonitorList: sin notas publicadas, solo título y enlace.
  const { data, error } = useQuery<News[]>({ queryKey: ["/api/news"] });
  const hasItems = !error && !!data?.some((item) => item.published !== false);
  return (
    <section
      id="news"
      {...langAttrs[lang]}
      data-surface="light"
      className={`ss-paper ${Y.monitor} ${JOIN_AFTER} ${JOIN_BEFORE}`}
      aria-labelledby="ss26-monitor"
    >
      <div className="ss-container">
        <JoinRule />
        {/* Cabecera acotada a 60rem con el enlace al Monitor a la derecha, como en Socios */}
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div className="max-w-[60rem]">
            <Reveal>
              <SectionHead num="04" />
            </Reveal>
            <h2 id="ss26-monitor" className={H2}>
              <Lineas text={t.title} delay={0.06} />
            </h2>
            {hasItems && (
              <Reveal delay={0.1}>
                <p className="ss-lead mt-5 max-w-[38em]">{t.intro}</p>
              </Reveal>
            )}
          </div>
          <Reveal delay={0.1}>
            <TextLink href="/news">{navLabel(lang, "monitor")}</TextLink>
          </Reveal>
        </div>

        {/* Las tres notas publicadas más recientes, con la lista única del Monitor (la de
            /news): categoría y fecha en etiqueta, titular que enlaza a /news/<slug>, entradilla.
            Índice con filetes Línea al ancho del contenedor; texto desde la columna 5. Si una
            sección blanca viniera después, el filete de cierre de la lista se omite: el de
            unión (JoinRule) ya separa y no quedan dos filetes seguidos. */}
        {hasItems && (
          <Reveal delay={0.12} className="mt-14 lg:mt-16 [section:has(+[data-surface=light])_&_li:last-child]:border-b-0">
            {/* En el idioma que muestra la portada (es/en): sin traducción automática */}
            <MonitorList limit={limit} headingLevel="h3" layout="bulletin" tone="light" language={lang} />
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* § 03 — Socios */
export function Socios26({ lang }: { lang: Lang26 }) {
  const navLabel = useNavLabel();
  const liveHome = useCmsContent("home", home26);
  const t = liveHome[lang].socios;
  const { data: members = [], isError: teamError } = useQuery<TeamMember[]>({ queryKey: ["/api/team"] });
  const people = teamError ? [] : members.filter(m => isNamedOnTeamPage(m) && (m.showOnHome ?? (m.isPartner && !/in memoriam/i.test(m.title)))).sort((a,b) => (a.order ?? 0) - (b.order ?? 0)).map(m => ({ name: m.name, slug: m.slug, image: m.imageUrl || "", role: (lang === "es" ? m.titleEs : m.title) || "", practice: (lang === "es" ? m.roleEs : m.role) || "" }));
  return (
    <section
      id="socios"
      {...langAttrs[lang]}
      data-surface="light"
      className={`bg-white ${Y.socios} ${JOIN_AFTER} ${JOIN_BEFORE}`}
      aria-labelledby="ss26-socios"
    >
      <div className="ss-container">
        <JoinRule />
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div>
            <Reveal>
              <SectionHead num="03" />
            </Reveal>
            <h2 id="ss26-socios" className={H2}>
              <Lineas text={t.title} delay={0.06} />
            </h2>
          </div>
          <Reveal delay={0.1}>
            <TextLink href="/team">{navLabel(lang, "socios")}</TextLink>
          </Reveal>
        </div>

        {/* «Lienzo»: los socios como lienzos que se abren (Lienzo.tsx) */}
        <Lienzo people={people} lang={lang} />
      </div>
    </section>
  );
}
