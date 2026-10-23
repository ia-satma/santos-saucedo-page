import { useCmsMedia } from "@/lib/cmsMedia";
import { teamPortraitFraming } from "@/lib/teamPortraitFraming";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useMemo, type ReactNode, type SyntheticEvent } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { equipoMosaicPhotos as equipoPhotos } from "@/lib/equipoMosaicPhotos";
import { fallbackToOriginalSrc, getTeamPhotoSrcSet, isNamedOnTeamPage } from "@/lib/teamPhotoSources";
import { Eyebrow } from "@/components/editorial";
import { TextLink } from "@/components/home26/primitives";
import { chrome26 } from "@/components/home26/chrome26";
import { keepFirmName } from "@/lib/firmName";
import type { TeamMember } from "@shared/schema";

// Mosaico "Integrantes del equipo": columnas por tramo (teléfono, md, lg en adelante)
const EQUIPO_COLUMNS = { phone: 2, md: 4, lg: 6 } as const;

// Clases completas de col-span por tramo (Tailwind solo genera las que aparecen escritas)
const EQUIPO_SPAN_CLASSES = {
  phone: ["col-span-1", "col-span-2", "col-span-3", "col-span-4"],
  md: ["md:col-span-1", "md:col-span-2", "md:col-span-3", "md:col-span-4", "md:col-span-5", "md:col-span-6"],
  lg: ["lg:col-span-1", "lg:col-span-2", "lg:col-span-3", "lg:col-span-4", "lg:col-span-5", "lg:col-span-6", "lg:col-span-7", "lg:col-span-8"],
} as const;

// Columnas que ocupa la celda Hueso de cierre: las que la última fila deja vacías; si la
// cuenta cierra la fila, una fila entera (la celda lleva el enlace a Carreras y no se omite)
function closingColumns(total: number, columns: number): number {
  return (columns - (total % columns)) % columns || columns;
}

// Retrato de la tarjeta: 112 px en teléfono, media columna desde sm y un cuarto desde lg
const CARD_PHOTO_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 112px";

// Rejilla de tarjetas y letra del nombre, compartidas por la vista y su carga (misma altura).
// Desde sm el nombre reserva dos líneas (interlineado 1.15 × 2): "Mario Saucedo Montemayor" pasa
// a dos a 1024–1440 y su cargo quedaba más abajo que los de al lado.
const CARD_GRID = "grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-4";
const CARD_NAME = "ss-display block text-[clamp(24px,1.9vw,28px)] font-normal leading-[1.15] tracking-[-0.01em] sm:min-h-[2.3em]";

export default function Team() {
  const { teamMosaic: equipoPhotos } = useCmsMedia();
  const cmsChrome = useCmsContent("chrome", chrome26);
  const { language } = useLanguage();

  const { data: allTeamMembers, isLoading: isLoadingAll, error: errorAll } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  // Sin título ni subtítulo propios: el h1 es la etiqueta del menú (chrome26, E5) y el
  // encabezado no lleva subtítulo (E3); el párrafo solo se pinta si algún idioma lo trae.
  const content: Record<string, {
    subtitle?: string;
    errorMessage: string;
    ofCounsel: string;
    associatesTitle: string;
    mosaicNote: string;
    positions: {
      foundingPartner: string;
      partner: string;
      ofCounsel: string;
      seniorAssociate: string;
      associate: string;
    };
  }> = {
    en: {
      errorMessage: "Failed to load team members",
      ofCounsel: "Of Counsel",
      associatesTitle: "Team members",
      mosaicNote: "Portraits of team members.",
      positions: {
        foundingPartner: "Founding partner",
        partner: "Partner",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Senior associate",
        associate: "Associate",
      },
    },
    es: {
      errorMessage: "Error al cargar los miembros del equipo",
      ofCounsel: "Of Counsel",
      associatesTitle: "Integrantes del equipo",
      mosaicNote: "Retratos de integrantes del equipo.",
      positions: {
        foundingPartner: "Socio fundador",
        partner: "Socio",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Asociado senior",
        associate: "Asociado",
      },
    },
    de: {
      errorMessage: "Teammitglieder konnten nicht geladen werden",
      ofCounsel: "Of Counsel",
      associatesTitle: "Teammitglieder",
      mosaicNote: "Porträts von Teammitgliedern.",
      positions: {
        foundingPartner: "Gründungspartner",
        partner: "Partner",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Senior Associate",
        associate: "Associate",
      },
    },
    zh: {
      errorMessage: "无法加载团队成员",
      ofCounsel: "法律顾问",
      associatesTitle: "团队成员",
      mosaicNote: "团队成员的肖像。",
      positions: {
        foundingPartner: "创始合伙人",
        partner: "合伙人",
        ofCounsel: "法律顾问",
        seniorAssociate: "高级律师",
        associate: "律师",
      },
    },
    ko: {
      errorMessage: "팀원을 불러올 수 없습니다",
      ofCounsel: "고문",
      associatesTitle: "팀 구성원",
      mosaicNote: "팀 구성원의 사진.",
      positions: {
        foundingPartner: "창립 파트너",
        partner: "파트너",
        ofCounsel: "고문",
        seniorAssociate: "시니어 어소시에이트",
        associate: "어소시에이트",
      },
    },
    ja: {
      errorMessage: "チームメンバーを読み込めませんでした",
      ofCounsel: "オブ・カウンセル",
      associatesTitle: "チームメンバー",
      mosaicNote: "チームメンバーの写真。",
      positions: {
        foundingPartner: "創立パートナー",
        partner: "パートナー",
        ofCounsel: "オブ・カウンセル",
        seniorAssociate: "シニアアソシエイト",
        associate: "アソシエイト",
      },
    },
    ar: {
      errorMessage: "فشل في تحميل أعضاء الفريق",
      ofCounsel: "مستشار قانوني",
      associatesTitle: "أعضاء الفريق",
      mosaicNote: "صور أعضاء الفريق.",
      positions: {
        foundingPartner: "شريك مؤسس",
        partner: "شريك",
        ofCounsel: "مستشار قانوني",
        seniorAssociate: "محامي أول",
        associate: "محامي",
      },
    },
    ru: {
      errorMessage: "Не удалось загрузить членов команды",
      ofCounsel: "Советник",
      associatesTitle: "Сотрудники",
      mosaicNote: "Портреты сотрудников.",
      positions: {
        foundingPartner: "Партнёр-основатель",
        partner: "Партнёр",
        ofCounsel: "Советник",
        seniorAssociate: "Старший юрист",
        associate: "Юрист",
      },
    },
    fr: {
      errorMessage: "Échec du chargement des membres de l’équipe",
      ofCounsel: "Of Counsel",
      associatesTitle: "Membres de l’équipe",
      mosaicNote: "Portraits de membres de l’équipe.",
      positions: {
        foundingPartner: "Associé fondateur",
        partner: "Associé",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Collaborateur senior",
        associate: "Collaborateur",
      },
    },
    it: {
      errorMessage: "Impossibile caricare i membri del team",
      ofCounsel: "Of Counsel",
      associatesTitle: "Membri del team",
      mosaicNote: "Ritratti di membri del team.",
      positions: {
        foundingPartner: "Partner fondatore",
        partner: "Partner",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Senior Associate",
        associate: "Associate",
      },
    },
  };

  const editableContent = useCmsContent("team", content);
  const t = editableContent[language] || editableContent.en;

  // Nombres del menú en cada idioma (E5): el h1 es "Socios" (nav[2]) y la celda Hueso de
  // cierre del mosaico lleva "Carreras" (nav[4]) con el enlace al Semillero S&S (el nombre del
  // programa no se traduce)
  const navLabels = (cmsChrome[language] ?? cmsChrome.es).nav;
  const pageTitle = navLabels[2].label;
  const careersLabel = navLabels[4].label;

  const groupedMembers = useMemo(() => {
    if (!allTeamMembers) return { partners: [], ofCounsel: [] };

    const byConfiguredOrder = (a: TeamMember, b: TeamMember) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;

      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    };

    // Solo los socios con retrato 2026 confirmado por nombre y los Of Counsel llevan tarjeta
    // (isNamedOnTeamPage, shared/teamVisibility, la misma regla de "Equipo relacionado", el
    // buscador y el mapa del sitio). Los asociados van en el mosaico, sin nombres.
    const partners = allTeamMembers.filter(m => m.isPartner && isNamedOnTeamPage(m)).sort(byConfiguredOrder);
    const ofCounsel = allTeamMembers.filter(m => !m.isPartner && isNamedOnTeamPage(m)).sort(byConfiguredOrder);
    return { partners, ofCounsel };
  }, [allTeamMembers]);

  // Celda Hueso de cierre: un elemento más de la rejilla que ocupa las columnas que la última
  // fila deja vacías en cada tramo (o una fila entera si la cuenta la cierra)
  const equipoClosingSpanClass = [
    EQUIPO_SPAN_CLASSES.phone[closingColumns(equipoPhotos.length, EQUIPO_COLUMNS.phone) - 1],
    EQUIPO_SPAN_CLASSES.md[closingColumns(equipoPhotos.length, EQUIPO_COLUMNS.md) - 1],
    EQUIPO_SPAN_CLASSES.lg[closingColumns(equipoPhotos.length, EQUIPO_COLUMNS.lg) - 1],
  ].join(" ");

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Retratos: WebP con srcset (360w y 652w); si la variante falla, vuelve al original
  const photoSrcSetProps = (member: TeamMember) => {
    const srcSet = getTeamPhotoSrcSet(member.imageUrl);
    return srcSet ? { srcSet, sizes: CARD_PHOTO_SIZES } : {};
  };
  const handlePhotoError = (e: SyntheticEvent<HTMLImageElement>) => {
    if (!fallbackToOriginalSrc(e)) e.currentTarget.style.display = "none";
  };

  // Cargo de cada persona (no la etiqueta plural de la sección): titleEs en español; en los
  // demás idiomas, title. Fuera de en ese título es inglés: va en <bdi lang="en"> (aislado
  // del árabe sin cambiar la alineación del pie). "(in memoriam)" con espacio duro, como en la
  // ficha (TeamMemberDetail): no se parte entre líneas.
  const renderMemberRole = (member: TeamMember, fallback: string) => {
    const englishFallback = language !== "es" && language !== "en" && !!member.title;
    const role = language === "es" ? (member.titleEs || member.title || fallback) : (member.title || fallback);
    const text = role.replace(/\((in)\s+(memoriam)\)/gi, "($1\u00a0$2)");
    return (
      <span className="ss-label mt-3 block text-ss-medio">
        {englishFallback ? <bdi lang="en" dir="ltr">{text}</bdi> : text}
      </span>
    );
  };

  // Tarjeta de socio: la misma de la portada (Socios26, home26/Sections26): retrato 4/5 en
  // color, nombre en la romana y cargo en etiqueta debajo; sin velo ni paneles que se
  // expanden. Teléfono: retrato de 112 px al lado del nombre; desde sm, apilado. El enlace
  // lleva inline-link: la regla móvil de index.css volvería inline-flex la tarjeta.
  const renderPersonCard = (member: TeamMember, fallbackRole: string, eager: boolean) => (
    <li key={member.id}>
      <Link
        href={`/team/${member.slug}`}
        className="inline-link group block"
        data-testid={`card-team-member-${member.slug}`}
      >
        <span className="grid grid-cols-[112px_1fr] items-end gap-x-5 sm:block">
          <span className="ss-portrait-frame relative block overflow-hidden bg-ss-paper aspect-[4/5]">
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center font-heading text-2xl text-ss-marino/50 select-none">
              {getInitials(member.name)}
            </span>
            {member.imageUrl && (
              // alt vacío: el nombre ya es el texto del enlace
              <img
                src={member.imageUrl}
                data-portrait-slug={member.slug}
                {...photoSrcSetProps(member)}
                alt=""
                loading={eager ? "eager" : "lazy"}
                decoding="async"
                width={652}
                height={652}
                className="ss-photo absolute inset-0 h-full w-full object-cover object-[50%_28%] transition-transform duration-700 [transition-timing-function:var(--ss-ease)] motion-safe:group-hover:scale-[1.01] motion-reduce:transform-none motion-reduce:transition-none"
                onError={handlePhotoError}
              />
            )}
          </span>
          <span className="block sm:mt-5">
            <span className={`${CARD_NAME} text-ss-marino decoration-1 underline-offset-4 group-hover:underline group-focus-visible:underline`}>
              {member.name}
            </span>
            {renderMemberRole(member, fallbackRole)}
          </span>
        </span>
      </Link>
    </li>
  );

  // Sección con tarjetas, dentro del contenedor (el primer retrato arranca en el borde del logo).
  // Los socios van sin h2: el h1 de la página ya es "Socios" (E5).
  const renderCardSection = (testId: string, title: string | null, children: ReactNode) => (
    <section className="ss-container pt-16 lg:pt-20" data-testid={testId}>
      {title && <h2 className="ss-h2 mb-10 lg:mb-12">{title}</h2>}
      <ul className={CARD_GRID}>
        {children}
      </ul>
    </section>
  );

  // Contenido de la celda de cierre: etiqueta "Carreras" y enlace de texto al Semillero S&S.
  // [&_span]: la regla móvil de index.css (span a 16 px) agrandaba el texto del enlace; aquí
  // hereda los 12 px de la etiqueta, como en la portada.
  const closingContent = (
    <>
      <p className="ss-label text-ss-medio">{careersLabel}</p>
      <div className="mt-2 [&_span]:[font-size:inherit]">
        <TextLink href="/careers/interns">Semillero S&amp;S</TextLink>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background" data-testid="page-team">
      <SEOHead page="team" language={language} />
      <Header />

      {/* El encabezado va dentro de main: "Saltar al contenido" y el landmark incluyen el h1 */}
      <main id="main-content" data-testid="section-team-main">
        <section className="editorial-page-hero ss-principal-page-hero ss-team-page-hero" data-testid="section-team-hero">
          <div className="ss-container">
            <div>
              <Eyebrow num="03" tone="navy" className="mb-6" />
              {/* h1 = etiqueta del menú; mb-5 solo si sigue un subtítulo */}
              <h1
                className={t.subtitle ? "mb-5" : undefined}
                data-testid="text-team-title"
              >
                {pageTitle}
              </h1>
              {t.subtitle && (
                <p data-testid="text-team-subtitle">{keepFirmName(t.subtitle)}</p>
              )}
            </div>
          </div>
        </section>

        {/* Sin barra de búsqueda, filtros ni cuenta: la página nombra a los socios y muestra el
            mosaico del equipo; no hay nada que buscar. */}
        {errorAll ? (
          <div className="ss-container py-24" data-testid="container-team-error">
            <p className="text-ss-tinta" data-testid="text-team-error">{t.errorMessage}</p>
          </div>
        ) : isLoadingAll ? (
          // Carga con la misma retícula, el mismo relleno y la misma letra que las tarjetas finales
          // (nombre de dos líneas desde sm, cargo en etiqueta): la altura no cambia al llegar los datos
          <div className="ss-container pt-16 lg:pt-20" aria-busy="true">
            <div className={CARD_GRID}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[112px_1fr] items-end gap-x-5 sm:block" data-testid={`skeleton-team-member-${i}`}>
                  <Skeleton className="aspect-[4/5] w-full rounded-none bg-ss-rule" />
                  <div className="sm:mt-5">
                    <div className={CARD_NAME}>
                      <Skeleton className="inline-block h-[0.8em] w-4/5 bg-ss-rule align-middle" />
                    </div>
                    <div className="ss-label mt-3">
                      <Skeleton className="inline-block h-[0.8em] w-1/2 bg-ss-rule align-middle" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ─── SOCIOS ──────────────────────────────────────── */}
            {groupedMembers.partners.length > 0 &&
              renderCardSection(
                "section-partners",
                null,
                groupedMembers.partners.map((member, i) => renderPersonCard(member, t.positions.partner, i < 2)),
              )}

            {/* ─── OF COUNSEL ──────────────────────────────────── */}
            {groupedMembers.ofCounsel.length > 0 &&
              renderCardSection(
                "section-ofcounsel",
                t.ofCounsel,
                groupedMembers.ofCounsel.map((member) => renderPersonCard(member, t.ofCounsel, false)),
              )}
          </>
        )}

        {/* ─── INTEGRANTES DEL EQUIPO (mosaico anónimo: aún sin nombres) ─────── */}
        {/* Fuera de la carga: las fotos son estáticas (equipoMosaicPhotos), así que el bloque y su
            rejilla ocupan su sitio desde el principio y el pie no salta cuando llega /api/team
            (CLS de 0.14–0.28 en pantallas altas en la ronda 4) */}
        {equipoPhotos.length > 0 && (
          <section id="equipo" className="ss-container pt-20 pb-24 lg:pt-24 lg:pb-32" data-testid="section-associates">
            <div className="pb-10 lg:pb-12">
              {/* No repite el h1 "Socios": "Integrantes del equipo", como en la redacción */}
              <h2 className="ss-h2">
                {t.associatesTitle}
              </h2>
              {/* Los retratos son decorativos (alt vacío) hasta que exista la relación de nombres;
                  sin cifra: el número de integrantes no está confirmado */}
              <p className="sr-only">{t.mosaicNote}</p>
            </div>
            {/* Rejilla de 2, 4 y 6 columnas con encuadres ópticos individuales.
                La elevación al pasar el cursor es decorativa: los retratos no son enlaces.
                La celda Hueso de cierre es un
                elemento más que ocupa las columnas sobrantes de la última fila. */}
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
              {equipoPhotos.map((photo, idx) => (
                // aria-hidden en el elemento: la lista no anuncia 37 elementos vacíos
                <li key={`${photo}-${idx}`} aria-hidden="true" className="ss-team-portrait ss-portrait-frame relative aspect-[4/5] overflow-hidden bg-ss-paper" data-testid={`img-equipo-${idx}`}>
                  <img
                    src={photo}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={295}
                    height={295}
                    className="ss-photo absolute h-auto max-w-none"
                    style={teamPortraitFraming(photo)}
                  />
                </li>
              ))}
              <li
                data-testid="cell-equipo-closing"
                className={`flex flex-col items-start justify-end bg-ss-paper p-3 md:p-4 lg:p-6 ${equipoClosingSpanClass}`}
              >
                {closingContent}
              </li>
            </ul>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
