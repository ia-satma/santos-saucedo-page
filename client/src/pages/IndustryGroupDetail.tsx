import { useCmsContent } from "@/hooks/useCmsContent";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import { isNativeLanguage } from "@/lib/translationUtils";
import { Eyebrow, LeadParagraph } from "@/components/editorial";
import type { IndustryGroup, PracticeGroup } from "@shared/schema";

interface TranslatedPracticeGroupBadgeProps {
  practiceGroup: PracticeGroup;
  language: string;
}

function TranslatedPracticeGroupBadge({ practiceGroup, language }: TranslatedPracticeGroupBadgeProps) {
  const { translatedFields } = useTranslatedContent({
    contentType: 'practice_group',
    entityId: practiceGroup.id.toString(),
    fields: {
      name: practiceGroup.name,
      nameEs: practiceGroup.nameEs,
    },
    enabled: !isNativeLanguage(language),
  });

  const displayName = translatedFields.name || practiceGroup.name;

  return (
    <li data-testid={`badge-related-practice-${practiceGroup.slug}`}>
      <Link
        href={`/practice-groups/${practiceGroup.slug}`}
        className="group flex w-full items-center justify-between gap-4 py-4 cursor-pointer"
      >
        <span className="font-heading text-[19px] leading-[1.3] text-ss-marino min-w-0 group-hover:underline decoration-1 underline-offset-4">
          {displayName}
        </span>
        <span className="ss-label text-ss-medio shrink-0">
          {language === 'es' ? 'Ver' : 'View'}{" "}
          <span aria-hidden="true" className="ss-label inline-block rtl:-scale-x-100">→</span>
        </span>
      </Link>
    </li>
  );
}

export default function IndustryGroupDetail() {
  const { language } = useLanguage();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: industryGroup, isLoading, error } = useQuery<IndustryGroup>({
    queryKey: [`/api/industry-groups/${slug}`],
    enabled: !!slug,
  });

  const { data: practiceGroups } = useQuery<PracticeGroup[]>({
    queryKey: ["/api/practice-groups"],
  });

  const { translatedFields, isTranslating } = useTranslatedContent({
    contentType: 'industry_group',
    entityId: industryGroup?.id?.toString() || '',
    fields: {
      name: industryGroup?.name,
      nameEs: industryGroup?.nameEs,
      description: industryGroup?.description,
      descriptionEs: industryGroup?.descriptionEs,
      fullDescription: industryGroup?.fullDescription,
      fullDescriptionEs: industryGroup?.fullDescriptionEs,
    },
    enabled: !!industryGroup,
  });

  const translations: Record<string, {
    backToAll: string;
    contactUs: string;
    contactCta: string;
    contactSubtitle: string;
    emailUs: string;
    callUs: string;
    relatedServices: string;
    errorMessage: string;
    loading: string;
    overview: string;
    keyContacts: string;
    relatedIndustries: string;
    relatedPractices: string;
    representativeMatters: string;
    viewProfile: string;
    ourTeam: string;
    aboutIndustry: string;
  }> = {
    en: {
      backToAll: "All Industry Groups",
      contactUs: "Contact Us",
      contactCta: "Contact our team",
      contactSubtitle: "Let our experienced attorneys help you navigate your legal challenges in this industry.",
      emailUs: "Email Us",
      callUs: "Call Us",
      relatedServices: "Related Practice Areas",
      errorMessage: "Industry group not found",
      loading: "Loading...",
      overview: "Overview",
      keyContacts: "Key Contacts",
      relatedIndustries: "Related Industries",
      relatedPractices: "Related Practice Areas",
      representativeMatters: "Representative Matters",
      viewProfile: "View Profile",
      ourTeam: "Our Team",
      aboutIndustry: "About This Industry",
    },
    es: {
      backToAll: "Todas las industrias",
      contactUs: "Contáctenos",
      contactCta: "Contacte a nuestro equipo",
      contactSubtitle: "Permita que nuestros abogados experimentados le ayuden a navegar los desafíos legales de esta industria.",
      emailUs: "Enviar correo",
      callUs: "Llamar",
      relatedServices: "Áreas de práctica relacionadas",
      errorMessage: "Industria no encontrada",
      loading: "Cargando...",
      overview: "Descripción general",
      keyContacts: "Contactos clave",
      relatedIndustries: "Industrias relacionadas",
      relatedPractices: "Áreas de práctica relacionadas",
      representativeMatters: "Casos representativos",
      viewProfile: "Ver perfil",
      ourTeam: "Nuestro equipo",
      aboutIndustry: "Acerca de esta industria",
    },
    de: {
      backToAll: "Zurück zu Branchen",
      contactUs: "Kontakt",
      contactCta: "Kontaktieren Sie unser Team",
      contactSubtitle: "Lassen Sie unsere erfahrenen Anwälte Ihnen bei Ihren rechtlichen Herausforderungen in dieser Branche helfen.",
      emailUs: "E-Mail senden",
      callUs: "Anrufen",
      relatedServices: "Verwandte Praxisbereiche",
      errorMessage: "Branche nicht gefunden",
      loading: "Wird geladen...",
      overview: "Übersicht",
      keyContacts: "Hauptkontakte",
      relatedIndustries: "Verwandte Branchen",
      relatedPractices: "Verwandte Praxisbereiche",
      representativeMatters: "Beispielmandate",
      viewProfile: "Profil anzeigen",
      ourTeam: "Unser Team",
      aboutIndustry: "Über diese Branche",
    },
    zh: {
      backToAll: "返回行业",
      contactUs: "联系我们",
      contactCta: "联系我们的团队",
      contactSubtitle: "让我们经验丰富的律师帮助您应对该行业的法律挑战。",
      emailUs: "发送邮件",
      callUs: "致电",
      relatedServices: "相关业务领域",
      errorMessage: "未找到行业",
      loading: "加载中...",
      overview: "概述",
      keyContacts: "主要联系人",
      relatedIndustries: "相关行业",
      relatedPractices: "相关业务领域",
      representativeMatters: "代表性案例",
      viewProfile: "查看简介",
      ourTeam: "我们的团队",
      aboutIndustry: "关于该行业",
    },
    ko: {
      backToAll: "산업으로 돌아가기",
      contactUs: "문의하기",
      contactCta: "팀에 연락하기",
      contactSubtitle: "경험 풍부한 변호사가 이 산업의 법적 문제 해결을 도와드립니다.",
      emailUs: "이메일 보내기",
      callUs: "전화하기",
      relatedServices: "관련 업무 분야",
      errorMessage: "산업을 찾을 수 없습니다",
      loading: "로딩 중...",
      overview: "개요",
      keyContacts: "주요 연락처",
      relatedIndustries: "관련 산업",
      relatedPractices: "관련 업무 분야",
      representativeMatters: "대표 사례",
      viewProfile: "프로필 보기",
      ourTeam: "우리 팀",
      aboutIndustry: "이 산업에 대해",
    },
    ja: {
      backToAll: "業界に戻る",
      contactUs: "お問い合わせ",
      contactCta: "チームにお問い合わせ",
      contactSubtitle: "この産業における法的課題の解決を経験豊富な弁護士がお手伝いします。",
      emailUs: "メールを送る",
      callUs: "電話する",
      relatedServices: "関連取扱分野",
      errorMessage: "業界が見つかりません",
      loading: "読み込み中...",
      overview: "概要",
      keyContacts: "主要連絡先",
      relatedIndustries: "関連産業",
      relatedPractices: "関連取扱分野",
      representativeMatters: "代表的な案件",
      viewProfile: "プロフィールを見る",
      ourTeam: "私たちのチーム",
      aboutIndustry: "この業界について",
    },
    ar: {
      backToAll: "العودة إلى القطاعات",
      contactUs: "اتصل بنا",
      contactCta: "تواصل مع فريقنا",
      contactSubtitle: "دع محامينا ذوي الخبرة يساعدونك في تحدياتك القانونية في هذه الصناعة.",
      emailUs: "راسلنا",
      callUs: "اتصل بنا",
      relatedServices: "مجالات الممارسة ذات الصلة",
      errorMessage: "القطاع غير موجود",
      loading: "جاري التحميل...",
      overview: "نظرة عامة",
      keyContacts: "جهات الاتصال الرئيسية",
      relatedIndustries: "الصناعات ذات الصلة",
      relatedPractices: "مجالات الممارسة ذات الصلة",
      representativeMatters: "القضايا التمثيلية",
      viewProfile: "عرض الملف الشخصي",
      ourTeam: "فريقنا",
      aboutIndustry: "عن هذا القطاع",
    },
    ru: {
      backToAll: "Назад к отраслям",
      contactUs: "Свяжитесь с нами",
      contactCta: "Связаться с командой",
      contactSubtitle: "Позвольте нашим опытным юристам помочь вам с правовыми вопросами в этой отрасли.",
      emailUs: "Написать",
      callUs: "Позвонить",
      relatedServices: "Связанные практики",
      errorMessage: "Отрасль не найдена",
      loading: "Загрузка...",
      overview: "Обзор",
      keyContacts: "Ключевые контакты",
      relatedIndustries: "Связанные отрасли",
      relatedPractices: "Связанные практики",
      representativeMatters: "Типичные дела",
      viewProfile: "Посмотреть профиль",
      ourTeam: "Наша команда",
      aboutIndustry: "Об этой отрасли",
    },
    fr: {
      backToAll: "Retour aux secteurs",
      contactUs: "Contactez-nous",
      contactCta: "Contactez notre équipe",
      contactSubtitle: "Laissez nos avocats expérimentés vous aider dans vos défis juridiques dans ce secteur.",
      emailUs: "Envoyer un email",
      callUs: "Appeler",
      relatedServices: "Domaines de pratique connexes",
      errorMessage: "Secteur non trouvé",
      loading: "Chargement...",
      overview: "Aperçu",
      keyContacts: "Contacts clés",
      relatedIndustries: "Secteurs connexes",
      relatedPractices: "Domaines de pratique connexes",
      representativeMatters: "Dossiers représentatifs",
      viewProfile: "Voir le profil",
      ourTeam: "Notre équipe",
      aboutIndustry: "À propos de ce secteur",
    },
    it: {
      backToAll: "Torna ai settori",
      contactUs: "Contattaci",
      contactCta: "Contatta il nostro team",
      contactSubtitle: "Lascia che i nostri avvocati esperti ti aiutino con le sfide legali in questo settore.",
      emailUs: "Invia email",
      callUs: "Chiama",
      relatedServices: "Aree di pratica correlate",
      errorMessage: "Settore non trovato",
      loading: "Caricamento...",
      overview: "Panoramica",
      keyContacts: "Contatti principali",
      relatedIndustries: "Settori correlati",
      relatedPractices: "Aree di pratica correlate",
      representativeMatters: "Casi rappresentativi",
      viewProfile: "Vedi profilo",
      ourTeam: "Il nostro team",
      aboutIndustry: "Su questo settore",
    },
  };

  const editableContent = useCmsContent("industry-detail", translations);
  const t = editableContent[language] || editableContent.en;

  if (error) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-industry-group-error">
        <Header />
        {/* Cabecera sticky en flujo: ya no hace falta compensar el header fijo */}
        <main id="main-content" className="pt-16 pb-20 lg:pt-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <h2 className="ss-h2 mb-6" data-testid="text-error-title">
              {t.errorMessage}
            </h2>
            <Link href="/industry-groups">
              <Button variant="outline" data-testid="button-back-to-industry-groups">
                {t.backToAll}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-industry-group-loading">
        <Header />
        <section className="pt-36 pb-20 editorial-page-hero">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <Skeleton className="h-5 w-48 bg-white/10 mb-6" />
            <Skeleton className="h-12 w-64 bg-white/10" />
          </div>
        </section>
        <main id="main-content" className="py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-6 w-5/6 mb-4" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = translatedFields.name || industryGroup?.name;
  const displayDescription = translatedFields.fullDescription || translatedFields.description || industryGroup?.fullDescription || industryGroup?.description;

  const relatedPracticeGroups = practiceGroups?.slice(0, 4);

  return (
    <div className="min-h-screen bg-background" data-testid="page-industry-group-detail">
      <Header />
      
      <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-industry-group-hero">
        {/* Columna de lectura del cuerpo (max-w-4xl): vuelta y titular sobre el mismo borde */}
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Link href="/industry-groups">
              <span
                className="inline-flex items-center gap-2 mb-6 cursor-pointer"
                data-testid="link-back-to-industry-groups"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                {t.backToAll}
              </span>
            </Link>
            {/* Sin ficha con icono junto al titular: el eyebrow "§ ——" conserva su data-testid */}
            <Eyebrow num="" tone="navy" className="mb-4" testId="icon-industry-group-detail" />
            <div>
              <h1
                className="ss-hero-detail"
                data-testid="text-industry-group-title"
              >
                {displayName}
                {isTranslating && (
                  <Loader2 className="inline-block w-5 h-5 ms-3 animate-spin text-white/60" />
                )}
              </h1>
            </div>
          </motion.div>
        </div>
      </section>

      <main id="main-content">
        {/* Description — light band with editorial lead paragraph */}
        <section className="bg-background py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div data-testid="container-industry-group-description">
                {displayDescription && (() => {
                  const paragraphs = displayDescription.split(/\n\s*\n/).filter(Boolean);
                  const [first, ...rest] = paragraphs.length ? paragraphs : [displayDescription];
                  return (
                    <LeadParagraph
                      eyebrow={t.aboutIndustry}
                      firstParagraph={first}
                      restParagraphs={rest}
                      testId="lead-industry-group"
                    />
                  );
                })()}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Áreas de práctica relacionadas: blanco, filete de sección y lista de filetes */}
        {relatedPracticeGroups && relatedPracticeGroups.length > 0 && (
          <section className="bg-background border-t border-ss-rule py-16 lg:py-20" data-testid="section-related-services">
            <div className="max-w-4xl mx-auto px-6 lg:px-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2
                  className="ss-h2-sm mb-6"
                  data-testid="text-related-services-title"
                >
                  {t.relatedServices}
                </h2>
                <ul className="divide-y divide-ss-rule border-y border-ss-rule" data-testid="list-related-practices">
                  {relatedPracticeGroups.map((practiceGroup) => (
                    <TranslatedPracticeGroupBadge
                      key={practiceGroup.id}
                      practiceGroup={practiceGroup}
                      language={language}
                    />
                  ))}
                </ul>
              </motion.div>
            </div>
          </section>
        )}

        {/* Contacto: bloque Hueso, sin iconos */}
        <section className="bg-background pb-16 lg:pb-24">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-ss-paper p-8 lg:p-12"
              data-testid="section-contact-cta"
            >
              <h2
                className="ss-h2-sm mb-3"
                data-testid="text-contact-cta-title"
              >
                {t.contactCta}
              </h2>
              <p
                className="text-base text-ss-tinta mb-6 max-w-2xl"
                data-testid="text-contact-cta-subtitle"
              >
                {t.contactSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button data-testid="button-email-us">
                  {t.emailUs}
                </Button>
                <Button
                  variant="outline"
                  data-testid="button-call-us"
                >
                  {t.callUs}
                </Button>
              </div>
            </motion.section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
