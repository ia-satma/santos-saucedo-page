import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import type { LanguageCode } from "@shared/schema";

// Anonymous team photo mosaic — matches the "Nuestro Equipo" page of the 2026
// presentation deck, which shows the full team as an unlabeled photo grid
// (no individual names/captions). Intentionally decoupled from the named
// Socios/Asociados roster below: these photos have no confirmed name mapping,
// so no identity is asserted for any specific photo here.
const photoModules = import.meta.glob("../../../attached_assets/pdf2026/equipo/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;
const photos = Object.keys(photoModules)
  .sort()
  .map((key) => photoModules[key]);

type Content = { eyebrow: string; title: string; subtitle: string };

const content: Record<LanguageCode, Content> = {
  es: {
    eyebrow: "NUESTRA GENTE",
    title: "Nuestro Equipo",
    subtitle: "Un equipo de abogados especializados, comprometidos con cada cliente.",
  },
  en: {
    eyebrow: "OUR PEOPLE",
    title: "Our Team",
    subtitle: "A team of specialized attorneys, committed to every client.",
  },
  de: { eyebrow: "UNSER TEAM", title: "Unser Team", subtitle: "Ein Team spezialisierter Anwälte, engagiert für jeden Mandanten." },
  zh: { eyebrow: "我们的团队", title: "我们的团队", subtitle: "一支专业律师团队，致力于服务每一位客户。" },
  ko: { eyebrow: "우리 팀", title: "우리 팀", subtitle: "모든 고객을 위해 헌신하는 전문 변호사 팀입니다." },
  ja: { eyebrow: "私たちのチーム", title: "私たちのチーム", subtitle: "すべてのクライアントに献身する専門弁護士チームです。" },
  ar: { eyebrow: "فريقنا", title: "فريقنا", subtitle: "فريق من المحامين المتخصصين، ملتزمون تجاه كل عميل." },
  ru: { eyebrow: "НАША КОМАНДА", title: "Наша команда", subtitle: "Команда специализированных юристов, преданных каждому клиенту." },
  fr: { eyebrow: "NOTRE ÉQUIPE", title: "Notre Équipe", subtitle: "Une équipe d'avocats spécialisés, engagés envers chaque client." },
  it: { eyebrow: "IL NOSTRO TEAM", title: "Il Nostro Team", subtitle: "Un team di avvocati specializzati, impegnati per ogni cliente." },
};

export default function NuestroEquipoSection() {
  const { language } = useLanguage();
  const t = content[language] || content.en;

  if (photos.length === 0) return null;

  return (
    <section className="py-20 lg:py-24 bg-background" data-testid="section-nuestro-equipo">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-10 lg:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-brand shrink-0" />
            <span className="text-brand text-[11px] font-bold tracking-[0.25em] uppercase">{t.eyebrow}</span>
            <div className="w-8 h-px bg-brand shrink-0" />
          </div>
          <h2 className="font-heading font-medium text-2xl md:text-3xl text-foreground mb-3" data-testid="text-nuestro-equipo-title">
            {t.title}
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">{t.subtitle}</p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 sm:gap-2"
        >
          {photos.map((src, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-md aspect-square"
              data-testid={`img-equipo-${i}`}
            >
              <img
                src={src}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
