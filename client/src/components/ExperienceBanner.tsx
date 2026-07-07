import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import type { LanguageCode } from "@shared/schema";

type ContentItem = {
  text: string;
};

const content: Record<LanguageCode, ContentItem> = {
  en: {
    text: "Santos & Saucedo Abogados has more than three decades of experience providing top-quality legal services.",
  },
  es: {
    text: "Santos & Saucedo Abogados tiene más de tres décadas de experiencia brindando servicios legales de la más alta calidad.",
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
      className="py-16 lg:py-20 bg-[#202058]"
      data-testid="section-experience-banner"
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-xl md:text-2xl lg:text-3xl font-serif text-white text-center leading-relaxed"
          data-testid="text-experience-banner"
        >
          {t.text}
        </motion.p>
      </div>
    </section>
  );
}
