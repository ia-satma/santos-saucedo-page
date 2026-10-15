import { useState, useMemo, useEffect } from "react";
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
import { equipoPhotos } from "@/lib/equipoPhotos";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTeamPhotoObjectPosition } from "@/lib/teamPhotoPosition";
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

function getBalancedColumns(total: number, preferredColumns: number): number {
  if (total <= preferredColumns) return total;

  const rows = Math.ceil(total / preferredColumns);
  return Math.ceil(total / rows);
}

// The 4 founders whose 2026 presentation photo is confirmed by name (the
// deck's own "Socios Fundadores" page captions each one). See groupedMembers.
const CONFIRMED_FOUNDER_SLUGS = new Set([
  "mario-saucedo-montemayor",
  "enrique-santos-guzman",
  "enrique-santos-arce",
  "mario-saucedo-rodriguez",
]);

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
      subtitle: "Meet the legal team behind our firm's standard of excellence",
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
      subtitle: "Conozca al equipo legal que sostiene la excelencia de nuestra firma",
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
      subtitle: "Lernen Sie unsere Experten kennen",
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
      subtitle: "认识我们的专家",
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
      subtitle: "전문가들을 만나보세요",
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
      subtitle: "専門家をご紹介します",
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
      subtitle: "تعرف على خبرائنا",
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
      subtitle: "Познакомьтесь с нашими экспертами",
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
      subtitle: "Rencontrez nos experts",
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
      subtitle: "Conosci i nostri esperti",
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

    const isOfCounsel = (m: TeamMember) => m.title?.toLowerCase() === "of counsel";
    // Only these 4 have a confirmed, name-matched 2026 photo (the presentation's own
    // "Socios Fundadores" page, which captions each one). Other isPartner:true members
    // (e.g. Jaime Herrera de Herrera, David Martínez Saucedo) don't have a confirmed new
    // photo yet, so — same reasoning as the associates mosaic — they're not shown as a
    // named/individually-photographed card until their file is identified.
    const allPartners  = [...allTeamMembers.filter(m => m.isPartner && CONFIRMED_FOUNDER_SLUGS.has(m.slug))].sort(byConfiguredOrder);
    const allOfCounsel = [...allTeamMembers.filter(m => !m.isPartner && isOfCounsel(m))].sort(byConfiguredOrder);
    const allAssociates = [...allTeamMembers.filter(m => !m.isPartner && !isOfCounsel(m))].sort(byConfiguredOrder);

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

  const equipoDesktopColumns = getBalancedColumns(equipoPhotos.length, 10);

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

  return (
    <div className="min-h-screen bg-background" data-testid="page-team">
      <SEOHead page="team" language={language} />
      <Header />
      
      <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-team-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
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

      {/* Filter bar: se pega bajo la cabecera sticky (z-40 < z-50 del header). Blanca y opaca,
          con filete inferior en Línea que la separa de las fotos que pasan debajo. */}
      <div className="bg-white sticky top-[var(--ss-header-h)] z-40 border-b border-ss-rule">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ss-medio" aria-hidden="true" />
              {/* Campo recto con el filete de campo (--ss-input); foco Azul Marino */}
              <Input
                type="text"
                placeholder={t.searchPlaceholder}
                aria-label={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 bg-white border-ss-input text-ss-tinta placeholder:text-ss-medio focus-visible:ring-ss-marino focus-visible:border-ss-marino"
                data-testid="input-search"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={filterSeniority} onValueChange={setFilterSeniority}>
                <SelectTrigger className="w-40 bg-white border-ss-input text-ss-tinta text-sm" aria-label={t.seniority} data-testid="select-seniority">
                  <SelectValue placeholder={t.seniority} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="partners">{t.partnersOnly}</SelectItem>
                  <SelectItem value="ofcounsel">{t.ofCounsel}</SelectItem>
                  <SelectItem value="associates">{language === "es" ? "Nuestro equipo" : "Our Team"}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterLetter} onValueChange={setFilterLetter}>
                <SelectTrigger className="w-28 bg-white border-ss-input text-ss-tinta text-sm" aria-label={t.alphabetic} data-testid="select-alphabetic">
                  <SelectValue placeholder={t.alphabetic} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  {alphabet.map(letter => (
                    <SelectItem key={letter} value={letter}>{letter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="default" onClick={clearFilters} className="text-ss-marino underline-offset-4 hover:underline" data-testid="button-clear-filters">
                  {t.clearFilters}
                </Button>
              )}
              <span className="text-ss-medio text-sm ms-2 hidden sm:inline" data-testid="text-results-count">{totalVisible} {t.teamMembers}</span>
            </div>
          </div>
        </div>
      </div>

      <main id="main-content" data-testid="section-team-main">

        {errorAll ? (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24" data-testid="container-team-error">
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
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24" data-testid="container-team-empty">
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
                <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-4">
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
                              <img src={getPhotoSrc(member) || undefined} alt="" aria-hidden="true" loading="lazy" decoding="async" className="ss-photo absolute inset-0 w-full h-full object-cover object-top" style={{ objectPosition: getTeamPhotoObjectPosition(member.slug), transform: isActive ? "scale(1.01)" : "scale(1)", transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                            )}
                            <div className="absolute inset-0 navy-photo-scrim" />
                            <div className="absolute top-0 right-0 w-px h-full bg-white/10" />
                            <div className="absolute bottom-5 left-3 right-3" style={{ opacity: isActive ? 0 : 1, transition: "opacity 0.2s ease" }}>
                              <p className="font-heading text-[18px] leading-[1.2] tracking-[-0.005em] text-white truncate">{member.name}</p>
                            </div>
                            <div className="absolute bottom-5 left-4 right-4" style={{ opacity: isActive ? 1 : 0, transform: isActive ? "translateY(0)" : "translateY(6px)", transition: "opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s" }}>
                              <p className="font-heading text-[18px] leading-[1.2] tracking-[-0.005em] mb-1 text-white whitespace-nowrap overflow-hidden text-ellipsis">{member.name}</p>
                              <p className="ss-label text-[11px] text-white/75 mb-3">{t.partnersOnly}</p>
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
                        <img src={getPhotoSrc(member) || undefined} alt="" aria-hidden="true" loading="lazy" decoding="async" className="ss-photo absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: getTeamPhotoObjectPosition(member.slug) }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      )}
                      <div className="absolute inset-0 navy-photo-scrim" />
                      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                        <p className="ss-label text-[11px] text-white/75 mb-1">{t.partnersOnly}</p>
                        <p className="font-heading text-[16px] leading-[1.2] text-white line-clamp-2">{member.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ─── OF COUNSEL ──────────────────────────────────── */}
            {showOfCounsel && groupedMembers.ofCounsel.length > 0 && (
              <section data-testid="section-ofcounsel">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-4">
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
                          <img src={getPhotoSrc(member) || undefined} alt="" aria-hidden="true" loading="lazy" decoding="async" className="ss-photo absolute inset-0 w-full h-full object-cover object-top" style={{ objectPosition: getTeamPhotoObjectPosition(member.slug), transform: isActive ? "scale(1.04)" : "scale(1)", transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        )}
                        <div className="absolute inset-0 navy-photo-scrim" />
                        <div className="absolute top-0 right-0 w-px h-full bg-white/10" />
                        <div className="absolute bottom-6 left-4 right-4" style={{ opacity: isActive ? 0 : 1, transition: "opacity 0.25s ease" }}>
                          <p className="font-heading text-[18px] leading-[1.2] tracking-[-0.005em] text-white truncate">{member.name}</p>
                        </div>
                        <div className="absolute bottom-6 left-5 right-5" style={{ opacity: isActive ? 1 : 0, transform: isActive ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s" }}>
                          <p className="font-heading text-[18px] leading-[1.2] tracking-[-0.005em] mb-1 text-white">{member.name}</p>
                          <p className="ss-label text-[11px] text-white/75 mb-3">{member.title}</p>
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
                        <img src={getPhotoSrc(member) || undefined} alt="" aria-hidden="true" loading="lazy" decoding="async" className="ss-photo absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: getTeamPhotoObjectPosition(member.slug) }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      )}
                      <div className="absolute inset-0 navy-photo-scrim" />
                      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                        <p className="ss-label text-[11px] text-white/75 mb-1">{member.title}</p>
                        <p className="font-heading text-[16px] leading-[1.2] text-white line-clamp-2">{member.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ─── NUESTRO EQUIPO (anonymous photo mosaic — no name mapping yet) ── */}
            {showAssociates && equipoPhotos.length > 0 && (
              <section data-testid="section-associates">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-4">
                  <h2 className="ss-h2-sm">
                    {language === "es" ? "Nuestro equipo" : "Our Team"}
                  </h2>
                </div>
                {/* Desktop: expanding panels — multiple rows */}
                <div className="hidden lg:block">
                  {chunkArray(equipoPhotos, equipoDesktopColumns).map((row, rowIdx) => (
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
                            className="relative overflow-hidden cursor-pointer block"
                            style={{ flex: isActive ? 4 : 1, transition: "flex 0.45s cubic-bezier(0.22, 1, 0.36, 1)", minWidth: 0 }}
                            onMouseEnter={() => setAssocPanels(prev => ({ ...prev, [rowIdx]: panelKey }))}
                          >
                            {/* Mosaico sin nombres: retrato en grises sin velo */}
                            <img src={photo} alt="" aria-hidden="true" loading="lazy" decoding="async" className="ss-photo absolute inset-0 w-full h-full object-cover object-top" style={{ transform: isActive ? "scale(1.03)" : "scale(1)", transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)" }} />
                            <div className="absolute top-0 right-0 w-px h-full bg-white/10" />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {/* Mobile: 2-column portrait grid */}
                <div className="lg:hidden grid grid-cols-2 gap-px">
                  {equipoPhotos.map((photo, idx) => (
                    <div key={idx} className="relative overflow-hidden group block cursor-pointer" style={{ aspectRatio: "3/4" }} data-testid={`img-equipo-mob-${idx}`}>
                      <img src={photo} alt="" aria-hidden="true" loading="lazy" decoding="async" className="ss-photo absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  ))}
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
