import { useCmsContent } from "@/hooks/useCmsContent";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isNativeLanguage } from "@/lib/translationUtils";
import { getIndustryImage } from "@/lib/practiceIndustryImages";
import { Eyebrow } from "@/components/editorial";
import type { IndustryGroup } from "@shared/schema";

interface IndustryGroupCardProps {
  group: IndustryGroup;
  index: number;
  learnMoreText: string;
}

function IndustryGroupCard({ group, index, learnMoreText }: IndustryGroupCardProps) {
  const { language } = useLanguage();

  const { translatedFields, isLoading, isTranslating } = useTranslatedContent({
    contentType: 'industry_group',
    entityId: String(group.id),
    fields: {
      name: group.name,
      nameEs: group.nameEs,
      description: group.description,
      descriptionEs: group.descriptionEs,
    },
    enabled: !isNativeLanguage(language),
  });

  const displayName = translatedFields.name || group.name;
  const displayDescription = translatedFields.description || group.description;
  const showTranslatingIndicator = isLoading || isTranslating;
  const numberLabel = String(index + 1).padStart(2, "0");

  const imageUrl = getIndustryImage(group.slug, group.imageUrl);

  // Fila abierta "Clásica": filete superior, numeral en romana 300 Gris Claro, foto en
  // color, titular en romana
  // Azul Marino, texto de 16 px y enlace de texto. Sin borde lateral ni sombra.
  return (
    <Link href={`/industry-groups/${group.slug}`}>
      <article
        className="group relative h-full cursor-pointer flex flex-col border-t border-ss-rule pt-6"
        data-testid={`card-industry-group-${group.slug}`}
      >
        <span
          aria-hidden="true"
          className="ss-numeral mb-4"
          data-testid={`number-industry-group-${group.slug}`}
        >
          {numberLabel}
        </span>
        <div className="relative aspect-[4/3] overflow-hidden bg-ss-paper mb-5">
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            aria-hidden="true"
            className="ss-photo absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          {showTranslatingIndicator && (
            <div className="absolute top-3 end-3 z-10 flex items-center px-2 py-1 bg-ss-navy/80 text-white">
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
            </div>
          )}
        </div>
        <h3
          className="ss-h3 mb-2"
          data-testid={`text-industry-group-name-${group.slug}`}
        >
          {displayName}
        </h3>
        <p
          className="text-base leading-[1.55] text-ss-tinta mb-4 line-clamp-3 flex-1"
          data-testid={`text-industry-group-desc-${group.slug}`}
        >
          {displayDescription}
        </p>
        <span
          className="inline-flex items-center gap-2 text-[15px] font-semibold text-ss-marino"
          data-testid={`link-industry-group-${group.slug}`}
        >
          <span className="text-[15px] group-hover:underline decoration-1 underline-offset-4">{learnMoreText}</span>
          <span aria-hidden="true" className="text-[15px] inline-block transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">→</span>
        </span>
      </article>
    </Link>
  );
}

export default function IndustryGroups() {
  const { language } = useLanguage();

  const { data: industryGroups, isLoading, error } = useQuery<IndustryGroup[]>({
    queryKey: ["/api/industry-groups"],
  });

  const content: Record<string, { title: string; subtitle: string; errorMessage: string; learnMore: string; searchPlaceholder: string; viewAll: string; noResults: string }> = {
    en: {
      title: "Industry Groups",
      subtitle: "Specialized industry expertise",
      errorMessage: "Failed to load industry groups",
      learnMore: "Learn More",
      searchPlaceholder: "Search...",
      viewAll: "View All",
      noResults: "No results found",
    },
    es: {
      title: "Industrias",
      subtitle: "Experiencia especializada en industrias",
      errorMessage: "Error al cargar las industrias",
      learnMore: "Más información",
      searchPlaceholder: "Buscar...",
      viewAll: "Ver todo",
      noResults: "No se encontraron resultados",
    },
    de: {
      title: "Branchengruppen",
      subtitle: "Spezialisierte Branchenexpertise",
      errorMessage: "Fehler beim Laden der Branchengruppen",
      learnMore: "Mehr erfahren",
      searchPlaceholder: "Suchen...",
      viewAll: "Alle anzeigen",
      noResults: "Keine Ergebnisse gefunden",
    },
    zh: {
      title: "行业领域",
      subtitle: "专业的行业知识",
      errorMessage: "加载行业领域失败",
      learnMore: "了解更多",
      searchPlaceholder: "搜索...",
      viewAll: "查看全部",
      noResults: "未找到结果",
    },
    ko: {
      title: "산업 그룹",
      subtitle: "전문화된 산업 전문성",
      errorMessage: "산업 그룹 로드 실패",
      learnMore: "자세히 알아보기",
      searchPlaceholder: "검색...",
      viewAll: "전체 보기",
      noResults: "결과를 찾을 수 없습니다",
    },
    ja: {
      title: "産業グループ",
      subtitle: "専門的な業界知識",
      errorMessage: "産業グループの読み込みに失敗しました",
      learnMore: "詳しく見る",
      searchPlaceholder: "検索...",
      viewAll: "すべて表示",
      noResults: "結果が見つかりません",
    },
    ar: {
      title: "مجموعات الصناعة",
      subtitle: "خبرة صناعية متخصصة",
      errorMessage: "فشل تحميل مجموعات الصناعة",
      learnMore: "اعرف المزيد",
      searchPlaceholder: "بحث...",
      viewAll: "عرض الكل",
      noResults: "لم يتم العثور على نتائج",
    },
    ru: {
      title: "Отрасли",
      subtitle: "Специализированная отраслевая экспертиза",
      errorMessage: "Не удалось загрузить отраслевые группы",
      learnMore: "Подробнее",
      searchPlaceholder: "Поиск...",
      viewAll: "Смотреть все",
      noResults: "Результаты не найдены",
    },
    fr: {
      title: "Groupes sectoriels",
      subtitle: "Expertise sectorielle spécialisée",
      errorMessage: "Échec du chargement des groupes sectoriels",
      learnMore: "En savoir plus",
      searchPlaceholder: "Rechercher...",
      viewAll: "Voir tout",
      noResults: "Aucun résultat trouvé",
    },
    it: {
      title: "Settori industriali",
      subtitle: "Competenza settoriale specializzata",
      errorMessage: "Impossibile caricare i settori industriali",
      learnMore: "Scopri di più",
      searchPlaceholder: "Cerca...",
      viewAll: "Vedi tutto",
      noResults: "Nessun risultato trovato",
    },
  };

  const editableContent = useCmsContent("industries", content);
  const t = editableContent[language] || editableContent.en;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-industry-groups">
      <SEOHead page="industryGroups" language={language} />
      <Header />
      
      <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-industry-groups-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <Eyebrow num="" tone="navy" className="mb-6" />
            <h1
              className="mb-5"
              data-testid="text-industry-groups-title"
            >
              {t.title}
            </h1>
            <p
              data-testid="text-industry-groups-subtitle"
            >
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <main id="main-content" className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {error ? (
            <div className="py-12" data-testid="container-industry-groups-error">
              <p className="text-base text-ss-medio" data-testid="text-industry-groups-error">
                {t.errorMessage}
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="border-t border-ss-rule pt-6"
                  data-testid={`skeleton-industry-group-${i}`}
                >
                  <Skeleton className="h-8 w-10 mb-4 bg-ss-rule" />
                  <Skeleton className="aspect-[4/3] w-full bg-ss-paper mb-5" />
                  <Skeleton className="h-6 w-3/4 mb-3 bg-ss-rule" />
                  <Skeleton className="h-4 w-full mb-2 bg-ss-rule" />
                  <Skeleton className="h-4 w-24 bg-ss-rule" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
            viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
            >
              {industryGroups?.map((group, idx) => (
                <motion.div key={group.id} variants={itemVariants}>
                  <IndustryGroupCard group={group} index={idx} learnMoreText={t.learnMore} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
