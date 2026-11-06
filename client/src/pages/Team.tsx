// Página «Socios» (/team) con el diseño de la demo v3 (vista #socios, aprobada el 5-11-2026):
// «Nuestros socios» (un retrato a la vez, los nombres como índice y el cintillo; ver
// v3/socios/Lienzo.tsx), los Of Counsel si el panel los tiene, «El equipo» (el muro de retratos
// en tres filas que se deslizan; v3/socios/Equipo.tsx) con el enlace a Carreras, y al final
// «Siguiente: Contacto».
// Lo que viene del sitio se conserva: socios y Of Counsel de /api/team (orden y visibilidad del
// panel, isNamedOnTeamPage), retratos con su srcset y el tratamiento in memoriam, enlaces a cada
// ficha, mosaico del CMS con su encuadre, textos del panel ("team") en 10 idiomas y SEO.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useCmsMedia } from "@/lib/cmsMedia";
import { isNamedOnTeamPage } from "@/lib/teamPhotoSources";
import { chrome26 } from "@/components/home26/chrome26";
import { keepFirmName } from "@/lib/firmName";
import defaults from "@shared/cms-defaults.json";
import type { TeamMember } from "@shared/schema";
import { V3Main, V3NextPage, useV3Lang } from "@/v3/shared";
import { SociosLienzo, SociosLienzoPlaceholder, OfCounsel, type LienzoPartner } from "@/v3/socios/Lienzo";
import { EquipoMuro } from "@/v3/socios/Equipo";
import { SOCIOS_TEXTS } from "@/v3/socios/texts";

// "(in memoriam)" con espacio duro, como en la ficha (TeamMemberDetail): no se parte entre líneas
const keepInMemoriam = (text: string) => text.replace(/\((in)\s+(memoriam)\)/gi, "($1\u00a0$2)");

export default function Team() {
  const { teamMosaic: equipoPhotos } = useCmsMedia();
  const cmsChrome = useCmsContent("chrome", chrome26);
  const cmsLinks = useCmsContent("links", defaults.links);
  const { language } = useLanguage();
  const { lang, attrs } = useV3Lang();
  const tv = SOCIOS_TEXTS[lang];
  // Español o inglés: los textos de la demo; los demás idiomas: lo que el sitio ya tiene traducido
  const ownLang = language === "es" || language === "en";

  const { data: allTeamMembers, isLoading: isLoadingAll, error: errorAll } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

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

  // Nombres del menú en cada idioma (E5): "Socios" (nav[2]), "Carreras" (nav[4]) y "Contacto" (nav[5])
  const navLabels = (cmsChrome[language] ?? cmsChrome.es).nav;
  const pageTitle = ownLang ? tv.title : navLabels[2].label;
  const listLabel = ownLang ? tv.list : navLabels[2].label;
  const careersLabel = navLabels[4].label;
  const teamTitle = ownLang ? tv.teamTitle : t.associatesTitle;
  const internal = (href: string | undefined, fallback: string) => (href && href.startsWith("/") ? href : fallback);

  // Cargo de cada persona: titleEs en español; en los demás idiomas, title. Fuera de es y en ese
  // título es inglés y lo declara (lang="en").
  const toPerson = (member: TeamMember, fallback: string): LienzoPartner => {
    const englishFallback = language !== "es" && language !== "en" && !!member.title;
    const role = language === "es" ? (member.titleEs || member.title || fallback) : (member.title || fallback);
    return {
      slug: member.slug,
      name: member.name,
      role: keepInMemoriam(role),
      roleLang: englishFallback ? "en" : undefined,
      imageUrl: member.imageUrl,
    };
  };

  const groupedMembers = useMemo(() => {
    if (!allTeamMembers) return { partners: [] as TeamMember[], ofCounsel: [] as TeamMember[] };
    const byConfiguredOrder = (a: TeamMember, b: TeamMember) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    };
    // Solo los socios con retrato 2026 confirmado por nombre y los Of Counsel llevan nombre
    // (isNamedOnTeamPage, shared/teamVisibility, la misma regla de "Equipo relacionado", el
    // buscador y el mapa del sitio). Los asociados van en el muro, sin nombres.
    const partners = allTeamMembers.filter(m => m.isPartner && isNamedOnTeamPage(m)).sort(byConfiguredOrder);
    const ofCounsel = allTeamMembers.filter(m => !m.isPartner && isNamedOnTeamPage(m)).sort(byConfiguredOrder);
    return { partners, ofCounsel };
  }, [allTeamMembers]);

  const partners = groupedMembers.partners.map(m => toPerson(m, t.positions.partner));
  const ofCounsel = groupedMembers.ofCounsel.map(m => toPerson(m, t.ofCounsel));
  // El Lienzo se vuelve a montar (y su turno empieza de nuevo) si cambian los socios o el idioma
  const lienzoKey = `${language}|${partners.map(p => `${p.slug}:${p.name}:${p.role}:${p.imageUrl ?? ""}`).join("|")}`;

  return (
    <div className="ss26 min-h-screen" data-testid="page-team">
      <SEOHead page="team" language={language} />
      <Header />

      <V3Main vista="socios">
        {errorAll || isLoadingAll ? (
          // Carga (o error): la misma sección con la misma altura, sin turno
          <SociosLienzoPlaceholder
            title={pageTitle}
            busy={!errorAll}
            message={errorAll ? t.errorMessage : tv.loading}
          />
        ) : (
          <SociosLienzo
            key={lienzoKey}
            partners={partners}
            t={tv}
            attrs={attrs}
            title={pageTitle}
            list={listLabel}
            // Subtítulo del panel: solo si algún idioma lo trae (E3)
            lead={t.subtitle ? keepFirmName(t.subtitle) : undefined}
          >
            <OfCounsel title={t.ofCounsel} people={ofCounsel} />
          </SociosLienzo>
        )}

        {/* El equipo: muro de retratos sin nombres (mosaico del CMS), fuera de la carga: las fotos son
            estáticas y el bloque ocupa su sitio desde el principio */}
        <EquipoMuro
          photos={equipoPhotos}
          title={teamTitle}
          lead={tv.teamLead}
          leadAttrs={attrs}
          wallLabel={t.mosaicNote}
          careersLabel={careersLabel}
          careersHref={internal(cmsLinks.interns, "/careers/interns")}
        />

        <div {...attrs}>
          <V3NextPage
            href={internal(cmsLinks.contact, "/contact")}
            label={tv.next}
            title={ownLang ? navLabels[5].label : tv.nextTitle}
            ariaLabel={tv.nextAria}
          />
        </div>
      </V3Main>

      <Footer />
    </div>
  );
}
