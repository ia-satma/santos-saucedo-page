import { useCmsMedia } from "@/lib/cmsMedia";
import { useCmsContent } from "@/hooks/useCmsContent";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import fachada768 from "@assets/ss26/oficina/fachada-768.webp";
import fachada1536 from "@assets/ss26/oficina/fachada-1536.webp";
import salaJuntas768 from "@assets/ss26/oficina/sala-juntas-768.webp";
import salaJuntas1536 from "@assets/ss26/oficina/sala-juntas-1536.webp";
import socioSantosArce from "@assets/ss26/socio-enrique-hernan-santos-arce.webp";
import socioSantosGuzman from "@assets/ss26/socio-enrique-hernan-santos-guzman.webp";
import socioSaucedoMontemayor from "@assets/ss26/socio-mario-saucedo-montemayor.webp";
import { isNamedOnTeamPage, fallbackToOriginalSrc, getTeamPhotoSrcSet } from "@/lib/teamPhotoSources";
import { keepFirmName } from "@/lib/firmName";
import { useOfficeLabel } from "@/lib/officeLabel";
import { getPracticeImage } from "@/lib/practiceIndustryImages";
import { MonitorList } from "@/components/monitor/MonitorList";
import type { News, PracticeGroup, TeamMember } from "@shared/schema";
import { Reveal, SectionHead, TextLink } from "./primitives";
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

/* Retratos de socios, por slug de /team. El WebP de la portada (652 px) queda como src de
   respaldo; el navegador elige del srcset de team_photos (360w y 652w, el de /team) según
   el hueco: 112 px en teléfono, un tercio del contenedor desde sm (416 px a 1440, 424 máx.). */
const socioPhotos: Record<string, string> = {
  "enrique-santos-arce": socioSantosArce,
  "enrique-santos-guzman": socioSantosGuzman,
  "mario-saucedo-montemayor": socioSaucedoMontemayor,
};
const socioSrcSetProps = (slug: string) => {
  const srcSet = getTeamPhotoSrcSet(`${import.meta.env.BASE_URL}team_photos/${slug}.png`);
  return srcSet ? { srcSet, sizes: "(min-width: 1464px) 424px, (min-width: 640px) calc(30vw - 16px), 112px" } : {};
};

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
          <Reveal delay={0.06}>
            <h2 id="ss26-firma" className={H2}>
              {t.title}
            </h2>
          </Reveal>
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
          {/* Junto al pie, el enlace a la página de la oficina (su nombre en officeLabel) */}
          <figcaption className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-4 text-[14px] leading-snug text-ss-medio">
            <span className="ss-label shrink-0 text-ss-marino">Fig. 1</span>
            <span className="min-w-0 flex-1 basis-[16rem]">{t.caption}</span>
            <TextLink href="/offices" className="shrink-0" data-testid="link-home-offices">
              {officeNameFor(lang)}
            </TextLink>
          </figcaption>
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
    <section {...langAttrs[lang]} className={`ss-paper ${Y.creemos}`} aria-labelledby="ss26-creemos">
      <div className="ss-container">
        <Reveal>
          <SectionHead label={t.label} />
        </Reveal>
        <Reveal delay={0.08} className="mt-[clamp(34px,5vw,60px)]">
          <h2
            id="ss26-creemos"
            className="ss-serif max-w-[15ch] text-[clamp(46px,6.3vw,92px)] leading-[1.02] text-ss-marino [text-wrap:balance]"
          >
            {t.quote}
          </h2>
        </Reveal>
        <div className="ss-creemos-body text-ss-tinta">
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
            <Reveal delay={0.06}>
              <h2 id="ss26-practicas" className={H2}>
                {t.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <TextLink href="/practice-groups">{navLabel(lang, "practicas")}</TextLink>
          </Reveal>
        </div>

        {/* Índice con filetes Línea al ancho del contenedor, como el del Monitor Laboral: desde lg,
            el número en las columnas 1–4 y el texto desde la 5 (el borde de La firma, Socios y el
            pie). Las reglas entre filas se quedan: llevan el trazo del hover */}
        <ol className="mt-14 border-t border-ss-rule lg:mt-16">
          {items.map((item, i) => (
            <Reveal as="li" key={item.slug} delay={i * 0.06} className="ss-row relative border-b border-ss-rule">
                {/* inline-link: fuera de la regla móvil de index.css que vuelve inline-flex todo <a>.
                    Nombre del enlace = título; el texto va como descripción. */}
                <Link
                  href={`/practice-groups/${item.slug}`}
                  aria-labelledby={`ss26-pr-${item.slug}`}
                  aria-describedby={`ss26-prd-${item.slug}`}
                  className={`inline-link grid grid-cols-1 gap-y-3 py-8 sm:gap-x-5 lg:grid-cols-12 lg:items-baseline lg:gap-x-6 lg:py-10 ${
                    item.imageUrl
                      ? "sm:grid-cols-[56px_minmax(0,1fr)_minmax(112px,22%)_24px]"
                      : "sm:grid-cols-[56px_minmax(0,1fr)_24px]"
                  }`}
                >
                  {/* 01–04 simples, como las filas de /practice-groups; la lista ya numera para
                      lectores de pantalla. Desde lg, número, titular y flecha sobre la misma línea
                      base (la primera del titular), a cualquier tamaño del titular */}
                  <span aria-hidden className="ss-row-num ss-label ss-num lg:col-span-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className={item.imageUrl ? "grid grid-cols-[minmax(0,1fr)_112px] items-center gap-4 sm:contents" : "sm:contents"}>
                    <span className={`${item.imageUrl ? "sm:col-start-2" : ""} sm:row-start-1 ${item.imageUrl ? "lg:col-span-7" : "lg:col-span-10"} lg:col-start-2`}>
                      <span
                        id={`ss26-pr-${item.slug}`}
                        className="ss-display block text-[clamp(26px,2.3vw,34px)] font-normal leading-[1.15] tracking-[-0.012em] text-ss-marino"
                      >
                        {item.title}
                      </span>
                      {/* 60ch a 17 px (507 px): la misma medida de las entradillas del Monitor
                          (MonitorList, N9); si cambia aquí, cambia allí */}
                      <span id={`ss26-prd-${item.slug}`} className="ss-prose mt-4 block max-w-[60ch] text-[17px] text-ss-tinta">
                        {item.body}
                      </span>
                    </span>
                    {item.imageUrl && (
                      <span aria-hidden="true" className="block overflow-hidden bg-ss-paper sm:col-start-3 sm:row-start-1 lg:col-span-3 lg:col-start-9 lg:self-center">
                        <img
                          src={item.imageUrl}
                          alt=""
                          loading="eager"
                          decoding="async"
                          className="ss-photo block aspect-[3/2] h-auto w-full object-cover"
                        />
                      </span>
                    )}
                  </div>
                  <span aria-hidden className={`ss-arrow hidden pt-1 text-[22px] text-ss-marino ${item.imageUrl ? "sm:col-start-4" : "sm:col-start-3"} sm:row-start-1 sm:block lg:col-start-12 lg:justify-self-end`}>
                    →
                  </span>
                </Link>
                <span aria-hidden className="ss-row-rule absolute -bottom-px left-0 h-[2px] w-full bg-ss-marino" />
            </Reveal>
          ))}
        </ol>
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
          <img
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
            <Reveal>
              <h2 id="ss26-extranjeras" className="ss-h2 text-white">
                {t.title}
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="ss-prose mt-8 text-white/80">{t.body}</p>
            </Reveal>
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
  // La misma consulta (y caché) que MonitorList. Sin notas publicadas, o si /api/news
  // falla, la sección queda en su título y el enlace al Monitor: sin filas ni avisos.
  const { data, error } = useQuery<News[]>({ queryKey: ["/api/news"] });
  const hasItems = !error && !!data?.some((item) => item.published !== false);
  return (
    <section
      id="news"
      {...langAttrs[lang]}
      data-surface="light"
      className={`bg-white ${Y.monitor} ${JOIN_AFTER} ${JOIN_BEFORE}`}
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
            <Reveal delay={0.06}>
              <h2 id="ss26-monitor" className={H2}>
                {t.title}
              </h2>
            </Reveal>
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
            <MonitorList limit={limit} headingLevel="h3" layout="index" tone="light" language={lang} />
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
  const people = teamError ? [] : members.filter(m => isNamedOnTeamPage(m) && (m.showOnHome ?? (m.isPartner && !/in memoriam/i.test(m.title)))).sort((a,b) => (a.order ?? 0) - (b.order ?? 0)).map(m => ({ name: m.name, photo: m.slug, image: m.imageUrl || "", role: lang === "es" ? m.titleEs : m.title }));
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
            <Reveal delay={0.06}>
              <h2 id="ss26-socios" className={H2}>
                {t.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <TextLink href="/team">{navLabel(lang, "socios")}</TextLink>
          </Reveal>
        </div>

        {/* Teléfono: lista con retrato pequeño al lado del nombre; desde sm, tres columnas.
            La tarjeta es la de /team (Team.tsx renderPersonCard): enlace a la ficha del socio,
            el retrato se acerca al 1 % y el nombre se subraya al pasar el ratón o con el foco.
            inline-link: fuera de la regla móvil de index.css que vuelve inline-flex todo <a>. */}
        <ul className="mt-14 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-y-12 lg:mt-16">
          {people.map((person, i) => (
            <Reveal as="li" key={person.name} delay={i * 0.08}>
              <Link href={`/team/${person.photo}`} className="inline-link group block">
                <span className="grid grid-cols-[112px_1fr] items-end gap-x-5 sm:block">
                  <span className="block overflow-hidden bg-ss-paper">
                    {/* Fuente 652×652 (360 en teléfono) recortada a 4:5, en color como todo
                        retrato; alt vacío: el nombre ya es el texto del enlace */}
                    <img
                      src={person.image}
                      {...(getTeamPhotoSrcSet(person.image) ? { srcSet: getTeamPhotoSrcSet(person.image), sizes: "(min-width: 640px) 30vw, 112px" } : {})}
                      onError={fallbackToOriginalSrc}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width={652}
                      height={652}
                      className="ss-photo aspect-[4/5] h-auto w-full object-cover object-[50%_28%] transition-transform duration-700 [transition-timing-function:var(--ss-ease)] motion-safe:group-hover:scale-[1.01] motion-reduce:transform-none motion-reduce:transition-none"
                    />
                  </span>
                  <span className="block sm:mt-5">
                    <span className="ss-display block text-[clamp(24px,1.9vw,28px)] font-normal leading-[1.15] tracking-[-0.01em] text-ss-marino decoration-1 underline-offset-4 group-hover:underline group-focus-visible:underline">
                      {person.name}
                    </span>
                    <span className="ss-label mt-3 block text-ss-medio">{person.role}</span>
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
