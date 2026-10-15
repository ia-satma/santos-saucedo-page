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
import { Eyebrow } from "@/components/editorial";
import type { PracticeGroup } from "@shared/schema";

// Texto de origen en inglés mostrado en otro idioma (sin traducción, o en el sitio estático):
// lleva su propio idioma y dirección, para que :lang() y el algoritmo bidi lo traten como inglés.
const EN_SOURCE = { lang: "en", dir: "ltr" } as const;

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

interface PracticeGroupRowProps {
  group: PracticeGroup;
  index: number;
}

// Fila de filete como #practicas de la portada: subnumeración § 2.n (sección 02 del menú),
// nombre en romana Azul Marino, descripción completa (sin recorte) y flecha. Sin foto: la
// lista tipográfica sustituye a las fotos de archivo. Toda la fila es el enlace.
function PracticeGroupRow({ group, index }: PracticeGroupRowProps) {
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

  const isOtherLanguage = language !== "es" && language !== "en";
  const nameSource = isOtherLanguage && displayName === group.name ? EN_SOURCE : undefined;
  const descriptionSource = isOtherLanguage && displayDescription === group.description ? EN_SOURCE : undefined;

  const nameId = `practice-name-${group.slug}`;
  const descriptionId = `practice-desc-${group.slug}`;

  return (
    <motion.li
      variants={rowVariants}
      className="ss-row relative border-b border-ss-rule"
      data-testid={`card-practice-group-${group.slug}`}
    >
      {/* inline-link: fuera de la regla móvil de index.css que vuelve inline-flex todo <a>.
          Nombre del enlace = título; la descripción va como descripción accesible. */}
      <Link
        href={`/practice-groups/${group.slug}`}
        aria-labelledby={nameId}
        aria-describedby={descriptionId}
        className="inline-link grid grid-cols-1 gap-y-3 py-8 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-baseline sm:gap-x-8 lg:grid-cols-[88px_minmax(0,5fr)_minmax(0,7fr)_auto] lg:gap-x-12 lg:py-10"
        data-testid={`link-practice-group-${group.slug}`}
      >
        <span aria-hidden="true" className="ss-row-num ss-label ss-num sm:col-start-1 sm:row-start-1">
          § 2.{index + 1}
        </span>
        {/* h2 bajo el h1 de la página; aspecto de fila de prácticas de la portada */}
        <h2
          id={nameId}
          className="ss-display text-[clamp(26px,2.3vw,34px)] font-[420] leading-[1.15] tracking-[-0.012em] text-ss-marino sm:col-start-2 sm:row-start-1"
          data-testid={`text-practice-group-name-${group.slug}`}
          {...nameSource}
        >
          {displayName}
          {showTranslatingIndicator && (
            <Loader2 className="inline-block w-4 h-4 ms-3 align-middle animate-spin text-ss-medio" aria-hidden="true" />
          )}
        </h2>
        <p
          id={descriptionId}
          className="ss-prose max-w-[60ch] text-[17px] text-ss-tinta sm:col-start-2 sm:row-start-2 lg:col-start-3 lg:row-start-1"
          data-testid={`text-practice-group-desc-${group.slug}`}
          {...descriptionSource}
        >
          {displayDescription}
        </p>
        <span aria-hidden="true" className="ss-arrow hidden text-[22px] text-ss-marino sm:block sm:col-start-3 sm:row-start-1 lg:col-start-4">
          →
        </span>
      </Link>
      <span aria-hidden="true" className="ss-row-rule absolute -bottom-px left-0 h-[2px] w-full bg-ss-marino" />
    </motion.li>
  );
}

export default function PracticeGroups() {
  const { language } = useLanguage();

  const { data: practiceGroups, isLoading, error } = useQuery<PracticeGroup[]>({
    queryKey: ["/api/practice-groups"],
  });

  // Subtítulo: de la redacción aprobada (Nuestra firma): una práctica laboral central y
  // tres complementarias. Sustituye a "cubre todas las principales áreas legales".
  const content: Record<string, { title: string; subtitle: string; errorMessage: string; learnMore: string; searchPlaceholder: string; viewAll: string; noResults: string }> = {
    en: {
      title: "Practice Groups",
      subtitle: "Around its labor practice, the firm has developed three complementary practices: corporate and contractual, immigration, and litigation.",
      errorMessage: "Failed to load practice groups",
      learnMore: "Learn More",
      searchPlaceholder: "Search...",
      viewAll: "View All",
      noResults: "No results found",
    },
    es: {
      title: "Áreas de práctica",
      subtitle: "Alrededor de su práctica laboral, la firma desarrolló tres prácticas complementarias: corporativa y contractual, migratoria y contenciosa.",
      errorMessage: "Error al cargar las áreas de práctica",
      learnMore: "Más información",
      searchPlaceholder: "Buscar...",
      viewAll: "Ver todo",
      noResults: "No se encontraron resultados",
    },
    de: {
      title: "Praxisbereiche",
      subtitle: "Rund um ihre arbeitsrechtliche Praxis hat die Kanzlei drei ergänzende Praxisbereiche aufgebaut: Gesellschafts- und Vertragsrecht, Migrationsrecht und Prozessführung.",
      errorMessage: "Fehler beim Laden der Praxisbereiche",
      learnMore: "Mehr erfahren",
      searchPlaceholder: "Suchen...",
      viewAll: "Alle anzeigen",
      noResults: "Keine Ergebnisse gefunden",
    },
    zh: {
      title: "业务领域",
      subtitle: "围绕劳动法这一核心业务，本所发展了三个互补的业务领域：公司与合同、移民以及诉讼。",
      errorMessage: "加载业务领域失败",
      learnMore: "了解更多",
      searchPlaceholder: "搜索...",
      viewAll: "查看全部",
      noResults: "未找到结果",
    },
    ko: {
      title: "업무 분야",
      subtitle: "법인은 노동법 업무를 중심으로 회사·계약, 이민, 소송의 세 가지 보완 업무 분야를 갖추고 있습니다.",
      errorMessage: "업무 분야 로드 실패",
      learnMore: "자세히 알아보기",
      searchPlaceholder: "검색...",
      viewAll: "전체 보기",
      noResults: "결과를 찾을 수 없습니다",
    },
    ja: {
      title: "取扱分野",
      subtitle: "当事務所は労働法を中核に、会社法・契約、移民、訴訟の三つの補完的な分野を展開しています。",
      errorMessage: "取扱分野の読み込みに失敗しました",
      learnMore: "詳しく見る",
      searchPlaceholder: "検索...",
      viewAll: "すべて表示",
      noResults: "結果が見つかりません",
    },
    ar: {
      title: "مجالات الممارسة",
      subtitle: "حول ممارسته في قانون العمل، طوّر المكتب ثلاث ممارسات مكمّلة: الشركات والعقود، والهجرة، والتقاضي.",
      errorMessage: "فشل تحميل مجالات الممارسة",
      learnMore: "اعرف المزيد",
      searchPlaceholder: "بحث...",
      viewAll: "عرض الكل",
      noResults: "لم يتم العثور على نتائج",
    },
    ru: {
      title: "Практики",
      subtitle: "Вокруг практики трудового права фирма развила три дополняющие её практики: корпоративную и договорную, миграционную и судебную.",
      errorMessage: "Не удалось загрузить практики",
      learnMore: "Подробнее",
      searchPlaceholder: "Поиск...",
      viewAll: "Смотреть все",
      noResults: "Результаты не найдены",
    },
    fr: {
      title: "Domaines de pratique",
      subtitle: "Autour de sa pratique en droit du travail, le cabinet a développé trois pratiques complémentaires : droit des sociétés et des contrats, immigration et contentieux.",
      errorMessage: "Échec du chargement des domaines de pratique",
      learnMore: "En savoir plus",
      searchPlaceholder: "Rechercher...",
      viewAll: "Voir tout",
      noResults: "Aucun résultat trouvé",
    },
    it: {
      title: "Aree di pratica",
      subtitle: "Attorno alla sua pratica giuslavoristica, lo studio ha sviluppato tre aree complementari: societario e contrattuale, immigrazione e contenzioso.",
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

  return (
    <div className="min-h-screen bg-background" data-testid="page-practice-groups">
      <SEOHead page="practiceGroups" language={language} />
      <Header />

      {/* Encabezado dentro de <main> (el salto al contenido no se salta el h1); el relleno
          del cuerpo va en su propio envoltorio. ss-container: borde de logotipo y pie. */}
      <main id="main-content">
        <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-practice-groups-hero">
          <div className="ss-container">
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

        <div className="py-16 lg:py-20">
          {/* Lista a todo el ancho del contenedor: en escritorio, nombre y descripción en
              columnas; en teléfono, apilados */}
          <div className="ss-container">
            {error ? (
              <div className="py-12" data-testid="container-practice-groups-error">
                <p className="text-base text-ss-medio" data-testid="text-practice-groups-error">
                  {t.errorMessage}
                </p>
              </div>
            ) : isLoading ? (
              <div className="border-t border-ss-rule">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 gap-y-3 border-b border-ss-rule py-8 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-x-8 lg:py-10"
                    data-testid={`skeleton-practice-group-${i}`}
                  >
                    <Skeleton className="h-3 w-10 bg-ss-rule" />
                    <div>
                      <Skeleton className="h-8 w-2/3 max-w-sm mb-4 bg-ss-rule" />
                      <Skeleton className="h-4 w-full max-w-xl mb-2 bg-ss-rule" />
                      <Skeleton className="h-4 w-5/6 max-w-lg bg-ss-rule" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.ol
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="border-t border-ss-rule"
              >
                {practiceGroups?.map((group, idx) => (
                  <PracticeGroupRow key={group.id} group={group} index={idx} />
                ))}
              </motion.ol>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
