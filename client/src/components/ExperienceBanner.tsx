import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import bgSNavy from "@assets/pdf2026/bg-s-navy.webp";
import type { LanguageCode } from "@shared/schema";

type ContentItem = {
  text: string;
};

const content: Record<LanguageCode, ContentItem> = {
  en: {
    text: "Santos & Saucedo Abogados has more than 35 years of experience providing top-quality legal services.",
  },
  es: {
    text: "Santos & Saucedo Abogados tiene más de 35 años de experiencia brindando servicios legales de la más alta calidad.",
  },
  de: {
    text: "Santos & Saucedo Abogados verfügt über mehr als drei Jahrzehnte Erfahrung in der Bereitstellung erstklassiger Rechtsdienstleistungen.",
  },
  zh: {
    text: "Santos & Saucedo Abogados 拥有超过三十年提供优质法律服务的经验。",
  },
  ko: {
    text: "Santos & Saucedo Abogados는 30년 이상의 최고 품질의 법률 서비스 제공 경험을 보유하고 있습니다.",
  },
  ja: {
    text: "Santos & Saucedo Abogadosは、30年以上にわたり最高品質の法律サービスを提供してきた経験があります。",
  },
  ar: {
    text: "تمتلك Santos & Saucedo Abogados أكثر من ثلاثة عقود من الخبرة في تقديم خدمات قانونية عالية الجودة.",
  },
  ru: {
    text: "Santos & Saucedo Abogados имеет более чем тридцатилетний опыт предоставления юридических услуг высочайшего качества.",
  },
  fr: {
    text: "Santos & Saucedo Abogados possède plus de trois décennies d'expérience dans la fourniture de services juridiques de haute qualité.",
  },
  it: {
    text: "Santos & Saucedo Abogados vanta oltre tre decenni di esperienza nella fornitura di servizi legali di alta qualità.",
  },
};

export default function ExperienceBanner() {
  const { language } = useLanguage();
  const t = content[language] || content.en;

  return (
    <section
      className="relative overflow-hidden py-20 lg:py-28 bg-[radial-gradient(circle_at_82%_20%,rgba(18,16,62,0.78)_0%,rgba(16,14,48,0.64)_34%,rgba(10,8,38,0.96)_74%),linear-gradient(135deg,#12116E_0%,#191884_52%,#1E1C92_100%)]"
      data-testid="section-experience-banner"
    >
      <div
        className="absolute inset-0 opacity-30 mix-blend-soft-light"
        aria-hidden="true"
        style={{ backgroundImage: `url(${bgSNavy})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12">
        <div className="w-16 h-1 bg-brand mx-auto mb-8" aria-hidden="true" />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative font-heading font-light text-2xl md:text-4xl lg:text-[44px] text-white text-center leading-tight tracking-[0.04em] drop-shadow-[0_12px_28px_rgba(0,0,0,0.22)]"
          data-testid="text-experience-banner"
        >
          {t.text}
        </motion.p>
      </div>
    </section>
  );
}
