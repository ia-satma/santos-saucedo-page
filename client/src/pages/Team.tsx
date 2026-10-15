import { useState, useMemo, useEffect, type SyntheticEvent } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTeamPhotoObjectPosition } from "@/lib/teamPhotoPosition";
import { equipoMosaicPhotos as equipoPhotos } from "@/lib/equipoMosaicPhotos";
import { fallbackToOriginalSrc, getTeamPhotoSrcSet, highFetchPriority, isNamedOnTeamPage, isOfCounselMember } from "@/lib/teamPhotoSources";
import { Eyebrow } from "@/components/editorial";
import type { TeamMember, PracticeGroup, IndustryGroup } from "@shared/schema";

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

// Columnas vacías al final de la última fila (0 si la cuenta cierra la fila)
function emptyColumns(total: number, columns: number): number {
  return (columns - (total % columns)) % columns;
}

// Map URL parameters to filter values
const urlTypeToFilter: Record<string, string> = {
  "partners": "partners",
  "of-counsel": "ofcounsel",
  "counsel": "ofcounsel",
  "associates": "associates",
};

// Helper to get filter from URL search params
function getFilterFromURL(): string {
  if (typeof window === "undefined") return "all";
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get("type");
  if (typeParam && urlTypeToFilter[typeParam]) {
    return urlTypeToFilter[typeParam];
  }
  return "all";
}

export default function Team() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  // Initialize filter directly from URL to avoid flash of unfiltered content
  const [filterSeniority, setFilterSeniority] = useState<string>(() => getFilterFromURL());
  const [filterPractice, setFilterPractice] = useState<string>("all");
  const [filterLetter, setFilterLetter] = useState<string>("all");
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [partnerPanels, setPartnerPanels] = useState<Record<number, string | null>>({});
  const [assocPanels, setAssocPanels] = useState<Record<number, string | null>>({});
  
  // Listen for URL changes to update filter (for SPA navigation)
  useEffect(() => {
    const handleUrlChange = () => {
      setFilterSeniority(getFilterFromURL());
    };
    
    window.addEventListener("popstate", handleUrlChange);
    
    // Poll for URL changes (for SPA navigation that doesn't trigger popstate)
    let lastSearch = window.location.search;
    const checkUrlChange = setInterval(() => {
      if (window.location.search !== lastSearch) {
        lastSearch = window.location.search;
        setFilterSeniority(getFilterFromURL());
      }
    }, 100);
    
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      clearInterval(checkUrlChange);
    };
  }, []);

  const { data: allTeamMembers, isLoading: isLoadingAll, error: errorAll } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  const { data: practiceGroups } = useQuery<PracticeGroup[]>({
    queryKey: ["/api/practice-groups"],
  });

  const { data: industryGroups } = useQuery<IndustryGroup[]>({
    queryKey: ["/api/industry-groups"],
  });

  const content: Record<string, {
    title: string;
    subtitle: string;
    errorMessage: string;
    allMembers: string;
    partnersOnly: string;
    ofCounsel: string;
    associates: string;
    viewProfile: string;
    downloadVCard: string;
    searchPlaceholder: string;
    filterBy: string;
    seniority: string;
    practiceArea: string;
    alphabetic: string;
    all: string;
    clearFilters: string;
    noResults: string;
    teamMembers: string;
    associatesTitle: string;
    categoryLabel: string;
    initialLabel: string;
    allLetters: string;
    mosaicNote: string;
    mosaicCount: string;
    positions: {
      foundingPartner: string;
      partner: string;
      ofCounsel: string;
      seniorAssociate: string;
      associate: string;
    };
  }> = {
    en: {
      title: "Our Team",
      subtitle: "Partners and team of Santos & Saucedo.",
      errorMessage: "Failed to load team members",
      allMembers: "All",
      partnersOnly: "Partners",
      ofCounsel: "Of Counsel",
      associates: "Associates",
      viewProfile: "View Profile",
      downloadVCard: "Download vCard",
      searchPlaceholder: "Search by name...",
      filterBy: "Filter by",
      seniority: "Seniority",
      practiceArea: "Practice Area",
      alphabetic: "Alphabetic",
      all: "All",
      clearFilters: "Clear filters",
      noResults: "No team members match your criteria",
      teamMembers: "team members",
      associatesTitle: "Team members",
      categoryLabel: "Category",
      initialLabel: "Initial",
      allLetters: "All",
      mosaicNote: "Portraits of {n} team members.",
      mosaicCount: "{n} team members",
      positions: {
        foundingPartner: "Founding Partner",
        partner: "Partner",
        ofCounsel: "Of Counsel",
        seniorAssociate: "Senior Associate",
        associate: "Associate",
      },
    },
    es: {
      title: "Nuestro equipo",
      subtitle: "Socios y equipo de Santos & Saucedo.",
      errorMessage: "Error al cargar los miembros del equipo",
      allMembers: "Todos",
      partnersOnly: "Socios",
      ofCounsel: "Of Counsel",
      associates: "Asociados",
      viewProfile: "Ver perfil",
      downloadVCard: "Descargar vCard",
      searchPlaceholder: "Buscar por nombre...",
      filterBy: "Filtrar por",
      seniority: "Nivel",
      practiceArea: "Área de práctica",
      alphabetic: "Alfabético",
      all: "Todos",
      clearFilters: "Limpiar filtros",
      noResults: "No hay miembros que coincidan con los criterios",
      teamMembers: "miembros del equipo",
      associatesTitle: "Integrantes del equipo",
      categoryLabel: "Categoría",
      initialLabel: "Inicial",
      allLetters: "Todas",
      mosaicNote: "Retratos de {n} integrantes del equipo.",
      mosaicCount: "{n} integrantes",
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
      allMembers: "Alle",
      partnersOnly: "Partner",
      ofCounsel: "Of Counsel",
      associates: "Associates",
      viewProfile: "Profil anzeigen",
      downloadVCard: "vCard herunterladen",
      searchPlaceholder: "Suchen...",
      filterBy: "Filtern nach",
      seniority: "Alle Positionen",
      practiceArea: "Alle Praxisbereiche",
      alphabetic: "Alphabetisch",
      all: "Alle",
      clearFilters: "Filter löschen",
      noResults: "Keine Ergebnisse gefunden",
      teamMembers: "Teammitglieder",
      associatesTitle: "Teammitglieder",
      categoryLabel: "Kategorie",
      initialLabel: "Buchstabe",
      allLetters: "Alle",
      mosaicNote: "Porträts von {n} Teammitgliedern.",
      mosaicCount: "{n} Teammitglieder",
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
      allMembers: "全部",
      partnersOnly: "合伙人",
      ofCounsel: "法律顾问",
      associates: "律师",
      viewProfile: "查看简介",
      downloadVCard: "下载名片",
      searchPlaceholder: "搜索...",
      filterBy: "筛选",
      seniority: "所有职位",
      practiceArea: "所有业务领域",
      alphabetic: "字母顺序",
      all: "全部",
      clearFilters: "清除筛选",
      noResults: "未找到结果",
      teamMembers: "团队成员",
      associatesTitle: "团队成员",
      categoryLabel: "类别",
      initialLabel: "首字母",
      allLetters: "全部",
      mosaicNote: "{n} 位团队成员的肖像。",
      mosaicCount: "{n} 位团队成员",
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
      allMembers: "전체",
      partnersOnly: "파트너",
      ofCounsel: "고문",
      associates: "어소시에이트",
      viewProfile: "프로필 보기",
      downloadVCard: "명함 다운로드",
      searchPlaceholder: "검색...",
      filterBy: "필터",
      seniority: "모든 직위",
      practiceArea: "모든 업무 분야",
      alphabetic: "알파벳순",
      all: "전체",
      clearFilters: "필터 초기화",
      noResults: "결과 없음",
      teamMembers: "팀원",
      associatesTitle: "팀 구성원",
      categoryLabel: "구분",
      initialLabel: "이니셜",
      allLetters: "전체",
      mosaicNote: "팀 구성원 {n}명의 사진.",
      mosaicCount: "팀 구성원 {n}명",
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
      allMembers: "すべて",
      partnersOnly: "パートナー",
      ofCounsel: "オブ・カウンセル",
      associates: "アソシエイト",
      viewProfile: "プロフィールを見る",
      downloadVCard: "名刺をダウンロード",
      searchPlaceholder: "検索...",
      filterBy: "フィルター",
      seniority: "すべての役職",
      practiceArea: "すべての取扱分野",
      alphabetic: "アルファベット順",
      all: "すべて",
      clearFilters: "フィルターをクリア",
      noResults: "結果が見つかりません",
      teamMembers: "チームメンバー",
      associatesTitle: "チームメンバー",
      categoryLabel: "区分",
      initialLabel: "頭文字",
      allLetters: "すべて",
      mosaicNote: "チームメンバー{n}名の写真。",
      mosaicCount: "チームメンバー{n}名",
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
      allMembers: "الكل",
      partnersOnly: "الشركاء",
      ofCounsel: "مستشار قانوني",
      associates: "المحامون",
      viewProfile: "عرض الملف الشخصي",
      downloadVCard: "تحميل بطاقة العمل",
      searchPlaceholder: "بحث...",
      filterBy: "تصفية حسب",
      seniority: "جميع المناصب",
      practiceArea: "جميع مجالات الممارسة",
      alphabetic: "أبجدي",
      all: "الكل",
      clearFilters: "مسح الفلاتر",
      noResults: "لم يتم العثور على نتائج",
      teamMembers: "أعضاء الفريق",
      associatesTitle: "أعضاء الفريق",
      categoryLabel: "الفئة",
      initialLabel: "الحرف الأول",
      allLetters: "الكل",
      mosaicNote: "صور {n} من أعضاء الفريق.",
      mosaicCount: "أعضاء الفريق: {n}",
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
      allMembers: "Все",
      partnersOnly: "Партнёры",
      ofCounsel: "Советник",
      associates: "Юристы",
      viewProfile: "Посмотреть профиль",
      downloadVCard: "Скачать визитку",
      searchPlaceholder: "Поиск...",
      filterBy: "Фильтр",
      seniority: "Все должности",
      practiceArea: "Все практики",
      alphabetic: "По алфавиту",
      all: "Все",
      clearFilters: "Сбросить фильтры",
      noResults: "Результаты не найдены",
      teamMembers: "членов команды",
      associatesTitle: "Сотрудники",
      categoryLabel: "Категория",
      initialLabel: "Первая буква",
      allLetters: "Все",
      mosaicNote: "Портреты сотрудников: {n}.",
      mosaicCount: "Сотрудников: {n}",
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
      allMembers: "Tous",
      partnersOnly: "Associés",
      ofCounsel: "Of Counsel",
      associates: "Collaborateurs",
      viewProfile: "Voir le profil",
      downloadVCard: "Télécharger vCard",
      searchPlaceholder: "Rechercher...",
      filterBy: "Filtrer par",
      seniority: "Tous les postes",
      practiceArea: "Tous les domaines de pratique",
      alphabetic: "Alphabétique",
      all: "Tous",
      clearFilters: "Effacer les filtres",
      noResults: "Aucun résultat trouvé",
      teamMembers: "membres de l'équipe",
      associatesTitle: "Membres de l'équipe",
      categoryLabel: "Catégorie",
      initialLabel: "Initiale",
      allLetters: "Toutes",
      mosaicNote: "Portraits de {n} membres de l'équipe.",
      mosaicCount: "{n} membres de l'équipe",
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
      allMembers: "Tutti",
      partnersOnly: "Partner",
      ofCounsel: "Of Counsel",
      associates: "Associate",
      viewProfile: "Vedi profilo",
      downloadVCard: "Scarica vCard",
      searchPlaceholder: "Cerca...",
      filterBy: "Filtra per",
      seniority: "Tutte le posizioni",
      practiceArea: "Tutte le aree di pratica",
      alphabetic: "Alfabetico",
      all: "Tutti",
      clearFilters: "Cancella filtri",
      noResults: "Nessun risultato trovato",
      teamMembers: "membri del team",
      associatesTitle: "Membri del team",
      categoryLabel: "Categoria",
      initialLabel: "Iniziale",
      allLetters: "Tutte",
      mosaicNote: "Ritratti di {n} membri del team.",
      mosaicCount: "{n} membri del team",
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

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const groupedMembers = useMemo(() => {
    if (!allTeamMembers) return { partners: [], ofCounsel: [], associates: [] };

    const applyTextFilters = (members: TeamMember[]) =>
      members.filter(m => {
        if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterLetter !== "all" && !m.name.toUpperCase().startsWith(filterLetter)) return false;
        return true;
      });

    const byConfiguredOrder = (a: TeamMember, b: TeamMember) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;

      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    };

    // Only the 4 founders with a confirmed, name-matched 2026 photo (the presentation's own
    // "Socios Fundadores" page, which captions each one) are shown as named cards. Other
    // isPartner:true members (e.g. Jaime Herrera de Herrera, David Martínez Saucedo) wait
    // until their file is identified — same reasoning as the associates mosaic. The rule
    // (isNamedOnTeamPage, lib/teamPhotoSources) is shared with "Equipo relacionado".
    const allPartners  = [...allTeamMembers.filter(m => m.isPartner && isNamedOnTeamPage(m))].sort(byConfiguredOrder);
    const allOfCounsel = [...allTeamMembers.filter(m => !m.isPartner && isNamedOnTeamPage(m))].sort(byConfiguredOrder);
    const allAssociates = [...allTeamMembers.filter(m => !m.isPartner && !isOfCounselMember(m))].sort(byConfiguredOrder);

    return {
      partners:   applyTextFilters(allPartners),
      ofCounsel:  applyTextFilters(allOfCounsel),
      associates: applyTextFilters(allAssociates),
    };
  }, [allTeamMembers, searchQuery, filterLetter]);

  const showPartners   = filterSeniority === "all" || filterSeniority === "partners";
  const showOfCounsel  = filterSeniority === "all" || filterSeniority === "ofcounsel";
  const showAssociates = filterSeniority === "all" || filterSeniority === "associates";

  const totalVisible =
    (showPartners   ? groupedMembers.partners.length   : 0) +
    (showOfCounsel  ? groupedMembers.ofCounsel.length  : 0) +
    (showAssociates ? equipoPhotos.length              : 0);

  // Celda Hueso de cierre del mosaico: ocupa las columnas que la última fila deja vacías y
  // lleva la cuenta (calculada, no escrita a mano), para que la retícula termine a propósito
  const equipoCount = t.mosaicCount.replace("{n}", String(equipoPhotos.length));
  const equipoClosingSpan = {
    phone: emptyColumns(equipoPhotos.length, EQUIPO_COLUMNS.phone),
    md: emptyColumns(equipoPhotos.length, EQUIPO_COLUMNS.md),
  };

  const hasActiveFilters = searchQuery || filterSeniority !== "all" || filterLetter !== "all" || filterPractice !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterSeniority("all");
    setFilterPractice("all");
    setFilterLetter("all");
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const getPhotoSrc = (member: TeamMember) => member.imageUrl || null;

  // Retratos de socios: WebP con srcset (mismo sizes en las dos variantes, así el navegador
  // elige el mismo archivo y lo descarga una vez); si la variante falla, vuelve al original.
  const photoSrcSetProps = (member: TeamMember) => {
    const srcSet = getTeamPhotoSrcSet(getPhotoSrc(member));
    return srcSet ? { srcSet, sizes: "50vw" } : {};
  };
  const handlePhotoError = (e: SyntheticEvent<HTMLImageElement>) => {
    if (!fallbackToOriginalSrc(e)) e.currentTarget.style.display = "none";
  };

  // Cargo de cada persona en su retrato (no la etiqueta plural de la sección): titleEs en
  // español; en los demás idiomas, title. Fuera de en ese título es inglés: va en <bdi lang="en">
  // (aislado del árabe sin cambiar la alineación del pie de foto).
  const renderMemberRole = (member: TeamMember, fallback: string, className: string) => {
    const englishFallback = language !== "es" && language !== "en" && !!member.title;
    const text = language === "es" ? (member.titleEs || member.title || fallback) : (member.title || fallback);
    return (
      <p className={`ss-label text-[11px] text-white/75 ${className}`}>
        {englishFallback ? <bdi lang="en" dir="ltr">{text}</bdi> : text}
      </p>
    );
  };

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

        {/* Filter bar: desde sm se pega bajo la cabecera sticky (z-40 < z-50 del header); en el
            teléfono no, porque taparía casi una cuarta parte de la pantalla sobre los retratos.
            Blanca y opaca, con filete inferior en Línea que la separa de las fotos. */}
        <div className="bg-white sm:sticky sm:top-[var(--ss-header-h)] z-40 border-b border-ss-rule">
          <div className="ss-container py-4">
            {/* Teléfono: búsqueda a todo lo ancho y debajo los dos filtros en dos columnas iguales.
                Cada filtro lleva su etiqueta visible (encima; al lado desde lg). */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 items-stretch sm:items-end lg:items-center">
              <div className="relative w-full sm:flex-1 sm:min-w-[12rem]">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ss-medio" aria-hidden="true" />
                {/* Campo recto con el filete de campo (--ss-input); foco Azul Marino. 44 px en el
                    teléfono, como los selectores */}
                <Input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  aria-label={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 sm:h-9 ps-9 bg-white border-ss-input text-ss-tinta placeholder:text-ss-medio focus-visible:ring-ss-marino focus-visible:border-ss-marino"
                  data-testid="input-search"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4 lg:gap-6">
                <div className="flex min-w-0 flex-col gap-1 lg:flex-row lg:items-center lg:gap-2">
                  <span id="team-filter-category" className="ss-label text-ss-medio">{t.categoryLabel}</span>
                  <Select value={filterSeniority} onValueChange={setFilterSeniority}>
                    <SelectTrigger className="w-full sm:w-48 bg-white border-ss-input text-ss-tinta text-sm" aria-labelledby="team-filter-category" data-testid="select-seniority">
                      <SelectValue placeholder={t.seniority} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all}</SelectItem>
                      <SelectItem value="partners">{t.partnersOnly}</SelectItem>
                      <SelectItem value="ofcounsel">{t.ofCounsel}</SelectItem>
                      <SelectItem value="associates">{t.associatesTitle}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex min-w-0 flex-col gap-1 lg:flex-row lg:items-center lg:gap-2">
                  <span id="team-filter-initial" className="ss-label text-ss-medio">{t.initialLabel}</span>
                  <Select value={filterLetter} onValueChange={setFilterLetter}>
                    <SelectTrigger className="w-full sm:w-24 bg-white border-ss-input text-ss-tinta text-sm" aria-labelledby="team-filter-initial" data-testid="select-alphabetic">
                      <SelectValue placeholder={t.alphabetic} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.allLetters}</SelectItem>
                      {alphabet.map(letter => (
                        <SelectItem key={letter} value={letter}>{letter}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="default" onClick={clearFilters} className="self-start sm:self-auto text-ss-marino underline-offset-4 hover:underline" data-testid="button-clear-filters">
                  {t.clearFilters}
                </Button>
              )}
              <span className="text-ss-medio text-sm hidden lg:inline" data-testid="text-results-count">{totalVisible} {t.teamMembers}</span>
            </div>
          </div>
        </div>

        {errorAll ? (
          <div className="ss-container py-24" data-testid="container-team-error">
            <p className="text-ss-tinta" data-testid="text-team-error">{t.errorMessage}</p>
          </div>
        ) : isLoadingAll ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-px">
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} className="bg-muted" style={{ aspectRatio: "3/4" }} data-testid={`skeleton-team-member-${i}`}>
                <Skeleton className="w-full h-full" />
              </div>
            ))}
          </div>
        ) : totalVisible === 0 ? (
          <div className="ss-container py-24" data-testid="container-team-empty">
            <p className="text-ss-tinta">{t.noResults}</p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-6" data-testid="button-clear-empty">
                {t.clearFilters}
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* ─── SOCIOS ──────────────────────────────────────── */}
            {showPartners && groupedMembers.partners.length > 0 && (
              <section data-testid="section-partners">
                <div className="ss-container pt-10 pb-4">
                  <h2 className="ss-h2-sm">
                    {t.partnersOnly}
                  </h2>
                </div>
                {/* Desktop: expanding panels — multiple rows of 8 */}
                <div className="hidden lg:block">
                  {chunkArray(groupedMembers.partners, 8).map((row, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="flex w-full h-[440px]"
                      onMouseLeave={() => setPartnerPanels(prev => ({ ...prev, [rowIdx]: null }))}
                    >
                      {row.map((member, colIdx) => {
                        const idx = rowIdx * 8 + colIdx;
                        const isActive = partnerPanels[rowIdx] === `p-${member.id}`;
                        return (
                          <Link
                            key={member.id}
                            href={`/team/${member.slug}`}
                            data-testid={`card-team-member-${member.slug}`}
                            aria-label={member.name}
                            className="relative overflow-hidden cursor-pointer block"
                            style={{ flex: isActive ? 3 : 1, transition: "flex 0.5s cubic-bezier(0.22, 1, 0.36, 1)", minWidth: 0 }}
                            onMouseEnter={() => setPartnerPanels(prev => ({ ...prev, [rowIdx]: `p-${member.id}` }))}
                          >
                            <div className="absolute inset-0 bg-ss-paper flex items-center justify-center">
                              <span className="text-2xl font-heading text-ss-marino/50 select-none">{getInitials(member.name)}</span>
                            </div>
                            {/* Retrato siempre en grises (también al pasar el cursor) y velo neutro único */}
                            {getPhotoSrc(member) && (
                              <img src={getPhotoSrc(member) || undefined} {...photoSrcSetProps(member)} alt="" aria-hidden="true" loading="eager" {...highFetchPriority} decoding="async" className="ss-photo absolute inset-0 w-full h-full object-cover object-top" style={{ objectPosition: getTeamPhotoObjectPosition(member.slug), transform: isActive ? "scale(1.01)" : "scale(1)", transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)" }} onError={handlePhotoError} />
                            )}
                            <div className="absolute inset-0 navy-photo-scrim" />
                            <div className="absolute top-0 right-0 w-px h-full bg-white/10" />
                            <div className="absolute bottom-5 left-3 right-3" style={{ opacity: isActive ? 0 : 1, transition: "opacity 0.2s ease" }}>
                              <p className="font-heading text-[18px] leading-[1.2] tracking-[-0.005em] text-white truncate">{member.name}</p>
                            </div>
                            <div className="absolute bottom-5 left-4 right-4" style={{ opacity: isActive ? 1 : 0, transform: isActive ? "translateY(0)" : "translateY(6px)", transition: "opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s" }}>
                              <p className="font-heading text-[18px] leading-[1.2] tracking-[-0.005em] mb-1 text-white whitespace-nowrap overflow-hidden text-ellipsis">{member.name}</p>
                              {renderMemberRole(member, t.positions.partner, "mb-3")}
                              <p className="ss-label text-[11px] text-white/75 flex items-center gap-2">
                                <span>{t.viewProfile}</span>
                                <span aria-hidden="true">→</span>
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {/* Mobile: 2-column portrait grid */}
                <div className="lg:hidden grid grid-cols-2 gap-px">
                  {groupedMembers.partners.map((member, idx) => (
                    <Link key={member.id} href={`/team/${member.slug}`} className="relative overflow-hidden group block cursor-pointer" style={{ aspectRatio: "3/4" }} data-testid={`card-team-member-mob-${member.slug}`} aria-label={member.name}>
                      <div className="absolute inset-0 bg-ss-paper flex items-center justify-center">
                        <span className="text-2xl font-heading text-ss-marino/50 select-none">{getInitials(member.name)}</span>
                      </div>
                      {getPhotoSrc(member) && (
                        <img src={getPhotoSrc(member) || undefined} {...photoSrcSetProps(member)} alt="" aria-hidden="true" loading="eager" {...highFetchPriority} decoding="async" className="ss-photo absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: getTeamPhotoObjectPosition(member.slug) }} onError={handlePhotoError} />
                      )}
                      <div className="absolute inset-0 navy-photo-scrim" />
                      {/* Nombre y, debajo, el cargo de cada socio, al pie del velo (donde es más denso) */}
                      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                        <p className="font-heading text-[16px] leading-[1.2] text-white line-clamp-2">{member.name}</p>
                        {renderMemberRole(member, t.positions.partner, "mt-1")}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ─── OF COUNSEL ──────────────────────────────────── */}
            {showOfCounsel && groupedMembers.ofCounsel.length > 0 && (
              <section data-testid="section-ofcounsel">
                <div className="ss-container pt-10 pb-4">
                  <h2 className="ss-h2-sm">
                    {t.ofCounsel}
                  </h2>
                </div>
                {/* Desktop: expanding panels */}
                <div className="hidden lg:flex w-full h-[380px]" onMouseLeave={() => setActivePanel(null)}>
                  {groupedMembers.ofCounsel.map((member, idx) => {
                    const isActive = activePanel === `oc-${member.id}`;
                    return (
                      <Link
                        key={member.id}
                        href={`/team/${member.slug}`}
                        data-testid={`card-team-member-${member.slug}`}
                        aria-label={member.name}
                        className="relative overflow-hidden cursor-pointer block"
                        style={{ flex: isActive ? 3 : 1, transition: "flex 0.5s cubic-bezier(0.22, 1, 0.36, 1)", minWidth: 0 }}
                        onMouseEnter={() => setActivePanel(`oc-${member.id}`)}
                      >
                        <div className="absolute inset-0 bg-ss-paper flex items-center justify-center">
                          <span className="text-4xl font-heading text-ss-marino/50 select-none">{getInitials(member.name)}</span>
                        </div>
                        {getPhotoSrc(member) && (
                          <img src={getPhotoSrc(member) || undefined} alt="" aria-hidden="true" loading="lazy" decoding="async" className="ss-photo absolute inset-0 w-full h-full object-cover object-top" style={{ objectPosition: getTeamPhotoObjectPosition(member.slug), transform: isActive ? "scale(1.04)" : "scale(1)", transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)" }} onError={handlePhotoError} />
                        )}
                        <div className="absolute inset-0 navy-photo-scrim" />
                        <div className="absolute top-0 right-0 w-px h-full bg-white/10" />
                        <div className="absolute bottom-6 left-4 right-4" style={{ opacity: isActive ? 0 : 1, transition: "opacity 0.25s ease" }}>
                          <p className="font-heading text-[18px] leading-[1.2] tracking-[-0.005em] text-white truncate">{member.name}</p>
                        </div>
                        <div className="absolute bottom-6 left-5 right-5" style={{ opacity: isActive ? 1 : 0, transform: isActive ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s" }}>
                          <p className="font-heading text-[18px] leading-[1.2] tracking-[-0.005em] mb-1 text-white">{member.name}</p>
                          {renderMemberRole(member, t.ofCounsel, "mb-3")}
                          <p className="ss-label text-[11px] text-white/75 flex items-center gap-2">
                            <span>{t.viewProfile}</span>
                            <span aria-hidden="true">→</span>
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {/* Mobile: 2-column grid */}
                <div className="lg:hidden grid grid-cols-2 gap-px">
                  {groupedMembers.ofCounsel.map((member, idx) => (
                    <Link key={member.id} href={`/team/${member.slug}`} className="relative overflow-hidden group block cursor-pointer" style={{ aspectRatio: "3/4" }} data-testid={`card-team-member-mob-${member.slug}`} aria-label={member.name}>
                      <div className="absolute inset-0 bg-ss-paper flex items-center justify-center">
                        <span className="text-3xl font-heading text-ss-marino/50 select-none">{getInitials(member.name)}</span>
                      </div>
                      {getPhotoSrc(member) && (
                        <img src={getPhotoSrc(member) || undefined} alt="" aria-hidden="true" loading="lazy" decoding="async" className="ss-photo absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: getTeamPhotoObjectPosition(member.slug) }} onError={handlePhotoError} />
                      )}
                      <div className="absolute inset-0 navy-photo-scrim" />
                      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                        <p className="font-heading text-[16px] leading-[1.2] text-white line-clamp-2">{member.name}</p>
                        {renderMemberRole(member, t.ofCounsel, "mt-1")}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ─── INTEGRANTES DEL EQUIPO (mosaico anónimo: aún sin nombres) ─────── */}
            {showAssociates && equipoPhotos.length > 0 && (
              <section data-testid="section-associates">
                <div className="ss-container pt-10 pb-4">
                  {/* No repite el h1 "Nuestro equipo": "Integrantes del equipo", como en la redacción */}
                  <h2 className="ss-h2-sm">
                    {t.associatesTitle}
                  </h2>
                  {/* Los retratos son decorativos (alt vacío) hasta que exista la relación de nombres */}
                  <p className="sr-only">{t.mosaicNote.replace("{n}", String(equipoPhotos.length))}</p>
                </div>
                {/* Desktop: diez columnas a todo lo ancho; filas que se expanden al pasar el cursor.
                    Sin cursor de enlace: no llevan a ninguna parte. La última fila termina en una
                    celda Hueso que ocupa las columnas vacías (cada retrato conserva su ancho). */}
                <div className="hidden lg:block">
                  {chunkArray(equipoPhotos, EQUIPO_COLUMNS.lg).map((row, rowIdx) => (
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
                      {row.length < EQUIPO_COLUMNS.lg && (
                        // La cuenta ya la lee el párrafo sr-only de arriba. Sin relleno en la celda (la
                        // etiqueta va en absoluto): el relleno se sumaba a su base flex y estrechaba
                        // los retratos de la última fila.
                        <div
                          aria-hidden="true"
                          data-testid="cell-equipo-closing"
                          className="relative bg-ss-paper"
                          style={{ flex: EQUIPO_COLUMNS.lg - row.length, minWidth: 0 }}
                        >
                          <p className="ss-label ss-num text-ss-medio absolute bottom-6 start-6 end-6">{equipoCount}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Teléfono y tableta: retícula compacta de columnas iguales (5 en el teléfono, 8 desde
                    md), con la misma celda Hueso de cierre en la última fila */}
                <div className="lg:hidden grid grid-cols-5 md:grid-cols-8 gap-px">
                  {equipoPhotos.map((photo, idx) => (
                    <div key={idx} className="relative overflow-hidden block" style={{ aspectRatio: "3/4" }} data-testid={`img-equipo-mob-${idx}`}>
                      <img src={photo} alt="" aria-hidden="true" loading="lazy" decoding="async" className="ss-photo absolute inset-0 w-full h-full object-cover object-top" />
                    </div>
                  ))}
                  {equipoClosingSpan.phone > 0 && (
                    <div
                      aria-hidden="true"
                      data-testid="cell-equipo-closing-mob"
                      className="flex items-end bg-ss-paper p-3 md:hidden"
                      style={{ gridColumn: `span ${equipoClosingSpan.phone} / span ${equipoClosingSpan.phone}` }}
                    >
                      <p className="ss-label ss-num text-ss-medio">{equipoCount}</p>
                    </div>
                  )}
                  {equipoClosingSpan.md > 0 && (
                    <div
                      aria-hidden="true"
                      data-testid="cell-equipo-closing-md"
                      className="hidden items-end bg-ss-paper p-4 md:flex"
                      style={{ gridColumn: `span ${equipoClosingSpan.md} / span ${equipoClosingSpan.md}` }}
                    >
                      <p className="ss-label ss-num text-ss-medio">{equipoCount}</p>
                    </div>
                  )}
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
