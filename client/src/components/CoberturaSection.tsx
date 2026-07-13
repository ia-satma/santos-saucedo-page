import { motion } from "framer-motion";
import { MapPin, Building2, Handshake } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import bgSNavy from "@assets/pdf2026/bg-s-navy.webp";
import type { LanguageCode } from "@shared/schema";

type CoberturaContent = {
  eyebrow: string;
  title: string;
  text: string;
  stat: string;
  statLabel: string;
  stat2: string;
  stat2Label: string;
  point1: string;
  point2: string;
};

const content: Record<LanguageCode, CoberturaContent> = {
  es: {
    eyebrow: "ALIANZA NACIONAL",
    title: "Cobertura Nacional",
    text: "Santos & Saucedo es parte de una alianza de firmas legales especializadas en materia laboral patronal con presencia en más de 72 ciudades de la República Mexicana, con las cuales brindamos servicios a nivel nacional.",
    stat: "+72",
    statLabel: "Ciudades de la República Mexicana",
    stat2: "35+",
    stat2Label: "Años de Experiencia",
    point1: "Servicio y cobertura a nivel nacional",
    point2: "Firmas aliadas especializadas en materia laboral patronal",
  },
  en: {
    eyebrow: "NATIONAL ALLIANCE",
    title: "National Coverage",
    text: "Santos & Saucedo is part of an alliance of law firms specialized in employer-side labor matters, with presence in more than 72 cities across Mexico, through which we provide nationwide service.",
    stat: "+72",
    statLabel: "Cities across Mexico",
    stat2: "35+",
    stat2Label: "Years of Experience",
    point1: "Nationwide service and coverage",
    point2: "Allied firms specialized in employer-side labor law",
  },
  de: {
    eyebrow: "NATIONALE ALLIANZ",
    title: "Nationale Abdeckung",
    text: "Santos & Saucedo ist Teil einer Allianz spezialisierter Kanzleien mit Präsenz in mehr als 72 Städten Mexikos und bietet landesweite Betreuung.",
    stat: "+72",
    statLabel: "Städte in Mexiko",
    stat2: "35+",
    stat2Label: "Jahre Erfahrung",
    point1: "Landesweiter Service und Abdeckung",
    point2: "Spezialisierte Partnerkanzleien",
  },
  zh: { eyebrow: "全国联盟", title: "全国覆盖", text: "Santos & Saucedo 是专业劳动法律师事务所联盟的一员，业务遍及墨西哥超过 72 个城市，提供全国性服务。", stat: "+72", statLabel: "墨西哥城市", stat2: "35+", stat2Label: "年经验", point1: "全国范围的服务与覆盖", point2: "专业的合作律所" },
  ko: { eyebrow: "전국 얼라이언스", title: "전국 커버리지", text: "Santos & Saucedo는 멕시코 72개 이상의 도시에 진출한 전문 로펌 연합의 일원으로 전국 서비스를 제공합니다.", stat: "+72", statLabel: "멕시코 도시", stat2: "35+", stat2Label: "년의 경험", point1: "전국 서비스 및 커버리지", point2: "전문 제휴 로펌" },
  ja: { eyebrow: "全国アライアンス", title: "全国カバレッジ", text: "Santos & Saucedoは、メキシコ72都市以上に展開する専門法律事務所アライアンスの一員として、全国規模でサービスを提供します。", stat: "+72", statLabel: "メキシコの都市", stat2: "35+", stat2Label: "年の経験", point1: "全国規模のサービスとカバレッジ", point2: "専門提携事務所" },
  ar: { eyebrow: "تحالف وطني", title: "تغطية وطنية", text: "Santos & Saucedo جزء من تحالف مكاتب محاماة متخصصة بحضور في أكثر من 72 مدينة في المكسيك، نقدم من خلالها خدمات على المستوى الوطني.", stat: "+72", statLabel: "مدينة في المكسيك", stat2: "+35", stat2Label: "عامًا من الخبرة", point1: "خدمة وتغطية على المستوى الوطني", point2: "مكاتب حليفة متخصصة" },
  ru: { eyebrow: "НАЦИОНАЛЬНЫЙ АЛЬЯНС", title: "Национальное покрытие", text: "Santos & Saucedo входит в альянс специализированных юридических фирм с присутствием более чем в 72 городах Мексики, обеспечивая обслуживание по всей стране.", stat: "+72", statLabel: "Городов Мексики", stat2: "35+", stat2Label: "лет опыта", point1: "Обслуживание по всей стране", point2: "Специализированные фирмы-партнёры" },
  fr: { eyebrow: "ALLIANCE NATIONALE", title: "Couverture nationale", text: "Santos & Saucedo fait partie d'une alliance de cabinets spécialisés présents dans plus de 72 villes du Mexique, offrant un service national.", stat: "+72", statLabel: "Villes au Mexique", stat2: "35+", stat2Label: "Ans d'expérience", point1: "Service et couverture nationale", point2: "Cabinets partenaires spécialisés" },
  it: { eyebrow: "ALLEANZA NAZIONALE", title: "Copertura nazionale", text: "Santos & Saucedo fa parte di un'alleanza di studi specializzati presenti in oltre 72 città del Messico, offrendo un servizio a livello nazionale.", stat: "+72", statLabel: "Città in Messico", stat2: "35+", stat2Label: "Anni di esperienza", point1: "Servizio e copertura nazionale", point2: "Studi partner specializzati" },
};

export default function CoberturaSection() {
  const { language } = useLanguage();
  const t = content[language] || content.en;

  return (
    <section
      className="relative overflow-hidden py-24 lg:py-28 text-white bg-[linear-gradient(135deg,#12116E_0%,#191884_52%,#1E1C92_100%)]"
      data-testid="section-cobertura"
    >
      {/* "S" isotype watermark from the 2026 presentation cover */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-soft-light"
        aria-hidden="true"
        style={{ backgroundImage: `url(${bgSNavy})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px bg-brand shrink-0" />
            <span className="text-brand text-[11px] font-bold tracking-[0.25em] uppercase">{t.eyebrow}</span>
          </div>
          <h2 className="font-heading font-medium text-3xl md:text-4xl lg:text-5xl leading-tight mb-6 text-white" data-testid="text-cobertura-title">
            {t.title}
          </h2>
          <p className="text-white/80 leading-relaxed max-w-xl">{t.text}</p>
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-white/85">
              <MapPin className="w-5 h-5 text-brand shrink-0" aria-hidden="true" />
              <span className="text-sm">{t.point1}</span>
            </div>
            <div className="flex items-center gap-3 text-white/85">
              <Handshake className="w-5 h-5 text-brand shrink-0" aria-hidden="true" />
              <span className="text-sm">{t.point2}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex justify-center lg:justify-end"
        >
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="rounded-lg bg-white/[0.06] border-y-2 border-brand px-6 py-10 text-center backdrop-blur-[1px]">
              <div className="font-heading font-bold text-brand leading-none text-5xl md:text-6xl">{t.stat}</div>
              <div className="mt-3 text-[11px] md:text-xs uppercase tracking-[0.16em] text-white/75 leading-relaxed">
                {t.statLabel}
              </div>
            </div>
            <div className="rounded-lg bg-white/[0.06] border-y-2 border-brand px-6 py-10 text-center backdrop-blur-[1px]">
              <div className="font-heading font-bold text-brand leading-none text-5xl md:text-6xl">{t.stat2}</div>
              <div className="mt-3 text-[11px] md:text-xs uppercase tracking-[0.16em] text-white/75 leading-relaxed">
                {t.stat2Label}
              </div>
            </div>
            <div className="col-span-2 flex items-center justify-center gap-2 text-white/50 mt-2">
              <Building2 className="w-4 h-4" aria-hidden="true" />
              <span className="text-[10px] tracking-[0.18em] uppercase">Santos &amp; Saucedo</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
