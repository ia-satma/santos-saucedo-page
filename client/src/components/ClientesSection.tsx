import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { clienteLogos } from "@/lib/clienteLogos";
import type { LanguageCode } from "@shared/schema";

type ClientesContent = {
  eyebrow: string;
  title: string;
};

const content: Record<LanguageCode, ClientesContent> = {
  es: { eyebrow: "CONFIANZA", title: "Clientes que Confían en Nosotros" },
  en: { eyebrow: "TRUST", title: "Clients Who Trust Us" },
  de: { eyebrow: "VERTRAUEN", title: "Kunden, die uns vertrauen" },
  zh: { eyebrow: "信任", title: "信赖我们的客户" },
  ko: { eyebrow: "신뢰", title: "우리를 신뢰하는 고객" },
  ja: { eyebrow: "信頼", title: "私たちを信頼するクライアント" },
  ar: { eyebrow: "الثقة", title: "عملاء يثقون بنا" },
  ru: { eyebrow: "ДОВЕРИЕ", title: "Клиенты, которые нам доверяют" },
  fr: { eyebrow: "CONFIANCE", title: "Des clients qui nous font confiance" },
  it: { eyebrow: "FIDUCIA", title: "Clienti che si fidano di noi" },
};

function LogoTile({ logo }: { logo: (typeof clienteLogos)[number] }) {
  return (
    <div
      className="shrink-0 w-40 h-24 mx-3 rounded-lg bg-white border border-black/[0.06] shadow-[var(--shadow-sm)] flex items-center justify-center px-5 py-4"
      data-testid={`logo-cliente-${logo.slug}`}
    >
      <img
        src={logo.image}
        alt={logo.name}
        loading="lazy"
        decoding="async"
        className="max-w-full max-h-full w-auto h-auto object-contain"
      />
    </div>
  );
}

export default function ClientesSection() {
  const { language } = useLanguage();
  const t = content[language] || content.en;

  const half = Math.ceil(clienteLogos.length / 2);
  const rowA = clienteLogos.slice(0, half);
  const rowB = clienteLogos.slice(half);

  return (
    <section className="py-24 lg:py-28 section-mist overflow-hidden" data-testid="section-clientes">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <p className="text-primary text-[11px] tracking-[0.28em] uppercase mb-4" data-testid="text-clientes-eyebrow">
            {t.eyebrow}
          </p>
          <h2
            className="font-heading font-light text-2xl md:text-3xl lg:text-4xl text-foreground uppercase tracking-[0.12em] leading-tight"
            data-testid="text-clientes-title"
          >
            {t.title}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="w-10 h-px bg-brand" />
            <div className="w-2 h-2 bg-brand rotate-45" />
            <div className="w-10 h-px bg-brand" />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col gap-4"
        style={{
          maskImage: "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)",
        }}
      >
        <div className="marquee-row overflow-hidden">
          <div className="marquee-track">
            {[...rowA, ...rowA].map((logo, i) => (
              <LogoTile key={`${logo.slug}-${i}`} logo={logo} />
            ))}
          </div>
        </div>
        <div className="marquee-row overflow-hidden">
          <div className="marquee-track marquee-track-reverse">
            {[...rowB, ...rowB].map((logo, i) => (
              <LogoTile key={`${logo.slug}-${i}`} logo={logo} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
