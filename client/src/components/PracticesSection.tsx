import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
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
}

const practiceAreas: PracticeArea[] = [
  { id: 1, nameEn: "Individual & Collective Labor Conflicts", nameEs: "Conflictos Individuales y Colectivos de Trabajo", nameDe: "Individual & Collective Labor Conflicts", nameZh: "Individual & Collective Labor Conflicts", nameKo: "Individual & Collective Labor Conflicts", nameJa: "Individual & Collective Labor Conflicts", nameAr: "Individual & Collective Labor Conflicts", nameRu: "Individual & Collective Labor Conflicts", nameFr: "Individual & Collective Labor Conflicts", nameIt: "Individual & Collective Labor Conflicts", slug: "conflictos-individuales-colectivos" },
  { id: 2, nameEn: "Labor Administration Review", nameEs: "Revisión de la Función de Administración Laboral", nameDe: "Labor Administration Review", nameZh: "Labor Administration Review", nameKo: "Labor Administration Review", nameJa: "Labor Administration Review", nameAr: "Labor Administration Review", nameRu: "Labor Administration Review", nameFr: "Labor Administration Review", nameIt: "Labor Administration Review", slug: "administracion-laboral" },
  { id: 3, nameEn: "Labor Relations Diagnostics", nameEs: "Diagnóstico de Relaciones Laborales", nameDe: "Labor Relations Diagnostics", nameZh: "Labor Relations Diagnostics", nameKo: "Labor Relations Diagnostics", nameJa: "Labor Relations Diagnostics", nameAr: "Labor Relations Diagnostics", nameRu: "Labor Relations Diagnostics", nameFr: "Labor Relations Diagnostics", nameIt: "Labor Relations Diagnostics", slug: "diagnostico-relaciones-laborales" },
  { id: 4, nameEn: "Improvement Plans", nameEs: "Planes de Mejora", nameDe: "Improvement Plans", nameZh: "Improvement Plans", nameKo: "Improvement Plans", nameJa: "Improvement Plans", nameAr: "Improvement Plans", nameRu: "Improvement Plans", nameFr: "Improvement Plans", nameIt: "Improvement Plans", slug: "planes-mejora" },
  { id: 5, nameEn: "Legal-Labor Auditing", nameEs: "Auditoría Jurídico-Laboral", nameDe: "Legal-Labor Auditing", nameZh: "Legal-Labor Auditing", nameKo: "Legal-Labor Auditing", nameJa: "Legal-Labor Auditing", nameAr: "Legal-Labor Auditing", nameRu: "Legal-Labor Auditing", nameFr: "Legal-Labor Auditing", nameIt: "Legal-Labor Auditing", slug: "auditoria-juridico-laboral" },
  { id: 6, nameEn: "Strategic Planning & Training", nameEs: "Planeación Estratégica y Capacitación", nameDe: "Strategic Planning & Training", nameZh: "Strategic Planning & Training", nameKo: "Strategic Planning & Training", nameJa: "Strategic Planning & Training", nameAr: "Strategic Planning & Training", nameRu: "Strategic Planning & Training", nameFr: "Strategic Planning & Training", nameIt: "Strategic Planning & Training", slug: "planeacion-estrategica-capacitacion" },
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
    title: "LABOR PRACTICE AREAS",
    subtitle: "6 SPECIALIZED AREAS",
    intro: "Comprehensive labor law advisory across 6 specialized areas.",
    seeMore: "SEE ALL AREAS",
    ctaText: "Get Legal Advice",
  },
  es: {
    title: "ÁREAS LABORALES",
    subtitle: "6 ÁREAS ESPECIALIZADAS",
    intro: "Asesoría legal laboral integral en 6 áreas especializadas.",
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
    title: language === "es" ? "ÁREAS LABORALES" : "LABOR PRACTICE AREAS",
    subtitle: language === "es" ? "6 ÁREAS ESPECIALIZADAS" : "6 SPECIALIZED AREAS",
    intro: language === "es"
      ? "Asesoría legal laboral integral en 6 áreas especializadas."
      : "Strategic labor-law advisory across 6 specialized areas.",
    seeMore: language === "es" ? "VER TODAS LAS ÁREAS" : "VIEW ALL AREAS",
    ctaText: language === "es" ? "Obtener Asesoría Legal" : "Get Labor Advice",
  };

  return (
    <section
      id="practices"
      className="py-24 lg:py-32 bg-[linear-gradient(135deg,#ffffff_0%,#f7f7fb_46%,#eeeef8_100%)]"
      data-testid="section-practices"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
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
                className="font-heading font-light text-xl md:text-2xl text-foreground uppercase tracking-[0.12em] mb-6"
                data-testid="text-practices-title"
              >
                {t.title}
              </h2>

              {/* Decorative large number */}
              <div className="relative mb-6 select-none pointer-events-none">
                <span className="text-[9rem] leading-none font-heading font-medium text-brand/40 [text-shadow:0_1px_0_rgba(255,255,255,0.9)]">
                  6
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
                    className="rounded-xl bg-brand text-brand-foreground uppercase tracking-wide text-xs w-full sm:w-auto shadow-[0_14px_30px_rgba(32,32,88,0.22)] hover:brightness-95"
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

          {/* Right list column — 2-column grid on desktop */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:w-2/3 card-soft grid grid-cols-1 lg:grid-cols-2 gap-2 p-4 lg:p-6"
          >
            {practiceAreas.map((area) => (
              <motion.div key={area.id} variants={itemVariants}>
                <Link
                  href={`/practice-groups/${area.slug}`}
                  className="group flex items-center gap-6 px-6 py-6 rounded-xl hover:bg-[#202058]/[0.04] transition-all duration-200 h-full"
                  data-testid={`link-practice-${area.id}`}
                >
                  <span
                    className="font-serif text-xl font-semibold text-primary w-12 shrink-0 tabular-nums"
                    data-testid={`text-practice-number-${area.id}`}
                  >
                    {String(area.id).padStart(2, "0")}
                  </span>
                  <span
                    className="flex-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200 leading-snug"
                    data-testid={`text-practice-name-${area.id}`}
                  >
                    {getPracticeAreaName(area, language)}
                  </span>
                  <ArrowRight
                    className="w-4 h-4 text-primary shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>

        </div>

        {/* Mobile-only CTA block — below the list */}
        <div className="lg:hidden mt-10 flex flex-col gap-4">
          <Link href="/contact">
            <Button
              className="rounded-xl bg-brand text-brand-foreground uppercase tracking-wide text-xs w-full"
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
