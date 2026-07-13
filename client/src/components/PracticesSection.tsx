import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { getPracticeImage } from "@/lib/practiceIndustryImages";
import bgWaves from "@assets/pdf2026/bg-waves-gray.webp";
import type { LanguageCode } from "@shared/schema";

interface PracticeArea {
  id: number;
  nameEn: string;
  nameEs: string;
  nameDe: string;
  nameZh: string;
  nameKo: string;
  nameJa: string;
  nameAr: string;
  nameRu: string;
  nameFr: string;
  nameIt: string;
  slug: string;
  iconName: string;
}

const practiceAreas: PracticeArea[] = [
  { id: 1, nameEn: "Labor & Social Security", nameEs: "Laboral y Seguridad Social", nameDe: "Labor & Social Security", nameZh: "Labor & Social Security", nameKo: "Labor & Social Security", nameJa: "Labor & Social Security", nameAr: "Labor & Social Security", nameRu: "Labor & Social Security", nameFr: "Labor & Social Security", nameIt: "Labor & Social Security", slug: "laboral-seguridad-social", iconName: "shield-check" },
  { id: 2, nameEn: "Corporate & Contractual", nameEs: "Corporativo y Contractual", nameDe: "Corporate & Contractual", nameZh: "Corporate & Contractual", nameKo: "Corporate & Contractual", nameJa: "Corporate & Contractual", nameAr: "Corporate & Contractual", nameRu: "Corporate & Contractual", nameFr: "Corporate & Contractual", nameIt: "Corporate & Contractual", slug: "corporativo-contractual", iconName: "building-2" },
  { id: 3, nameEn: "Immigration", nameEs: "Migratorio", nameDe: "Immigration", nameZh: "Immigration", nameKo: "Immigration", nameJa: "Immigration", nameAr: "Immigration", nameRu: "Immigration", nameFr: "Immigration", nameIt: "Immigration", slug: "migratorio", iconName: "globe" },
  { id: 4, nameEn: "Contentious Litigation", nameEs: "Litigio Contencioso", nameDe: "Contentious Litigation", nameZh: "Contentious Litigation", nameKo: "Contentious Litigation", nameJa: "Contentious Litigation", nameAr: "Contentious Litigation", nameRu: "Contentious Litigation", nameFr: "Contentious Litigation", nameIt: "Contentious Litigation", slug: "litigio-contencioso", iconName: "gavel" },
];

interface PracticesContent {
  title: string;
  subtitle: string;
  intro: string;
  seeMore: string;
  ctaText: string;
}

const content: Record<LanguageCode, PracticesContent> = {
  en: {
    title: "AREAS OF SPECIALTY",
    subtitle: "4 AREAS OF SPECIALTY",
    intro: "Human-capital administration and legal defense, across 4 areas of specialty rooted in labor law.",
    seeMore: "SEE ALL AREAS",
    ctaText: "Get Legal Advice",
  },
  es: {
    title: "ÁREAS DE ESPECIALIDAD",
    subtitle: "4 ÁREAS DE ESPECIALIDAD",
    intro: "Administración del capital humano y defensa legal, en 4 áreas de especialidad con raíz laboral.",
    seeMore: "VER TODAS LAS ÁREAS",
    ctaText: "Obtener Asesoría Legal",
  },
  de: {
    title: "PRAXISBEREICHE",
    subtitle: "18 SPEZIALISIERTE BEREICHE",
    intro: "Umfassende Rechtsdienstleistungen in 18 spezialisierten Bereichen.",
    seeMore: "ALLE BEREICHE ANZEIGEN",
    ctaText: "Rechtsberatung Anfordern",
  },
  zh: {
    title: "业务领域",
    subtitle: "18个专业领域",
    intro: "涵盖18个专业领域的综合法律服务。",
    seeMore: "查看所有业务领域",
    ctaText: "获取法律咨询",
  },
  ko: {
    title: "업무 분야",
    subtitle: "18개 전문 분야",
    intro: "18개 전문 분야에 걸친 종합 법률 서비스.",
    seeMore: "모든 업무 분야 보기",
    ctaText: "법률 상담 받기",
  },
  ja: {
    title: "プラクティス分野",
    subtitle: "18の専門分野",
    intro: "18の専門分野にわたる包括的な法律サービス。",
    seeMore: "すべての分野を見る",
    ctaText: "法律相談を受ける",
  },
  ar: {
    title: "مجالات الممارسة",
    subtitle: "18 تخصصاً متكاملاً",
    intro: "خدمات قانونية شاملة في 18 تخصصاً متكاملاً.",
    seeMore: "عرض جميع المجالات",
    ctaText: "احصل على استشارة قانونية",
  },
  ru: {
    title: "ПРАКТИКИ",
    subtitle: "18 СПЕЦИАЛИЗАЦИЙ",
    intro: "Комплексные юридические услуги по 18 специализациям.",
    seeMore: "ВСЕ ПРАКТИКИ",
    ctaText: "Получить консультацию",
  },
  fr: {
    title: "DOMAINES D'EXPERTISE",
    subtitle: "18 DISCIPLINES SPÉCIALISÉES",
    intro: "Services juridiques complets dans 18 disciplines spécialisées.",
    seeMore: "VOIR TOUS LES DOMAINES",
    ctaText: "Obtenir un Conseil Juridique",
  },
  it: {
    title: "AREE DI PRATICA",
    subtitle: "18 DISCIPLINE SPECIALIZZATE",
    intro: "Servizi legali completi in 18 discipline specializzate.",
    seeMore: "VEDI TUTTE LE AREE",
    ctaText: "Richiedi Consulenza Legale",
  },
};

function getPracticeAreaName(area: PracticeArea, language: LanguageCode): string {
  const nameMap: Record<LanguageCode, string> = {
    en: area.nameEn,
    es: area.nameEs,
    de: area.nameDe,
    zh: area.nameZh,
    ko: area.nameKo,
    ja: area.nameJa,
    ar: area.nameAr,
    ru: area.nameRu,
    fr: area.nameFr,
    it: area.nameIt,
  };
  return nameMap[language] || area.nameEn;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function PracticesSection() {
  const { language } = useLanguage();
  const baseT = content[language] || content.en;
  const t = {
    ...baseT,
    title: language === "es" ? "ÁREAS DE ESPECIALIDAD" : "AREAS OF SPECIALTY",
    subtitle: language === "es" ? "4 ÁREAS DE ESPECIALIDAD" : "4 AREAS OF SPECIALTY",
    intro: language === "es"
      ? "Administración del capital humano y defensa legal, en 4 áreas de especialidad con raíz laboral."
      : "Human-capital administration and legal defense, across 4 areas of specialty rooted in labor law.",
    seeMore: language === "es" ? "VER TODAS LAS ÁREAS" : "VIEW ALL AREAS",
    ctaText: language === "es" ? "Obtener Asesoría Legal" : "Get Legal Advice",
  };

  return (
    <section
      id="practices"
      className="relative overflow-hidden py-24 lg:py-32 section-ambient"
      data-testid="section-practices"
    >
      {/* flowing wave-lines texture from the 2026 presentation, light mode only */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-multiply dark:hidden"
        aria-hidden="true"
        style={{ backgroundImage: `url(${bgWaves})`, backgroundSize: "cover", backgroundPosition: "60% 40%" }}
      />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:gap-20">

          {/* Left editorial identity column */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:w-1/3 mb-12 lg:mb-0"
          >
            <div className="flex flex-col">
              {/* Brand accent rule */}
              <div className="w-12 h-0.5 bg-brand mb-6" />

              {/* Serif section heading — Playfair Display */}
              <h2
                className="font-heading font-medium text-2xl md:text-3xl text-foreground uppercase tracking-[0.12em] mb-6"
                data-testid="text-practices-title"
              >
                {t.title}
              </h2>

              {/* Decorative large number */}
              <div className="relative mb-6 select-none pointer-events-none">
                <span className="text-[7rem] leading-none font-heading font-medium text-brand [text-shadow:0_1px_0_rgba(255,255,255,0.9)]">
                  4
                </span>
              </div>

              {/* Intro sentence */}
              <p className="text-sm text-foreground leading-relaxed mb-10 max-w-xs">
                {t.intro}
              </p>

              {/* CTAs */}
              <div className="flex flex-col gap-4">
                <Link href="/contact">
                  <Button
                    variant="brand"
                    className="uppercase tracking-wide text-xs w-full sm:w-auto shadow-[0_14px_30px_rgba(18,16,62,0.22)]"
                    data-testid="button-practices-contact"
                  >
                    <Phone className="w-3.5 h-3.5 mr-2" />
                    {t.ctaText}
                  </Button>
                </Link>
                <Link
                  href="/practice-groups"
                  className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.12em] uppercase text-primary/75 hover:text-primary transition-colors duration-200 group"
                  data-testid="link-practices-see-more"
                >
                  {t.seeMore}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right column — 4 area cards (photo + icon + label), 2x2 on desktop */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5"
          >
            {practiceAreas.map((area) => {
              const Icon = getIcon(area.iconName);
              return (
                <motion.div key={area.id} variants={itemVariants}>
                  <Link
                    href={`/practice-groups/${area.slug}`}
                    className="group relative block overflow-hidden rounded-lg shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-xl)] transition-shadow duration-300"
                    data-testid={`link-practice-${area.id}`}
                  >
                    <div className="relative aspect-[4/3]">
                      <img
                        src={getPracticeImage(area.slug)}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,17,110,0.15)_0%,rgba(18,17,110,0.55)_100%)]" aria-hidden="true" />
                      <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-primary/40 flex items-center justify-center ring-1 ring-white/25">
                        <Icon className="w-4 h-4 text-white" strokeWidth={1.75} aria-hidden="true" />
                      </div>
                    </div>
                    <div className="bg-primary px-4 py-3 flex items-center justify-between gap-2">
                      <span
                        className="text-white text-xs sm:text-[13px] font-bold uppercase tracking-[0.06em] leading-snug"
                        data-testid={`text-practice-name-${area.id}`}
                      >
                        {getPracticeAreaName(area, language)}
                      </span>
                      <ArrowRight
                        className="w-4 h-4 text-brand shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

        </div>

        {/* Mobile-only CTA block — below the list */}
        <div className="lg:hidden mt-10 flex flex-col gap-4">
          <Link href="/contact">
            <Button
              variant="brand"
              className="uppercase tracking-wide text-xs w-full"
              data-testid="button-practices-contact-mobile"
            >
              <Phone className="w-3.5 h-3.5 mr-2" />
              {t.ctaText}
            </Button>
          </Link>
          <Link
            href="/practice-groups"
            className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.12em] uppercase text-primary/75 hover:text-primary transition-colors duration-200 group"
            data-testid="link-practices-see-more-mobile"
          >
            {t.seeMore}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

      </div>
    </section>
  );
}
