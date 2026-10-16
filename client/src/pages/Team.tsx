import { useState, useMemo, type ReactNode, type SyntheticEvent } from "react";
import { motion } from "framer-motion";
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
import type { TeamMember } from "@shared/schema";

// Helper to split an array into chunks of a given size
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// Mosaico "Integrantes del equipo": columnas por tramo (teléfono, md, lg en adelante)
const EQUIPO_COLUMNS = { phone: 5, md: 8, lg: 10 } as const;

// Columnas que ocupa la celda Hueso de cierre: las que la última fila deja vacías; si la
// cuenta cierra la fila, una fila entera (la celda lleva el enlace a Carreras y no se omite)
function closingColumns(total: number, columns: number): number {
  return (columns - (total % columns)) % columns || columns;
}

// Retrato de la tarjeta: 112 px en teléfono, media columna desde sm y un cuarto desde lg
const CARD_PHOTO_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 112px";

export default function Team() {
  const { language } = useLanguage();
  const [assocPanels, setAssocPanels] = useState<Record<number, string | null>>({});

  const { data: allTeamMembers, isLoading: isLoadingAll, error: errorAll } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  const content: Record<string, {
    title: string;
    subtitle: string;
    errorMessage: string;
    partnersOnly: string;
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
      title: "Our team",
      subtitle: "Partners and team of Santos & Saucedo.",
      errorMessage: "Failed to load team members",
      partnersOnly: "Partners",
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
      title: "Nuestro equipo",
      subtitle: "Socios y equipo de Santos & Saucedo.",
      errorMessage: "Error al cargar los miembros del equipo",
      partnersOnly: "Socios",
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
      title: "Unser Team",
      subtitle: "Partner und Team von Santos & Saucedo.",
      errorMessage: "Teammitglieder konnten nicht geladen werden",
      partnersOnly: "Partner",
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
      title: "我们的团队",
      subtitle: "Santos & Saucedo 的合伙人与团队。",
      errorMessage: "无法加载团队成员",
      partnersOnly: "合伙人",
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
      title: "우리 팀",
      subtitle: "Santos & Saucedo의 파트너와 팀.",
      errorMessage: "팀원을 불러올 수 없습니다",
      partnersOnly: "파트너",
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
      title: "私たちのチーム",
      subtitle: "Santos & Saucedoのパートナーとチーム。",
      errorMessage: "チームメンバーを読み込めませんでした",
      partnersOnly: "パートナー",
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
      title: "فريقنا",
      subtitle: "شركاء Santos & Saucedo وفريقها.",
      errorMessage: "فشل في تحميل أعضاء الفريق",
      partnersOnly: "الشركاء",
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
      title: "Наша команда",
      subtitle: "Партнёры и команда Santos & Saucedo.",
      errorMessage: "Не удалось загрузить членов команды",
      partnersOnly: "Партнёры",
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
      title: "Notre équipe",
      subtitle: "Associés et équipe de Santos & Saucedo.",
      errorMessage: "Échec du chargement des membres de l'équipe",
      partnersOnly: "Associés",
      ofCounsel: "Of Counsel",
      associatesTitle: "Membres de l'équipe",
      mosaicNote: "Portraits de membres de l'équipe.",
      positions: {
        foundingPartner: "Associé fondateur",
        partner: "Associé",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Collaborateur senior",
        associate: "Collaborateur",
      },
    },
    it: {
      title: "Il nostro team",
      subtitle: "Soci e team di Santos & Saucedo.",
      errorMessage: "Impossibile caricare i membri del team",
      partnersOnly: "Partner",
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

  const t = content[language] || content.en;

  // Celda Hueso de cierre del mosaico: "Carreras" con el nombre del menú en cada idioma y el
  // enlace al Semillero S&S (el nombre del programa no se traduce)
  const careersLabel = (chrome26[language] ?? chrome26.es).nav[4].label;

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

  const equipoClosingSpan = {
    phone: closingColumns(equipoPhotos.length, EQUIPO_COLUMNS.phone),
    md: closingColumns(equipoPhotos.length, EQUIPO_COLUMNS.md),
    lg: closingColumns(equipoPhotos.length, EQUIPO_COLUMNS.lg),
  };
  // Desde lg la celda va dentro de la última fila; si esa fila está llena, en una franja propia
  const equipoClosingOwnRow = equipoClosingSpan.lg === EQUIPO_COLUMNS.lg;

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
  // del árabe sin cambiar la alineación del pie).
  const renderMemberRole = (member: TeamMember, fallback: string) => {
    const englishFallback = language !== "es" && language !== "en" && !!member.title;
    const text = language === "es" ? (member.titleEs || member.title || fallback) : (member.title || fallback);
    return (
      <span className="ss-label mt-3 block text-ss-medio">
        {englishFallback ? <bdi lang="en" dir="ltr">{text}</bdi> : text}
      </span>
    );
  };

  // Tarjeta de socio: la misma de la portada (Socios26, home26/Sections26): retrato 4/5 en
  // grises, nombre en la romana y cargo en etiqueta debajo; sin velo ni paneles que se
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
          <span className="relative block overflow-hidden bg-ss-paper aspect-[4/5]">
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center font-heading text-2xl text-ss-marino/50 select-none">
              {getInitials(member.name)}
            </span>
            {member.imageUrl && (
              // alt vacío: el nombre ya es el texto del enlace
              <img
                src={member.imageUrl}
                {...photoSrcSetProps(member)}
                alt=""
                loading={eager ? "eager" : "lazy"}
                decoding="async"
                width={652}
                height={652}
                className="ss-photo ss-photo--mono absolute inset-0 h-full w-full object-cover object-[50%_28%] transition-transform duration-700 [transition-timing-function:var(--ss-ease)] motion-safe:group-hover:scale-[1.01] motion-reduce:transform-none motion-reduce:transition-none"
                onError={handlePhotoError}
              />
            )}
          </span>
          <span className="block sm:mt-5">
            <span className="ss-display block text-[clamp(24px,1.9vw,28px)] font-[420] leading-[1.15] tracking-[-0.01em] text-ss-marino decoration-1 underline-offset-4 group-hover:underline group-focus-visible:underline">
              {member.name}
            </span>
            {renderMemberRole(member, fallbackRole)}
          </span>
        </span>
      </Link>
    </li>
  );

  // Sección con tarjetas, dentro del contenedor (el primer retrato arranca en el borde del logo)
  const renderCardSection = (testId: string, title: string, children: ReactNode) => (
    <section className="ss-container pt-16 lg:pt-20" data-testid={testId}>
      <h2 className="ss-h2 mb-10 lg:mb-12">{title}</h2>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-4">
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
        <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-team-hero">
          <div className="ss-container">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <Eyebrow num="03" tone="navy" className="mb-6" />
              <h1
                className="mb-5"
                data-testid="text-team-title"
              >
                {t.title}
              </h1>
              <p
                data-testid="text-team-subtitle"
              >
                {t.subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Sin barra de búsqueda, filtros ni cuenta: la página nombra a los socios y muestra el
            mosaico del equipo; no hay nada que buscar. */}
        {errorAll ? (
          <div className="ss-container py-24" data-testid="container-team-error">
            <p className="text-ss-tinta" data-testid="text-team-error">{t.errorMessage}</p>
          </div>
        ) : isLoadingAll ? (
          // Carga con la misma retícula de tarjetas que la vista final
          <div className="ss-container pt-16 lg:pt-20" aria-busy="true">
            <Skeleton className="h-9 w-40 mb-10 lg:mb-12 bg-ss-rule" />
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[112px_1fr] items-end gap-x-5 sm:block" data-testid={`skeleton-team-member-${i}`}>
                  <Skeleton className="aspect-[4/5] w-full rounded-none bg-ss-rule" />
                  <div className="sm:mt-5">
                    <Skeleton className="h-7 w-4/5 mb-3 bg-ss-rule" />
                    <Skeleton className="h-3 w-1/2 bg-ss-rule" />
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
                t.partnersOnly,
                groupedMembers.partners.map((member, i) => renderPersonCard(member, t.positions.partner, i < 2)),
              )}

            {/* ─── OF COUNSEL ──────────────────────────────────── */}
            {groupedMembers.ofCounsel.length > 0 &&
              renderCardSection(
                "section-ofcounsel",
                t.ofCounsel,
                groupedMembers.ofCounsel.map((member) => renderPersonCard(member, t.ofCounsel, false)),
              )}

            {/* ─── INTEGRANTES DEL EQUIPO (mosaico anónimo: aún sin nombres) ─────── */}
            {equipoPhotos.length > 0 && (
              <section className="pt-20 lg:pt-24" data-testid="section-associates">
                <div className="ss-container pb-10 lg:pb-12">
                  {/* No repite el h1 "Nuestro equipo": "Integrantes del equipo", como en la redacción */}
                  <h2 className="ss-h2">
                    {t.associatesTitle}
                  </h2>
                  {/* Los retratos son decorativos (alt vacío) hasta que exista la relación de nombres;
                      sin cifra: el número de integrantes no está confirmado */}
                  <p className="sr-only">{t.mosaicNote}</p>
                </div>
                {/* Desktop: diez columnas a todo lo ancho; filas que se expanden al pasar el cursor.
                    Sin cursor de enlace: no llevan a ninguna parte. La última fila termina en una
                    celda Hueso que ocupa las columnas vacías (cada retrato conserva su ancho). */}
                <div className="hidden lg:block">
                  {chunkArray(equipoPhotos, EQUIPO_COLUMNS.lg).map((row, rowIdx, rows) => (
                    <div
                      key={rowIdx}
                      className="flex w-full h-[400px]"
                      onMouseLeave={() => setAssocPanels(prev => ({ ...prev, [rowIdx]: null }))}
                    >
                      {row.map((photo, colIdx) => {
                        const panelKey = `p-${rowIdx}-${colIdx}`;
                        const isActive = assocPanels[rowIdx] === panelKey;
                        return (
                          <div
                            key={panelKey}
                            data-testid={`img-equipo-${rowIdx}-${colIdx}`}
                            className="relative overflow-hidden block"
                            style={{ flex: isActive ? 4 : 1, transition: "flex 0.45s cubic-bezier(0.22, 1, 0.36, 1)", minWidth: 0 }}
                            onMouseEnter={() => setAssocPanels(prev => ({ ...prev, [rowIdx]: panelKey }))}
                          >
                            {/* Mosaico sin nombres: retrato en grises sin velo */}
                            <img src={photo} alt="" aria-hidden="true" loading="lazy" decoding="async" className="ss-photo absolute inset-0 w-full h-full object-cover object-top" style={{ transform: isActive ? "scale(1.03)" : "scale(1)", transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)" }} />
                            <div className="absolute top-0 right-0 w-px h-full bg-white/10" />
                          </div>
                        );
                      })}
                      {!equipoClosingOwnRow && rowIdx === rows.length - 1 && (
                        // Sin relleno en la celda (el contenido va en absoluto): el relleno se sumaba
                        // a su base flex y estrechaba los retratos de la última fila
                        <div
                          data-testid="cell-equipo-closing"
                          className="relative bg-ss-paper"
                          style={{ flex: equipoClosingSpan.lg, minWidth: 0 }}
                        >
                          <div className="absolute bottom-6 start-6 end-6 flex flex-col items-start">
                            {closingContent}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {equipoClosingOwnRow && (
                    <div data-testid="cell-equipo-closing" className="flex flex-col items-start bg-ss-paper px-6 py-8">
                      {closingContent}
                    </div>
                  )}
                </div>
                {/* Teléfono y tableta: retícula compacta de columnas iguales (5 en el teléfono, 8 desde
                    md), con la misma celda Hueso de cierre en la última fila */}
                <div className="lg:hidden grid grid-cols-5 md:grid-cols-8 gap-px">
                  {equipoPhotos.map((photo, idx) => (
                    <div key={idx} className="relative overflow-hidden block" style={{ aspectRatio: "3/4" }} data-testid={`img-equipo-mob-${idx}`}>
                      <img src={photo} alt="" aria-hidden="true" loading="lazy" decoding="async" className="ss-photo absolute inset-0 w-full h-full object-cover object-top" />
                    </div>
                  ))}
                  <div
                    data-testid="cell-equipo-closing-mob"
                    className="flex flex-col items-start justify-end bg-ss-paper p-3 md:hidden"
                    style={{ gridColumn: `span ${equipoClosingSpan.phone} / span ${equipoClosingSpan.phone}` }}
                  >
                    {closingContent}
                  </div>
                  <div
                    data-testid="cell-equipo-closing-md"
                    className="hidden flex-col items-start justify-end bg-ss-paper p-4 md:flex"
                    style={{ gridColumn: `span ${equipoClosingSpan.md} / span ${equipoClosingSpan.md}` }}
                  >
                    {closingContent}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
