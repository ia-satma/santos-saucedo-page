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
import { SociosLienzo, OfCounsel, type LienzoPartner } from "@/v3/socios/Lienzo";
import { EquipoMuro } from "@/v3/socios/Equipo";
import { useV3Content } from "@/v3/useV3Content";
import { firmPartners } from "@/v3/socios/partners";
import { Mapa } from "@/v3/industrias/Mapa";
import { INDUSTRIAS_TEXTS } from "@/v3/industrias/texts";
import { useSiteContact } from "@/components/home26/useSiteContact";

// El mapa de la red (el mismo de Industrias), aquí como presencia de la firma en el país: desde la sede,
// los socios y el equipo llegan a las 32 entidades. En Industrias habla de las plantas de los clientes.
const PRESENCIA = {
  es: {
    titulo: "Presencia en todo el país",
    entrada: "Desde San Pedro Garza García, los socios y su equipo atienden a sus clientes en las 32 entidades federativas, con una alianza de despachos presente en más de 72 ciudades.",
  },
  en: {
    titulo: "Presence across Mexico",
    entrada: "From San Pedro Garza García, the partners and their team serve clients in all 32 federal entities, through an alliance of law firms present in more than 72 cities.",
  },
} as const;

// Encabezado del panel: manda si el cliente lo cambió; si sigue con el texto predeterminado del
// panel (que no es el de la demo), el de la demo aprobada
const editedInPanel = (value: string | undefined, ...defaultValues: (string | undefined)[]) =>
  !!value && !defaultValues.includes(value);

// "(in memoriam)" con espacio duro, como en la ficha (TeamMemberDetail): no se parte entre líneas
const keepInMemoriam = (text: string) => text.replace(/\((in)\s+(memoriam)\)/gi, "($1\u00a0$2)");

export default function Team() {
  const { teamMosaic: equipoPhotos } = useCmsMedia();
  const cmsChrome = useCmsContent("chrome", chrome26);
  const cmsLinks = useCmsContent("links", defaults.links);
  const cmsIndustries = useCmsContent("industries", defaults.industries);
  const cmsTeam = useCmsContent("team", defaults.team);
  const { language } = useLanguage();
  const { lang, locale, attrs } = useV3Lang();
  const { locale: v3 } = useV3Content();
  // Dirección de la sede para el mapa (la misma del pie y de /contact)
  const { address: sede } = useSiteContact(locale);
  const cmsMapa = (cmsIndustries[locale] as any)?.v3?.mapa;
  const presencia = (cmsTeam[language] as any)?.presence ?? PRESENCIA[lang];
  const mapaTextos = useMemo(() => ({ ...(cmsMapa ?? INDUSTRIAS_TEXTS[locale].mapa), ...presencia }), [cmsMapa, locale, presencia]);
  const tv = v3.socios;
  const ownLang = true;

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
      mosaicNote: "Portraits of the members of the Santos & Saucedo team",
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
      // Nota de los retratos (aria-label del muro): la de la demo
      mosaicNote: "Retratos de los integrantes del equipo de Santos & Saucedo",
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
  const chromeDefaults = defaults.chrome as unknown as Record<string, { nav: { label: string }[] }>;
  const teamDefaults = defaults.team as unknown as Record<string, { associatesTitle?: string; mosaicNote?: string }>;
  // Títulos de la página leídos del panel (I5): el h1, de la etiqueta «Socios» del menú (nav[2]);
  // «El equipo», de «Integrantes del equipo» (team.associatesTitle). En español e inglés, mientras
  // el panel conserve su texto predeterminado, la redacción de la demo («Nuestros socios», «El
  // equipo»); si el cliente lo edita, manda el panel. Los demás idiomas leen el panel siempre.
  const navTitleEdited = editedInPanel(navLabels[2].label, (chrome26[language] ?? chrome26.es).nav[2].label, chromeDefaults[language]?.nav[2]?.label);
  const teamTitleEdited = editedInPanel(t.associatesTitle, content[language]?.associatesTitle, teamDefaults[language]?.associatesTitle);
  const pageTitle = ownLang && !navTitleEdited ? tv.title : navLabels[2].label;
  const listLabel = navLabels[2].label;
  const careersLabel = navLabels[4].label;
  const teamTitle = ownLang && !teamTitleEdited ? tv.teamTitle : t.associatesTitle;
  // Nota del muro (M28): la de la demo mientras el panel guarde la predeterminada anterior
  // («Retratos de integrantes del equipo.»); si el cliente la edita, manda el panel
  const wallLabel = editedInPanel(t.mosaicNote, teamDefaults[language]?.mosaicNote) ? t.mosaicNote : (content[language] ?? content.en).mosaicNote;
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
    const byConfiguredOrder = (a: TeamMember, b: TeamMember) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    };
    // Los cuatro socios SIEMPRE, en el orden de la firma (regla del cliente; v3/socios/partners):
    // de /api/team cuando llega y, si falta alguno (el panel lo oculta, la API falla o aún no
    // responde), con los datos de respaldo de la banda del inicio. Los demás socios y los Of Counsel
    // siguen la visibilidad del panel (isNamedOnTeamPage, shared/teamVisibility). Los asociados van
    // en el muro, sin nombres.
    const members = errorAll ? [] : allTeamMembers;
    const partners = firmPartners(members);
    const ofCounsel = (members ?? []).filter(m => !m.isPartner && isNamedOnTeamPage(m)).sort(byConfiguredOrder);
    return { partners, ofCounsel };
  }, [allTeamMembers, errorAll]);

  const partners = groupedMembers.partners.map(m => toPerson(m, t.positions.partner));
  const ofCounsel = groupedMembers.ofCounsel.map(m => toPerson(m, t.ofCounsel));
  // El Lienzo se vuelve a montar (y su turno empieza de nuevo) si cambian los socios o el idioma
  const lienzoKey = `${language}|${partners.map(p => `${p.slug}:${p.name}:${p.role}:${p.imageUrl ?? ""}`).join("|")}`;

  return (
    <div className="ss26 min-h-screen" data-testid="page-team">
      <SEOHead page="team" language={language} />
      <Header />

      <V3Main vista="socios">
        {/* Los cuatro socios desde el primer momento (con los datos de respaldo mientras llega
            /api/team: los mismos nombres, cargos y retratos, así que el Lienzo no se vuelve a montar
            al llegar). Los Of Counsel, cuando responde la API. */}
        <SociosLienzo
          key={lienzoKey}
          partners={partners}
          t={tv}
          attrs={attrs}
          lang={language}
          title={pageTitle}
          list={listLabel}
          // Subtítulo del panel: solo si algún idioma lo trae (E3)
          lead={t.subtitle ? keepFirmName(t.subtitle) : undefined}
        >
          {!isLoadingAll && <OfCounsel title={t.ofCounsel} people={ofCounsel} />}
        </SociosLienzo>

        {/* El equipo: muro de retratos sin nombres (mosaico del CMS), fuera de la carga: las fotos son
            estáticas y el bloque ocupa su sitio desde el principio */}
        <EquipoMuro
          photos={equipoPhotos}
          title={teamTitle}
          lead={tv.teamLead}
          leadAttrs={attrs}
          wallLabel={wallLabel}
          careersLabel={careersLabel}
          careersHref={internal(cmsLinks.interns, "/careers/interns")}
          // «Pasantías S&S» es el nombre del programa: no se traduce y fuera del español se marca lang="es"
          careersNameLang={language !== "es" ? "es" : undefined}
        />

        {/* Presencia nacional: el mapa interactivo de la red, después del equipo */}
        <div {...attrs}>
          <Mapa t={mapaTextos} address={sede} />
        </div>

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
