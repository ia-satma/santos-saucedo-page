import defaults from "@shared/cms-defaults.json";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useLanguage } from "@/contexts/LanguageContext";

export type HeroLabelKey = keyof (typeof defaults.heroLabels)["es"];

export function HeroKicker({ page, testId, light = false }: { page: HeroLabelKey; testId?: string; light?: boolean }) {
  const { language } = useLanguage();
  const labels = useCmsContent("heroLabels", defaults.heroLabels);
  const localized = (labels as Record<string, Partial<Record<HeroLabelKey, string>>>)[language] ?? labels.en;
  const label = localized[page] ?? labels.en[page];

  return (
    <p
      className={`contact-hero-kicker${light ? " contact-hero-kicker--light" : ""}`}
      data-testid={testId}
    >
      {label}
    </p>
  );
}
