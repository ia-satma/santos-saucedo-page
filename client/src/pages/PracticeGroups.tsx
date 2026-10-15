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
import { getPracticeImage } from "@/lib/practiceIndustryImages";
import { Eyebrow } from "@/components/editorial";
import type { PracticeGroup } from "@shared/schema";

interface PracticeGroupCardProps {
  group: PracticeGroup;
  index: number;
  learnMoreText: string;
}

function PracticeGroupCard({ group, index, learnMoreText }: PracticeGroupCardProps) {
  const { language } = useLanguage();

  const { translatedFields, isLoading, isTranslating } = useTranslatedContent({
    contentType: 'practice_group',
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

  const imageUrl = getPracticeImage(group.slug, group.imageUrl);

  // Fila abierta "Clásica": filete superior, foto en escala de grises (sin color al pasar el
  // cursor ni velo marino), titular en romana Azul Marino, texto de 16 px y enlace de texto.
  return (
    <Link href={`/practice-groups/${group.slug}`}>
      <article
        className="group relative h-full cursor-pointer flex flex-col border-t border-ss-rule pt-6"
        data-testid={`card-practice-group-${group.slug}`}
      >
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
          data-testid={`text-practice-group-name-${group.slug}`}
        >
          {displayName}
        </h3>
        <p
          className="text-base leading-[1.55] text-ss-tinta mb-4 line-clamp-3 flex-1"
          data-testid={`text-practice-group-desc-${group.slug}`}
        >
          {displayDescription}
        </p>
        <span
          className="inline-flex items-center gap-2 text-[15px] font-semibold text-ss-marino"
          data-testid={`link-practice-group-${group.slug}`}
        >
          <span className="text-[15px] group-hover:underline decoration-1 underline-offset-4">{learnMoreText}</span>
          <span aria-hidden="true" className="text-[15px] inline-block transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">→</span>
        </span>
      </article>
    </Link>
  );
}

export default function PracticeGroups() {
  const { language } = useLanguage();

  const { data: practiceGroups, isLoading, error } = useQuery<PracticeGroup[]>({
    queryKey: ["/api/practice-groups"],
  });

  const content: Record<string, { title: string; subtitle: string; errorMessage: string; learnMore: string; searchPlaceholder: string; viewAll: string; noResults: string }> = {
    en: {
      title: "Practice Groups",
      subtitle: "Our expertise covers all major legal areas",
      errorMessage: "Failed to load practice groups",
      learnMore: "Learn More",
      searchPlaceholder: "Search...",
      viewAll: "View All",
      noResults: "No results found",
    },
    es: {
      title: "Áreas de práctica",
      subtitle: "Nuestra experiencia cubre todas las principales áreas legales",
      errorMessage: "Error al cargar las áreas de práctica",
      learnMore: "Más información",
      searchPlaceholder: "Buscar...",
      viewAll: "Ver todo",
      noResults: "No se encontraron resultados",
    },
    de: {
      title: "Praxisbereiche",
      subtitle: "Unsere Expertise deckt alle wichtigen Rechtsgebiete ab",
      errorMessage: "Fehler beim Laden der Praxisbereiche",
      learnMore: "Mehr erfahren",
      searchPlaceholder: "Suchen...",
      viewAll: "Alle anzeigen",
      noResults: "Keine Ergebnisse gefunden",
    },
    zh: {
      title: "业务领域",
      subtitle: "我们的专业覆盖所有主要法律领域",
      errorMessage: "加载业务领域失败",
      learnMore: "了解更多",
      searchPlaceholder: "搜索...",
      viewAll: "查看全部",
      noResults: "未找到结果",
    },
    ko: {
      title: "업무 분야",
      subtitle: "우리의 전문성은 모든 주요 법률 분야를 아우릅니다",
      errorMessage: "업무 분야 로드 실패",
      learnMore: "자세히 알아보기",
      searchPlaceholder: "검색...",
      viewAll: "전체 보기",
      noResults: "결과를 찾을 수 없습니다",
    },
    ja: {
      title: "取扱分野",
      subtitle: "当事務所の専門性はすべての主要な法律分野をカバーしています",
      errorMessage: "取扱分野の読み込みに失敗しました",
      learnMore: "詳しく見る",
      searchPlaceholder: "検索...",
      viewAll: "すべて表示",
      noResults: "結果が見つかりません",
    },
    ar: {
      title: "مجالات الممارسة",
      subtitle: "خبرتنا تغطي جميع المجالات القانونية الرئيسية",
      errorMessage: "فشل تحميل مجالات الممارسة",
      learnMore: "اعرف المزيد",
      searchPlaceholder: "بحث...",
      viewAll: "عرض الكل",
      noResults: "لم يتم العثور على نتائج",
    },
    ru: {
      title: "Практики",
      subtitle: "Наша экспертиза охватывает все основные области права",
      errorMessage: "Не удалось загрузить практики",
      learnMore: "Подробнее",
      searchPlaceholder: "Поиск...",
      viewAll: "Смотреть все",
      noResults: "Результаты не найдены",
    },
    fr: {
      title: "Domaines de pratique",
      subtitle: "Notre expertise couvre tous les principaux domaines juridiques",
      errorMessage: "Échec du chargement des domaines de pratique",
      learnMore: "En savoir plus",
      searchPlaceholder: "Rechercher...",
      viewAll: "Voir tout",
      noResults: "Aucun résultat trouvé",
    },
    it: {
      title: "Aree di pratica",
      subtitle: "La nostra competenza copre tutte le principali aree legali",
      errorMessage: "Impossibile caricare le aree di pratica",
      learnMore: "Scopri di più",
      searchPlaceholder: "Cerca...",
      viewAll: "Vedi tutto",
      noResults: "Nessun risultato trovato",
    },
  };

  const t = content[language] || content.en;

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
    <div className="min-h-screen bg-background" data-testid="page-practice-groups">
      <SEOHead page="practiceGroups" language={language} />
      <Header />
      
      <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-practice-groups-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <Eyebrow num="02" tone="navy" className="mb-6" />
            <h1
              className="mb-5"
              data-testid="text-practice-groups-title"
            >
              {t.title}
            </h1>
            <p
              data-testid="text-practice-groups-subtitle"
            >
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <main id="main-content" className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {error ? (
            <div className="py-12" data-testid="container-practice-groups-error">
              <p className="text-base text-ss-medio" data-testid="text-practice-groups-error">
                {t.errorMessage}
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12 max-w-4xl">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border-t border-ss-rule pt-6"
                  data-testid={`skeleton-practice-group-${i}`}
                >
                  <Skeleton className="aspect-[4/3] w-full bg-ss-paper mb-5" />
                  <Skeleton className="h-6 w-3/4 mb-3 bg-ss-rule" />
                  <Skeleton className="h-4 w-full mb-2 bg-ss-rule" />
                  <Skeleton className="h-4 w-5/6 mb-4 bg-ss-rule" />
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
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12 max-w-4xl"
            >
              {practiceGroups?.map((group, idx) => (
                <motion.div key={group.id} variants={itemVariants}>
                  <PracticeGroupCard group={group} index={idx} learnMoreText={t.learnMore} />
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
